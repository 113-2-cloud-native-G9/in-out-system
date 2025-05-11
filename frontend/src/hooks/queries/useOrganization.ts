import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '@/services/api/organization';

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
export const useOrganization = (organizationId: string) => {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId),
    queryFn: () => organizationApi.getOrganization(organizationId),
    enabled: !!organizationId,
  });
};

// 獲取組織結構樹
export const useOrganizationTree = () => {
  return useQuery({
    queryKey: organizationKeys.tree(),
    queryFn: () => organizationApi.getOrganizationTree(),
    staleTime: 30 * 60 * 1000,
  });
};
