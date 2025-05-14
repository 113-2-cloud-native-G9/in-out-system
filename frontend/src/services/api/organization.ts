import { fetchWithJwt, HttpMethod } from '@/hooks/apiConfig';
import { Organization } from '@/types';

const BASE_API = '/api/v1';

interface OrganizationListResponse {
  organization: Organization[];
}

interface OrganizationTreeResponse {
  organizations: Organization[];
}

interface UpdateOrganizationTreeRequest {
  organizations: Organization[];
}

export const organizationApi = {
  // 獲取所有組織清單 - GET /api/v1/organizations/list
  getOrganizationList: async (): Promise<Organization[]> => {
    try {
      const response = await fetchWithJwt<OrganizationListResponse>(`${BASE_API}/organizations/list`, HttpMethod.GET);
      console.log('Organization list API response:', response);
      // 解構出 organization 陣列
      return response.organization || [];
    } catch (error) {
      console.error('Failed to get organization list:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null,
      });
      // 重新拋出錯誤，讓 React Query 能夠處理
      throw error;
    }
  },

  // 獲取單一組織資訊 - GET /api/v1/organizations/{organization_id}
  getOrganization: async (organizationId: string): Promise<Organization> => {
    try {
      const response = await fetchWithJwt<Organization>(`${BASE_API}/organizations/${organizationId}`, HttpMethod.GET);
      console.log(`Organization ${organizationId} API response:`, response);
      return response;
    } catch (error) {
      console.error(`Failed to get organization ${organizationId}:`, error);
      throw error;
    }
  },

  // 獲取組織結構樹 - GET /api/v1/organizations
  getOrganizationTree: async (): Promise<Organization[]> => {
    try {
      const response = await fetchWithJwt<OrganizationTreeResponse>(`${BASE_API}/organizations`, HttpMethod.GET);
      console.log('Organization tree API response:', response);
      
      // 解構出 organizations 陣列
      return response.organizations || [];
    } catch (error) {
      console.error('Failed to get organization tree:', error);
      throw error;
    }
  },

  // 更新組織樹 - POST /api/v1/organizations
  updateOrganizationTree: async (data: UpdateOrganizationTreeRequest): Promise<void> => {
    try {
      const response = await fetchWithJwt<void>(`${BASE_API}/organizations`, HttpMethod.POST, data);
      return response;
    } catch (error) {
      console.error('Failed to update organization tree:', error);
      throw error;
    }
  },
};
