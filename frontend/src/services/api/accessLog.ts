import { fetchWithJwt, HttpMethod } from '@/hooks/apiConfig';
import { AccessLog } from '@/types';

const BASE_API = '/api/v1';

export const accessLogApi = {
  // 獲取個人的 access log - GET /api/v1/access-logs
  getPersonalAccessLogs: async (date: string): Promise<AccessLog[]> => {
    return await fetchWithJwt<AccessLog[]>(`${BASE_API}/access-logs?date=${date}`, HttpMethod.GET) || [];
  },

  // 獲取指定員工指定日期的 access log - GET /api/v1/access-logs/employees/{employee_id}?date=<string>
  getEmployeeAccessLogsByDate: async (employeeId: string, date: string): Promise<AccessLog[]> => {
    return await fetchWithJwt<AccessLog[]>(
      `${BASE_API}/access-logs/employees/${employeeId}?date=${date}`, 
      HttpMethod.GET
    ) || [];
  },

  // 獲取指定員工的所有 access log - GET /api/v1/access-logs/employees/{employee_id}
  getEmployeeAccessLogs: async (employeeId: string): Promise<AccessLog[]> => {
    return await fetchWithJwt<AccessLog[]>(`${BASE_API}/access-logs/employees/${employeeId}`, HttpMethod.GET) || [];
  },

  // 創建個人 access log (模擬刷卡) - POST /api/v1/pubsub/access-logs
  createAccessLog: async (data: {
    gate_id: string;
    access_time?: string;
  }): Promise<void> => {
    await fetchWithJwt(`${BASE_API}/pubsub/access-logs`, HttpMethod.POST, data);
  },
};
