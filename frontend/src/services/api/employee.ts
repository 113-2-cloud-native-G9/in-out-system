import { fetchWithJwt, HttpMethod } from '@/hooks/apiConfig';
import { Employee, User } from '@/types';

const BASE_API = '/api/v1';

export interface EmployeeCreateData {
  employee_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  organization_id: string;
  job_title: string;
  hire_date: string;
  hire_status: string;
  is_admin: boolean;
  hashed_password: string;
}

export interface EmployeeUpdateData extends Partial<EmployeeCreateData> {
  employee_id: string;
}

export const employeeApi = {
  // 獲取所有員工列表 - GET /api/v1/employee-list
  getEmployeeList: async (): Promise<User[]> => {
    return await fetchWithJwt<User[]>(`${BASE_API}/employee-list`, HttpMethod.GET);
  },

  // 獲取單一員工資訊 - GET /api/v1/employees/{employee_id}
  getEmployee: async (employeeId: string): Promise<Employee> => {
    return await fetchWithJwt<Employee>(`${BASE_API}/employees/${employeeId}`, HttpMethod.GET);
  },

  // 新增員工 - POST /api/v1/employees
  createEmployee: async (data: EmployeeCreateData): Promise<Employee> => {
    return await fetchWithJwt<Employee>(`${BASE_API}/employees`, HttpMethod.POST, data);
  },

  // 編輯員工資訊 - PUT /api/v1/employees/{employee_id}
  updateEmployee: async (employeeId: string, data: EmployeeUpdateData): Promise<Employee> => {
    return await fetchWithJwt<Employee>(`${BASE_API}/employees/${employeeId}`, HttpMethod.PUT, data);
  },

  // 重設密碼 - POST /api/v1/employees/reset-password
  resetPassword: async (data: {
    employee_id: string;
    old_password: string;
    new_password: string;
  }): Promise<void> => {
    await fetchWithJwt(`${BASE_API}/employees/reset-password`, HttpMethod.POST, data);
  },
};
