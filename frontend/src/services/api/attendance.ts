import { fetchWithJwt, HttpMethod } from "@/hooks/apiConfig";
import { AttendanceRecord, EmployeeAttendance } from "@/types";

const BASE_API = "/api/v1";

export const attendanceApi = {
    // 更新考勤記錄 - PUT /api/v1/attendance/update
    updateAttendance: async (): Promise<{
        message: string;
        total: number;
    }> => {
        return await fetchWithJwt(
            `${BASE_API}/attendance/update`,
            HttpMethod.PUT
        );
    },

    // 獲取員工的考勤記錄 - GET /api/v1/attendance/employees/{employee_id}?month=<string>
    getEmployeeAttendance: async (
        employeeId: string,
        month?: string
    ): Promise<EmployeeAttendance> => {
        const params = month ? `?month=${month}` : "";
        return await fetchWithJwt(
            `${BASE_API}/attendance/employees/${employeeId}${params}`,
            HttpMethod.GET
        );
    },

    // 獲取當前登入員工的考勤記錄（使用相同的 API）
    getPersonalAttendance: async (
        employeeId: string,
        month?: string
    ): Promise<EmployeeAttendance> => {
        const params = month ? `?month=${month}` : "";
        return await fetchWithJwt(
            `${BASE_API}/attendance/employees/${employeeId}${params}`,
            HttpMethod.GET
        );
    },

    // 獲取單位下的員工考勤紀錄
    getOrganizationAttendance: async (
        organizationId: string,
        month?: string
    ): Promise<EmployeeAttendance[]> => {
        const params = month ? `?month=${month}` : "";
        return await fetchWithJwt(
            `${BASE_API}/attendance/organizations/${organizationId}${params}`,
            HttpMethod.GET
        );
    },
};
