import { baseFetch, fetchWithJwt, HttpMethod } from "@/hooks/apiConfig";


const API_ENDPOINTS = {
    AUTH_LOGIN: '/api/v1/auth/login',
    GET_EMPLOYEE: '/api/v1/employees/{employee_id}',
    CREATE_EMPLOYEE: '/api/v1/employees',
    EDIT_EMPLOYEE: '/api/v1/employees/{employee_id}',
    RESET_PASSWORD: '/api/v1/employees/reset-password',
};

export const api = {

    login: async (credentials: { employee_id: string; hashed_password: string }) => {
        return baseFetch(API_ENDPOINTS.AUTH_LOGIN, HttpMethod.POST, credentials);
    },

    getEmployee: async (employeeId: string) => {
        const url = API_ENDPOINTS.GET_EMPLOYEE.replace('{employee_id}', employeeId);
        return fetchWithJwt(url, HttpMethod.GET);
    },

    createEmployee: async (data: {
        employee_id: string;       
        first_name: string;      
        last_name: string;         
        email: string;            
        phone_number: string;   
        is_admin: boolean;        
        job_title: string;       
        organization_id: string;   
        hire_date: string;       
        hire_status: 'Active' | 'Inactive' | 'Onleave';
    }) => {
        return fetchWithJwt(API_ENDPOINTS.CREATE_EMPLOYEE, HttpMethod.POST, data);
    },

    editEmployee: async (employeeId: string, data: {    
        first_name: string;      
        last_name: string;         
        email: string;            
        phone_number: string;   
        is_admin: boolean;        
        job_title: string;       
        organization_id: string;   
        hire_date: string;       
        hire_status: 'Active' | 'Inactive' | 'Onleave';
     }) => {
        const url = API_ENDPOINTS.EDIT_EMPLOYEE.replace('{employee_id}', employeeId);
        return fetchWithJwt(url, HttpMethod.PUT, data);
    },

    resetPassword: async (data: {
        original_hashed_password: string,
	    new_hashed_password: string,
    }) => {
        return fetchWithJwt(API_ENDPOINTS.RESET_PASSWORD, HttpMethod.POST, data);
    },
};
