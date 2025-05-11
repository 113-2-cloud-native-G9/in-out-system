import { JSX, useEffect, useState } from "react";
import {
    EarlyDepartureStatus,
    LateArrivalStatus,
    AttendanceStatus,
} from "@/types";
import { usePersonalAttendanceRecords } from "@/hooks/queries/useAttendance";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Calendar,
    DoorClosed,
    Briefcase,
    ClockAlert,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import AccessLogDialog from "@/components/custom/AccessLogDialog";

const AttendancePageWithQuery = () => {
    const [monthFilter, setMonthFilter] = useState<string>(
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    );
    const [statusFilter, setStatusFilter] = useState<string>("All");

    // 使用 React Query hooks
    const { 
        data: attendanceData = [], 
        isLoading: isLoadingRecords, 
        error: recordsError 
    } = usePersonalAttendanceRecords(monthFilter);

    // 計算統計資料
    const statistics = attendanceData.reduce((acc, record) => {
        // 過濾狀態
        if (statusFilter !== "All") {
            const isLate = record.late_arrival_status === LateArrivalStatus.Late;
            const isEarly = record.early_departure_status === EarlyDepartureStatus.Early;
            const isOnTime = !isLate && !isEarly;

            if (
                (statusFilter === "Late" && !isLate) ||
                (statusFilter === "Early departure" && !isEarly) ||
                (statusFilter === "On time" && !isOnTime)
            ) {
                return acc;
            }
        }

        acc.totalAttendance++;
        acc.totalWorkHour += record.total_stay_hours;
        
        if (record.late_arrival_status === LateArrivalStatus.Late) {
            acc.lateCheckIns++;
            acc.lateMinutes += record.late_arrival_minutes;
        }
        
        if (record.early_departure_status === EarlyDepartureStatus.Early) {
            acc.earlyDepartures++;
            acc.earlyMinutes += record.early_departure_minutes;
        }
        
        return acc;
    }, {
        totalAttendance: 0,
        totalWorkHour: 0,
        lateCheckIns: 0,
        lateMinutes: 0,
        earlyDepartures: 0,
        earlyMinutes: 0,
    });

    // 過濾資料
    const filteredData = attendanceData.filter(record => {
        // 過濾狀態
        if (statusFilter === "All") return true;

        const isLate = record.late_arrival_status === LateArrivalStatus.Late;
        const isEarly = record.early_departure_status === EarlyDepartureStatus.Early;
        const isOnTime = !isLate && !isEarly;

        return (
            (statusFilter === "Late" && isLate) ||
            (statusFilter === "Early departure" && isEarly) ||
            (statusFilter === "On time" && isOnTime)
        );
    });

    // 載入狀態處理
    if (isLoadingRecords) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" size={32} />
                <span className="ml-2">載入中...</span>
            </div>
        );
    }

    // 錯誤處理
    if (recordsError) {
        return (
            <div className="text-center text-red-500">
                載入失敗: {recordsError.message}
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col gap-8">
            {/* 標題與篩選器 */}
            <div className="flex justify-between items-center mb-0">
                <h1 className="text-3xl font-bold">Attendance Dashboard</h1>
                <div className="flex gap-4">
                    {/* 月份篩選器 */}
                    <Select
                        value={monthFilter}
                        onValueChange={(value) => setMonthFilter(value)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue>
                                {monthFilter}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                                const year = new Date().getFullYear();
                                const month = i + 1;
                                const value = `${year}-${String(month).padStart(2, '0')}`;
                                const label = new Date(year, i).toLocaleString('default', { month: 'long', year: 'numeric' });
                                return (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>

                    {/* 狀態篩選器 */}
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value)}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue>
                                {statusFilter?.toString() || "Filter by status"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(AttendanceStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 出勤統計資訊 */}
            <div className="flex gap-4 flex-wrap">
                <Card className="min-w-60">
                    <CardHeader>
                        <CardTitle>Total Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">
                            {statistics.totalAttendance}
                        </p>
                        <p className="text-sm text-muted">
                            Total work hours:{" "}
                            {statistics.totalWorkHour.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="min-w-60">
                    <CardHeader>
                        <CardTitle>Late Check-ins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">
                            {statistics.lateCheckIns}
                        </p>
                        <p className="text-sm text-muted">
                            Total late minutes:{" "}
                            {statistics.lateMinutes}
                        </p>
                    </CardContent>
                </Card>
                <Card className="min-w-60">
                    <CardHeader>
                        <CardTitle>Early Departures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">
                            {statistics.earlyDepartures}
                        </p>
                        <p className="text-sm text-muted">
                            Total early minutes:{" "}
                            {statistics.earlyMinutes}
                        </p>
                    </CardContent>
                </Card>
                <AttendanceChart data={filteredData} />
            </div>

            {/* 出勤記錄列表 */}
            <div
                className="flex gap-8 border rounded-md"
                style={{ maxHeight: "calc(100vh - 30rem)" }}
            >
                <AttendanceTable data={filteredData} />
            </div>
        </div>
    );
};

// AttendanceTable 和 AttendanceChart 元件保持原樣（需要從 AttendancePage.tsx 複製過來）
const AttendanceTable = ({ data }: { data: Array<AttendanceRecord> }) => {
    // ... 從 AttendancePage.tsx 複製 AttendanceTable 程式碼
};

const AttendanceChart = ({ data }: { data: Array<AttendanceRecord> }) => {
    // ... 從 AttendancePage.tsx 複製 AttendanceChart 程式碼
};

const AttendanceBar = ({ data }: { data: AttendanceRecord }) => {
    // ... 從 AttendancePage.tsx 複製 AttendanceBar 程式碼
};

export default AttendancePageWithQuery;
