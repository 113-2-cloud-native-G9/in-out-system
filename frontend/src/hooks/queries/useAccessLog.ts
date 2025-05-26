import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accessLogApi } from "@/services/api/accessLog";

// Query Keys
export const accessLogKeys = {
    all: ["accessLog"] as const,
    personal: () => [...accessLogKeys.all, "personal"] as const,
    employee: (employeeId: string) =>
        [...accessLogKeys.all, "employee", employeeId] as const,
    employeeDate: (employeeId: string, date: string) =>
        [...accessLogKeys.all, "employee", employeeId, date] as const,
};

// 獲取個人 access logs
export const usePersonalAccessLogs = (date: string) => {
    return useQuery({
        queryKey: [accessLogKeys.personal(), date],
        queryFn: () => accessLogApi.getPersonalAccessLogs(date),
        select: (data) => data.logs || [], // 確保返回空陣列而不是 undefined
        staleTime: 5 * 60 * 1000, // 5 分鐘
    });
};

// 獲取特定員工的 access logs
export const useEmployeeAccessLogs = (employeeId: string) => {
    return useQuery({
        queryKey: accessLogKeys.employee(employeeId),
        queryFn: () => accessLogApi.getEmployeeAccessLogs(employeeId),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000,
    });
};

// 獲取特定員工指定日期的 access logs
export const useEmployeeAccessLogsByDate = (
    employeeId: string | number,
    date: string
) => {
    const employeeIdStr = String(employeeId);

    return useQuery({
        queryKey: accessLogKeys.employeeDate(employeeIdStr, date),
        queryFn: () =>
            accessLogApi.getEmployeeAccessLogsByDate(employeeIdStr, date),
        enabled: !!employeeId && !!date,
        staleTime: 5 * 60 * 1000,
    });
};

// 創建 access log (刷卡)
export const useCreateAccessLog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { gate_id: string; access_time?: string }) =>
            accessLogApi.createAccessLog(data),
        onSuccess: () => {
            // 使個人 access logs 快取失效
            queryClient.invalidateQueries({
                queryKey: accessLogKeys.personal(),
            });

            // 也可能需要更新考勤記錄
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
        },
    });
};
