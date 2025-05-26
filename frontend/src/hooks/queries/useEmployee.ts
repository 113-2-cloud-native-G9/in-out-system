import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi, EmployeeCreateData, EmployeeUpdateData } from '@/services/api/employee';

// Query Keys
export const employeeKeys = {
  all: ['employee'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: { search?: string; status?: string; organizationId?: string }) => 
    [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

// 獲取所有員工列表
export const useEmployeeList = () => {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: () => employeeApi.getEmployeeList(),
    select: (data) => data.employee_list || [],
    staleTime: 5 * 60 * 1000, // 5 分鐘
  });
};

// 獲取單一員工資訊
export const useEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: employeeKeys.detail(employeeId),
    queryFn: () => employeeApi.getEmployee(employeeId),
    enabled: !!employeeId,
  });
};

// 新增員工
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EmployeeCreateData) => employeeApi.createEmployee(data),
    onSuccess: () => {
      // 使員工列表快取失效
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};

// 更新員工資訊
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: EmployeeUpdateData }) => 
      employeeApi.updateEmployee(employeeId, data),
    onSuccess: (_, { employeeId }) => {
      // 使特定員工的快取失效
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
      // 也使列表快取失效
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};

// 重設密碼
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: {
      employee_id: string;
      old_password: string;
      new_password: string;
    }) => employeeApi.resetPassword(data),
    onSuccess: () => {
      // 可以顯示成功訊息
      alert('密碼重設成功');
    },
    onError: (error) => {
      // 處理錯誤
      alert('密碼重設失敗：' + error.message);
    },
  });
};
