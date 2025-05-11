export {};

declare global {
    interface AttendanceRecord {
        record_id: number;
        report_date: string; // Date as string (e.g., "2025-03-25")
        check_in_time: string; // Datetime as string (e.g., "2025-03-25T08:30:00")
        check_out_time: string; // Datetime as string (e.g., "2025-03-25T17:30:00")
        check_in_gate: string;
        check_out_gate: string;
        total_stay_hours: number;
        late_arrival_status: LateArrivalStatus;
        late_arrival_minutes: number;
        early_departure_status: EarlyDepartureStatus;
        early_departure_minutes: number;
    }

    interface EmployeeAttendance {
        employee_id: string;
        employee_name: string;
        records: AttendanceRecord[];
    }
}
