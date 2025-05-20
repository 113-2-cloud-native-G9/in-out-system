import React, { JSX, useState, useMemo, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { EarlyDepartureStatus, LateArrivalStatus } from "@/types";
import { AttendanceRecord, AttendanceStatistics } from "@/types/attendance";
import {
    Calendar,
    ClockAlert,
    Clock,
    AlertTriangle,
    TrendingDown,
    UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
    AttendanceTable,
    StatCard,
    AttendanceChart,
    getStatusForDay,
} from "@/pages/AttendancePage";

interface AttendanceDialogProps {
    children: React.ReactNode;
    employeeId: string;
    monthFilter: string;
    employeeName: string;
    records: AttendanceRecord[];
}

const calcOverWork = (record: AttendanceRecord) => {
    const checkOut = new Date(record.report_date + " " + record.check_out_time); // 轉換為 Date 物件
    const benchmark = new Date(checkOut); // 複製同一天日期
    benchmark.setHours(17, 30, 0, 0); // 設定到 17:30:00.000
    const diffMs = checkOut.getTime() - benchmark.getTime(); // 計算毫秒差
    const diffHours = Math.max(0, diffMs / (1000 * 60 * 60)); // 計算分鐘差
    return diffHours;
};

export const AttendanceDialog = ({
    children,
    employeeId,
    employeeName,
    monthFilter,
    records,
}: AttendanceDialogProps): JSX.Element => {
    const [open, setOpen] = useState(false);
    // const {
    //     data: attendanceData,
    //     isLoading: isLoadingRecords,
    //     error: recordsError,
    // } = useEmployeeAttendanceRecords(userID, month, open);

    const handleOpenChange = useCallback((open: boolean) => {
        setOpen(open);
    }, []);

    const statistics = useMemo(() => {
        if (!records)
            return {
                totalAttendance: 0,
                totalWorkHour: 0,
                lateCheckIns: 0,
                lateMinutes: 0,
                earlyDepartures: 0,
                earlyMinutes: 0,
                overWorkTime: 0,
                overWorkHours: 0,
            };
        return records.reduce(
            (acc: AttendanceStatistics, record: AttendanceRecord) => {
                acc.totalAttendance++;
                acc.totalWorkHour += record.total_stay_hours;

                if (record.late_arrival_status === LateArrivalStatus.Late) {
                    acc.lateCheckIns++;
                    acc.lateMinutes += record.late_arrival_minutes;
                }

                if (
                    record.early_departure_status === EarlyDepartureStatus.Early
                ) {
                    acc.earlyDepartures++;
                    acc.earlyMinutes += record.early_departure_minutes;
                }

                if (record.check_out_time > "17:30:00") {
                    acc.overWorkTime++;
                    acc.overWorkHours += calcOverWork(record);
                }

                return acc;
            },
            {
                totalAttendance: 0,
                totalWorkHour: 0,
                lateCheckIns: 0,
                lateMinutes: 0,
                earlyDepartures: 0,
                earlyMinutes: 0,
                overWorkTime: 0,
                overWorkHours: 0,
            }
        );
    }, [records]);

    const dialogContent = useMemo(() => {
        return (
            <DialogContent className="min-w-11/12 max-w-11/12 max-h-11/12 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {employeeName}'s Attendance Records
                    </DialogTitle>
                </DialogHeader>
                {/* 優化後統計卡片區塊 */}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <StatCard
                        title="Attendance Days"
                        value={statistics.totalAttendance}
                        icon={<UserCheck />}
                        color="success"
                        suffix=" days"
                        description="Total attendance this month"
                    />
                    <StatCard
                        title="Total Work Hours"
                        value={statistics.totalWorkHour.toFixed(2)}
                        icon={<Clock />}
                        color="primary"
                        suffix=" hrs"
                        description="Total work hours this month"
                    />
                    <StatCard
                        title="Late Arrivals"
                        value={statistics.lateCheckIns}
                        icon={<AlertTriangle />}
                        color="warning"
                        suffix=" times"
                        description={`Total late minutes: ${statistics.lateMinutes}`}
                    />
                    <StatCard
                        title="Early Departures"
                        value={statistics.earlyDepartures}
                        icon={<TrendingDown />}
                        color="destructive"
                        suffix=" times"
                        description={`Total early minutes: ${statistics.earlyMinutes}`}
                    />
                    <StatCard
                        title="Overwork"
                        value={statistics.overWorkTime}
                        icon={<ClockAlert />}
                        color="default"
                        suffix=" times"
                        description={`Total overtime hours: ${statistics.overWorkHours.toFixed(
                            2
                        )}`}
                    />
                </div>

                {/* 出勤圖表與月曆區塊 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AttendanceChart data={records || []} />
                    <Card className="w-full">
                        <CardHeader className="flex flex-row items-center gap-2 pb-2">
                            <Calendar className="text-blue-600" />
                            <CardTitle className="text-lg font-semibold">
                                Attendance Calendar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Calendar Legend */}
                            <div className="flex justify-center gap-6 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    <span className="text-sm">On Time</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <span className="text-sm">Late</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <span className="text-sm">
                                        Early Departure
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                    <span className="text-sm">No Record</span>
                                </div>
                            </div>

                            {/* Days of Week Header */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {[
                                    "Sun",
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                    "Sat",
                                ].map((day, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-center"
                                    >
                                        <span className="text-sm font-medium">
                                            {day}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2 bg-background p-4 rounded-xl border">
                                {(() => {
                                    const date = new Date(monthFilter + "-01"); // First day of selected month
                                    const year = date.getFullYear();
                                    const month = date.getMonth();
                                    const firstDay = new Date(
                                        year,
                                        month,
                                        1
                                    ).getDay(); // Day of week of the first day (0-6)
                                    const daysInMonth = new Date(
                                        year,
                                        month + 1,
                                        0
                                    ).getDate();

                                    // Empty cells for days before the first of month
                                    const emptyCells = Array(firstDay)
                                        .fill(null)
                                        .map((_, i) => (
                                            <div
                                                key={`empty-${i}`}
                                                className="flex flex-col items-center h-10"
                                            ></div>
                                        ));

                                    // Days of the month
                                    const dayCells = Array.from(
                                        { length: daysInMonth },
                                        (_, i) => {
                                            const dayNum = i + 1;
                                            const date = new Date(
                                                year,
                                                month,
                                                dayNum
                                            );
                                            const dayOfWeek = date.getDay();
                                            const isWeekend =
                                                dayOfWeek === 0 ||
                                                dayOfWeek === 6;
                                            const status = getStatusForDay(
                                                dayNum,
                                                records
                                            );
                                            let color = "bg-gray-300";
                                            let statusText = "No Record";

                                            if (status === "onTime") {
                                                color = "bg-green-400";
                                                statusText = "On Time";
                                            } else if (status === "late") {
                                                color = "bg-red-400";
                                                statusText = "Late";
                                            } else if (status === "early") {
                                                color = "bg-yellow-400";
                                                statusText = "Early Departure";
                                            }

                                            return (
                                                <TooltipProvider key={dayNum}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div
                                                                className={`flex flex-col items-center border rounded p-1 ${
                                                                    isWeekend
                                                                        ? ""
                                                                        : "bg-popover/80"
                                                                }`}
                                                            >
                                                                <div
                                                                    className={`w-6 h-6 rounded-full ${color} flex items-center justify-center mb-1`}
                                                                >
                                                                    <span
                                                                        className={`text-xs font-medium ${
                                                                            status !==
                                                                            "none"
                                                                                ? "text-white"
                                                                                : "text-black"
                                                                        }`}
                                                                    >
                                                                        {dayNum}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <div className="text-sm">
                                                                <p className="font-semibold">
                                                                    {date.toLocaleDateString(
                                                                        undefined,
                                                                        {
                                                                            weekday:
                                                                                "long",
                                                                            year: "numeric",
                                                                            month: "long",
                                                                            day: "numeric",
                                                                        }
                                                                    )}
                                                                </p>
                                                                <p>
                                                                    Status:{" "}
                                                                    {statusText}
                                                                </p>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            );
                                        }
                                    );

                                    return [...emptyCells, ...dayCells];
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 出勤記錄表格（Gate 欄位） */}
                <div className="flex gap-8 border rounded-md">
                    <AttendanceTable data={records || []} />
                </div>
            </DialogContent>
        );
    }, [employeeName, records]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            {dialogContent}
        </Dialog>
    );
};
