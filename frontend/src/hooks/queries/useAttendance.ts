import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/services/api/attendance";
import { AttendanceRecord, EmployeeAttendance } from "@/types";
import { useUser } from "@/providers/authProvider";

// Query Keys
export const attendanceKeys = {
    all: ["attendance"] as const,
    update: () => [...attendanceKeys.all, "update"] as const,
    records: () => [...attendanceKeys.all, "records"] as const,
    employeeRecords: (employeeId: string, month?: string) =>
        [...attendanceKeys.records(), employeeId, month] as const,
};

// 更新考勤記錄
export const useUpdateAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => attendanceApi.updateAttendance(),
        onSuccess: () => {
            // 使考勤記錄快取失效
            queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
        },
    });
};

// 獲取個人考勤記錄
export const usePersonalAttendanceRecords = (month?: string) => {
    const { user } = useUser();

    return useQuery({
        queryKey: attendanceKeys.employeeRecords(
            user?.employee_id || "",
            month
        ),
        queryFn: () =>
            attendanceApi.getPersonalAttendance(user!.employee_id, month),
        enabled: !!user?.employee_id,
        select: (data) => data.records, // 只返回 records 陣列
    });
};

// 獲取特定員工的考勤記錄
export const useEmployeeAttendanceRecords = (
    employeeId: string,
    month?: string
) => {
    return useQuery({
        queryKey: attendanceKeys.employeeRecords(employeeId, month),
        queryFn: () => attendanceApi.getEmployeeAttendance(employeeId, month),
        enabled: !!employeeId,
    });
};

// 獲取個人完整考勤資料（包含員工姓名等）
export const usePersonalAttendance = (month?: string) => {
    const { user } = useUser();

    return useQuery({
        queryKey: attendanceKeys.employeeRecords(
            user?.employee_id || "",
            month
        ),
        queryFn: () =>
            attendanceApi.getPersonalAttendance(user!.employee_id, month),
        enabled: !!user?.employee_id,
    });
};

// 獲取單位下的員工考勤紀錄
export const useOrganizationAttendanceRecords = (
    organizationId: string,
    month: string
) => {
    return useQuery({
        queryKey: attendanceKeys.employeeRecords(organizationId, month),
        queryFn: () =>
            attendanceApi.getOrganizationAttendance(organizationId, month),
        enabled: !!organizationId,
    });
};
