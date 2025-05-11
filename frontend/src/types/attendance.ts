import { LateArrivalStatus, EarlyDepartureStatus } from './enums';

export interface AttendanceRecord {
    record_id: string | number;
    employee_id: string;
    report_date: string; // Date as string (e.g., "2025-03-25")
    check_in_time: string; // Time as string (e.g., "08:30:00")
    check_out_time: string; // Time as string (e.g., "17:30:00")
    check_in_gate: string;
    check_out_gate: string;
    total_stay_hours: number;
    late_arrival_status: LateArrivalStatus;
    late_arrival_minutes: number;
    early_departure_status: EarlyDepartureStatus;
    early_departure_minutes: number;
}

export interface EmployeeAttendance {
    employee_id: string;
    employee_name: string;
    records: AttendanceRecord[];
}

export interface AttendanceStatistics {
    totalAttendance: number;
    totalWorkHour: number;
    lateCheckIns: number;
    lateMinutes: number;
    earlyDepartures: number;
    earlyMinutes: number;
}
