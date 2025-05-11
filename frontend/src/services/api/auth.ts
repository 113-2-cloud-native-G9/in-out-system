import { baseFetch, HttpMethod } from '@/hooks/apiConfig';
import { User } from '@/types';

const BASE_API = '/api/v1';

export interface LoginCredentials {
  employee_id: string;
  hashed_password: string;
}

export interface LoginResponse {
  token: string;
  employee: User;
}

export const authApi = {
  // 登入 - 符合後端 /api/v1/auth/login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return await baseFetch<LoginResponse>(`${BASE_API}/auth/login`, HttpMethod.POST, credentials);
  },
};
