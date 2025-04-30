import { LateArrivalStatus, EarlyDepartureStatus } from "@/types";

export const mockAttendance: EmployeeAttendance = {
    employee_id: "E001",
    employee_name: "John Doe",
    records: [
        {
            record_id: 1,
            report_date: "2025-03-25",
            check_in_time: "08:05:00", // 時間格式
            check_out_time: "17:15:00", // 時間格式
            check_in_gate: "Gate A",
            check_out_gate: "Gate B",
            total_stay_hours: 8.17,
            late_arrival_status: LateArrivalStatus.Late,
            late_arrival_minutes: 5,
            early_departure_status: EarlyDepartureStatus.OnTime,
            early_departure_minutes: 0,
        },
        {
            record_id: 2,
            report_date: "2025-03-24",
            check_in_time: "08:00:00", // 時間格式
            check_out_time: "17:30:00", // 時間格式
            check_in_gate: "Gate A",
            check_out_gate: "Gate B",
            total_stay_hours: 8.5,
            late_arrival_status: LateArrivalStatus.OnTime,
            late_arrival_minutes: 0,
            early_departure_status: EarlyDepartureStatus.OnTime,
            early_departure_minutes: 0,
        },
        {
            record_id: 3,
            report_date: "2025-03-23",
            check_in_time: "08:10:00", // 時間格式
            check_out_time: "17:00:00", // 時間格式
            check_in_gate: "Gate C",
            check_out_gate: "Gate A",
            total_stay_hours: 8.0,
            late_arrival_status: LateArrivalStatus.Late,
            late_arrival_minutes: 10,
            early_departure_status: EarlyDepartureStatus.OnTime,
            early_departure_minutes: 0,
        },
        {
            record_id: 4,
            report_date: "2025-03-22",
            check_in_time: "08:00:00", // 時間格式
            check_out_time: "17:30:00", // 時間格式
            check_in_gate: "Gate B",
            check_out_gate: "Gate C",
            total_stay_hours: 8.5,
            late_arrival_status: LateArrivalStatus.OnTime,
            late_arrival_minutes: 0,
            early_departure_status: EarlyDepartureStatus.Early,
            early_departure_minutes: 30,
        },
        {
            record_id: 5,
            report_date: "2025-03-21",
            check_in_time: "08:05:00", // 時間格式
            check_out_time: "17:10:00", // 時間格式
            check_in_gate: "Gate A",
            check_out_gate: "Gate B",
            total_stay_hours: 8.08,
            late_arrival_status: LateArrivalStatus.Late,
            late_arrival_minutes: 5,
            early_departure_status: EarlyDepartureStatus.OnTime,
            early_departure_minutes: 0,
        },
        {
            record_id: 6,
            report_date: "2025-03-20",
            check_in_time: "07:55:00", // 時間格式
            check_out_time: "17:30:00", // 時間格式
            check_in_gate: "Gate A",
            check_out_gate: "Gate C",
            total_stay_hours: 8.58,
            late_arrival_status: LateArrivalStatus.OnTime,
            late_arrival_minutes: 0,
            early_departure_status: EarlyDepartureStatus.OnTime,
            early_departure_minutes: 0,
        },
        {
            record_id: 7,
            report_date: "2025-03-19",
            check_in_time: "08:15:00", // 時間格式
            check_out_time: "17:10:00", // 時間格式
            check_in_gate: "Gate B",
            check_out_gate: "Gate A",
            total_stay_hours: 8.08,
            late_arrival_status: LateArrivalStatus.Late,
            late_arrival_minutes: 15,
            early_departure_status: EarlyDepartureStatus.OnTime,
            early_departure_minutes: 0,
        },
        {
            record_id: 8,
            report_date: "2025-03-18",
            check_in_time: "08:00:00", // 時間格式
            check_out_time: "17:30:00", // 時間格式
            check_in_gate: "Gate C",
            check_out_gate: "Gate B",
            total_stay_hours: 8.5,
            late_arrival_status: LateArrivalStatus.OnTime,
            late_arrival_minutes: 0,
            early_departure_status: EarlyDepartureStatus.Early,
            early_departure_minutes: 20,
        },
        {
            record_id: 9,
            report_date: "2025-03-17",
            check_in_time: "08:10:00", // 時間格式
            check_out_time: "17:00:00", // 時間格式
            check_in_gate: "Gate A",
            check_out_gate: "Gate C",
            total_stay_hours: 8.0,
            late_arrival_status: LateArrivalStatus.Late,
            late_arrival_minutes: 10,
            early_departure_status: EarlyDepartureStatus.OnTime,
            early_departure_minutes: 0,
        },
        {
            record_id: 10,
            report_date: "2025-03-16",
            check_in_time: "07:50:00", // 時間格式
            check_out_time: "17:20:00", // 時間格式
            check_in_gate: "Gate C",
            check_out_gate: "Gate B",
            total_stay_hours: 8.5,
            late_arrival_status: LateArrivalStatus.OnTime,
            late_arrival_minutes: 0,
            early_departure_status: EarlyDepartureStatus.OnTime,
            early_departure_minutes: 0,
        },
    ],
};
