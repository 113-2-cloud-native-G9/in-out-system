import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { organizationApi } from '@/services/api/organization';
import { Organization, User } from '@/types';
import { OrganizationDetail } from '@/services/api/organization';

interface Employee {
  employee_id: string,
  employee_first_name: string,
  employee_last_name: string,
  job_title: string,
  hire_status: string,
  email: string,
  phone_number: string,
  hire_date: string
}

// Query Keys
export const organizationKeys = {
  all: ['organization'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  tree: () => [...organizationKeys.all, 'tree'] as const,
};

// 獲取組織清單
export const useOrganizationList = () => {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: () => organizationApi.getOrganizationList(),
    staleTime: 30 * 60 * 1000, // 30 分鐘
  });
};

// 獲取單一組織資訊
export const useOrganizationDetail = (organizationId: string) => {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId),
    queryFn: () => organizationApi.getOrganization(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 分鐘
  });
};

// 將組織員工項目轉換為 User 類型
export const convertOrganizationEmployeeToUser = (
  employee: Employee,
  organizationId: string,
  organizationName: string
): User => {
  return {
    employee_id: employee.employee_id,
    first_name: employee.employee_first_name,
    last_name: employee.employee_last_name,
    email: employee.email || '',
    phone_number: employee.phone_number || '',
    is_manager: false, // 該信息在組織 API 中不提供
    is_admin: false, // 該信息在組織 API 中不提供
    job_title: employee.job_title || '',
    organization_id: organizationId,
    organization_name: organizationName,
    hire_status: employee.hire_status as "Active" | "Inactive" | "Onleave",
    hire_date: employee.hire_date || '',
  };
};

// 獲取組織的員工列表
export const useOrganizationEmployees = (organizationId: string) => {
  const { data: organizationDetail, isLoading, error } = useOrganizationDetail(organizationId);
  
  // 轉換員工數據為 User 類型
  const employees: User[] = organizationDetail?.employee_list
    ? organizationDetail.employee_list.map(emp => 
        convertOrganizationEmployeeToUser(
          emp as any, // 暫時使用 any 繞過類型檢查
          organizationDetail.organization_id,
          organizationDetail.organization_name
        )
      )
    : [];
  
  return {
    employees,
    organization: organizationDetail,
    isLoading,
    error,
  };
};

// 獲取所有組織及其員工
export const useAllOrganizationsWithEmployees = () => {
  const { data: organizations = [], isLoading: isLoadingOrganizations, error: organizationsError } = useOrganizationList();
  const queryClient = useQueryClient();
  
  // 手動加載所有組織的員工
  const loadAllOrganizationEmployees = async () => {
    const allEmployees: User[] = [];
    
    for (const org of organizations) {
      // 檢查是否已有緩存
      const cachedData = queryClient.getQueryData<OrganizationDetail>(
        organizationKeys.detail(org.organization_id)
      );
      
      if (cachedData?.employee_list) {
        // 使用緩存數據
        allEmployees.push(
          ...cachedData.employee_list.map((emp: any) => 
            convertOrganizationEmployeeToUser(
              emp as any, // 暫時使用 any 繞過類型檢查
              cachedData.organization_id,
              cachedData.organization_name
            )
          )
        );
      } else {
        // 獲取組織詳細信息
        try {
          const orgDetail = await organizationApi.getOrganization(org.organization_id);
          queryClient.setQueryData(organizationKeys.detail(org.organization_id), orgDetail);
          
          if (orgDetail.employee_list) {
            allEmployees.push(
              ...orgDetail.employee_list.map(emp => 
                convertOrganizationEmployeeToUser(
                  emp as any, // 暫時使用 any 繞過類型檢查
                  orgDetail.organization_id,
                  orgDetail.organization_name
                )
              )
            );
          }
        } catch (err) {
          console.error(`Failed to load employees for organization ${org.organization_id}`, err);
        }
      }
    }
    
    return allEmployees;
  };
  
  return {
    organizations,
    loadAllOrganizationEmployees,
    isLoading: isLoadingOrganizations,
    error: organizationsError,
  };
};

// 獲取組織結構樹
export const useOrganizationTree = () => {
  return useQuery({
    queryKey: organizationKeys.tree(),
    queryFn: () => organizationApi.getOrganizationTree(),
    staleTime: 30 * 60 * 1000,
  });
};

// 更新組織樹
export const useUpdateOrganizationTree = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizations: Organization[]) => {
      return organizationApi.updateOrganizationTree({ organizations });
    },
    onSuccess: () => {
      // 更新成功後重新獲取組織樹數據
      queryClient.invalidateQueries({ queryKey: organizationKeys.tree() });
      // 同時讓組織列表快取失效
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      // 讓組織詳細資訊快取失效
      queryClient.invalidateQueries({ queryKey: organizationKeys.details() });
    },
  });
};
