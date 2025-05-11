import { fetchWithJwt, HttpMethod } from '@/hooks/apiConfig';
import { Organization } from '@/types';

const BASE_API = '/api/v1';

export const organizationApi = {
  // 獲取所有組織清單 - GET /api/v1/organizations/list
  getOrganizationList: async (): Promise<Organization[]> => {
    try {
      return await fetchWithJwt<Organization[]>(`${BASE_API}/organizations/list`, HttpMethod.GET);
    } catch (error) {
      console.error('Failed to get organization list:', error);
      return [];
    }
  },

  // 獲取單一組織資訊 - GET /api/v1/organizations/{organization_id}
  getOrganization: async (organizationId: string): Promise<Organization> => {
    return await fetchWithJwt<Organization>(`${BASE_API}/organizations/${organizationId}`, HttpMethod.GET);
  },

  // 獲取組織結構樹 - GET /api/v1/organizations
  getOrganizationTree: async (): Promise<any> => {
    return await fetchWithJwt(`${BASE_API}/organizations`, HttpMethod.GET);
  },
};
