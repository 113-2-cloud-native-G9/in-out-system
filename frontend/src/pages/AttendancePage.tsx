import { JSX, useEffect, useState, useMemo } from "react";
import {
    EarlyDepartureStatus,
    LateArrivalStatus,
    AttendanceStatus,
} from "@/types";
import { mockAttendance } from "@/mocks/attendance";
import { AttendanceRecord, AttendanceStatistics } from "@/types/attendance";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Calendar,
    DoorClosed,
    DoorOpen,
    Briefcase,
    ClockAlert,
    Loader2,
    Users,
    User,
    Clock,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Percent,
    UserCheck,
    UserX,
    Sun,
    Moon,
    LogIn,
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
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
} from "recharts";
import AccessLogDialog from "@/components/custom/AccessLogDialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { usePersonalAttendanceRecords } from "@/hooks/queries";

const AttendancePage = () => {
    const [monthFilter, setMonthFilter] = useState<string>(
        `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
        ).padStart(2, "0")}`
    );
    const [statusFilter, setStatusFilter] = useState<string>("All");

    // 使用 mock 資料
    // const attendanceData = mockAttendance.records;
    // const isLoadingRecords = false;
    // const recordsError = null;

    // 使用 API 獲取考勤資料
    const {
        data: attendanceData,
        isLoading: isLoadingRecords,
        error: recordsError,
    } = usePersonalAttendanceRecords(monthFilter);

    // 計算統計資料
    const statistics = useMemo(() => {
        if (!attendanceData)
            return {
                totalAttendance: 0,
                totalWorkHour: 0,
                lateCheckIns: 0,
                lateMinutes: 0,
                earlyDepartures: 0,
                earlyMinutes: 0,
            };
        return attendanceData.reduce(
            (acc: AttendanceStatistics, record: AttendanceRecord) => {
                // 過濾狀態
                if (statusFilter !== "All") {
                    const isLate =
                        record.late_arrival_status === LateArrivalStatus.Late;
                    const isEarly =
                        record.early_departure_status ===
                        EarlyDepartureStatus.Early;
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

                if (
                    record.early_departure_status === EarlyDepartureStatus.Early
                ) {
                    acc.earlyDepartures++;
                    acc.earlyMinutes += record.early_departure_minutes;
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
            }
        );
    }, [attendanceData, statusFilter]);

    // 過濾資料
    const filteredData = useMemo(() => {
        if (!attendanceData) return [];
        return attendanceData.filter((record: AttendanceRecord) => {
            // 過濾狀態
            if (statusFilter === "All") return true;

            const isLate =
                record.late_arrival_status === LateArrivalStatus.Late;
            const isEarly =
                record.early_departure_status === EarlyDepartureStatus.Early;
            const isOnTime = !isLate && !isEarly;

            return (
                (statusFilter === "Late" && isLate) ||
                (statusFilter === "Early departure" && isEarly) ||
                (statusFilter === "On time" && isOnTime)
            );
        });
    }, [attendanceData, statusFilter]);

    // 載入狀態處理
    if (isLoadingRecords) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" size={32} />
                <span className="ml-2">Loading...</span>
            </div>
        );
    }

    // 錯誤處理
    if (recordsError) {
        return (
            <div className="text-center text-red-500">
                Failed to load attendance data. Please try again later.
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col gap-8">
            {/* Header 區塊 */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold leading-tight mb-1">
                        {new Date().toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </h1>
                </div>
                <div className="flex gap-3 items-center">
                    {/* 月份篩選器 */}
                    <Select
                        value={monthFilter}
                        onValueChange={(value) => setMonthFilter(value)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue>{monthFilter}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                                const year = new Date().getFullYear();
                                const month = i + 1;
                                const value = `${year}-${String(month).padStart(
                                    2,
                                    "0"
                                )}`;
                                const label = new Date(year, i).toLocaleString(
                                    "default",
                                    { month: "long", year: "numeric" }
                                );
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

            {/* 優化後統計卡片區塊 */}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            </div>

            {/* 出勤圖表與月曆區塊 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AttendanceChart data={filteredData} />
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
                                <span className="text-sm">Early Departure</span>
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
                                <div key={i} className="flex justify-center">
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
                                            dayOfWeek === 0 || dayOfWeek === 6;
                                        const status = getStatusForDay(
                                            dayNum,
                                            attendanceData
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
            <div
                className="flex gap-8 border rounded-md"
                style={{ maxHeight: "calc(100vh - 30rem)" }}
            >
                <AttendanceTable data={filteredData} />
            </div>
        </div>
    );
};

const getStatusIcon = (record: AttendanceRecord) => {
    const isLate = record.late_arrival_status === LateArrivalStatus.Late;
    const isEarly =
        record.early_departure_status === EarlyDepartureStatus.Early;
    if (isLate)
        return (
            <AlertTriangle
                className="w-4 h-4 text-red-500 inline-block mr-1"
                aria-label="Late"
            />
        );
    if (isEarly)
        return (
            <ArrowDown
                className="w-4 h-4 text-yellow-500 inline-block mr-1"
                aria-label="Early"
            />
        );
    return (
        <span
            className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"
            aria-label="On time"
        />
    );
};

const getStatusForDay = (date: number, data?: AttendanceRecord[]) => {
    if (!data) return "none";
    const rec = data.find((r) => new Date(r.report_date).getDate() === date);
    if (!rec) return "none";
    if (rec.late_arrival_status === LateArrivalStatus.Late) return "late";
    if (rec.early_departure_status === EarlyDepartureStatus.Early)
        return "early";
    return "onTime";
};

const AttendanceTable = ({ data }: { data: Array<AttendanceRecord> }) => {
    // 依日期排序
    const sortedData = [...data].sort(
        (a, b) =>
            new Date(b.report_date).getTime() -
            new Date(a.report_date).getTime()
    );

    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] =
        useState<AttendanceRecord | null>(null);

    // 點擊行時觸發彈出框
    const handleRowClick = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setOpenDialog(true);
    };

    return (
        <>
            <Table className="border rounded-md">
                <TableHeader className="bg-border">
                    <TableRow>
                        <TableHead className="text-center">Date</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Check-in</TableHead>

                        <TableHead className="text-center">Check-out</TableHead>
                        <TableHead className="text-center">
                            Late (min)
                        </TableHead>
                        <TableHead className="text-center">
                            Early (min)
                        </TableHead>
                        <TableHead className="text-center">
                            Check-in Gate
                        </TableHead>
                        <TableHead className="text-center">
                            Check-out Gate
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.map((record) => (
                        <AccessLogDialog
                            key={record.record_id}
                            date={record.report_date}
                            userID={record.record_id}
                        >
                            <TableRow
                                key={record.record_id}
                                className="hover:bg-blue-50/40 cursor-pointer"
                                onClick={() => handleRowClick(record)}
                            >
                                <TableCell className="text-center">
                                    {new Date(
                                        record.report_date
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-center">
                                    {getStatusIcon(record)}
                                </TableCell>
                                <TableCell className="text-center">
                                    {record.check_in_time}
                                </TableCell>

                                <TableCell className="text-center">
                                    {record.check_out_time}
                                </TableCell>

                                <TableCell className="text-red-600 text-center font-semibold">
                                    {record.late_arrival_minutes > 0
                                        ? record.late_arrival_minutes
                                        : "-"}
                                </TableCell>
                                <TableCell className="text-yellow-500 text-center font-semibold">
                                    {record.early_departure_minutes > 0
                                        ? record.early_departure_minutes
                                        : "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                    {record.check_in_gate}
                                </TableCell>
                                <TableCell className="text-center">
                                    {record.check_out_gate}
                                </TableCell>
                            </TableRow>
                        </AccessLogDialog>
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

const chartColors = {
    Work: "#2563eb", // blue-600
    Late: "#f59e42", // amber-500
    Early: "#ef4444", // red-500
};

const CustomLegend = (props: any) => (
    <div className="flex gap-6 items-center mt-2">
        {props.payload.map((entry: any) => (
            <span key={entry.value} className="flex items-center gap-2 text-sm">
                <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: entry.color }}
                />
                {entry.value === "Work"
                    ? "Work Hours"
                    : entry.value === "Late"
                    ? "Late Minutes"
                    : "Early Minutes"}
            </span>
        ))}
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="rounded-md border bg-background p-3 shadow-md min-w-[120px]">
            <div className="font-semibold mb-1">Day {label}</div>
            {payload.map((item: any) => (
                <div
                    key={item.dataKey}
                    className="flex justify-between text-sm"
                >
                    <span style={{ color: item.color }}>
                        {item.name === "Work" ? "Work" : item.name}:
                    </span>
                    <span>
                        {item.dataKey === "Work"
                            ? `${item.value} hrs`
                            : `${item.value} min`}
                    </span>
                </div>
            ))}
        </div>
    );
};

const AttendanceChart = ({ data }: { data: Array<AttendanceRecord> }) => {
    // 準備圖表資料
    const chartData = data
        .map((record) => ({
            date: new Date(record.report_date).getDate(), // 只取日
            Work: record.total_stay_hours,
            Late: record.late_arrival_minutes,
            Early: record.early_departure_minutes,
        }))
        .sort((a, b) => a.date - b.date);

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Clock className="text-blue-600" />
                <CardTitle className="text-lg font-semibold">
                    Attendance Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        No attendance data for this month.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 13 }}
                                label={{
                                    value: "Day",
                                    position: "insideBottom",
                                    offset: -5,
                                }}
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                tick={{ fontSize: 13 }}
                                axisLine={false}
                                tickLine={false}
                                label={{
                                    value: "Hours",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 10,
                                }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 13 }}
                                axisLine={false}
                                tickLine={false}
                                label={{
                                    value: "Minutes",
                                    angle: 90,
                                    position: "insideRight",
                                    offset: 10,
                                }}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <RechartsLegend content={<CustomLegend />} />
                            <Bar
                                yAxisId="left"
                                dataKey="Work"
                                name="Work"
                                fill={chartColors.Work}
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="Late"
                                name="Late"
                                fill={chartColors.Late}
                                stackId="a"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="Early"
                                name="Early"
                                fill={chartColors.Early}
                                stackId="a"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};

// 新版 AttendanceBar
interface AttendanceSegment {
    type:
        | "earlyArrival"
        | "lateArrival"
        | "workTime"
        | "earlyDeparture"
        | "afterWork";
    duration: number; // 分鐘
    startTime?: string;
    endTime?: string;
}

const typeColorMap = {
    earlyArrival: "bg-blue-600 hover:bg-blue-700",
    lateArrival: "bg-amber-500 hover:bg-amber-600",
    workTime: "bg-green-600 hover:bg-green-700",
    earlyDeparture: "bg-red-500 hover:bg-red-600",
    afterWork: "bg-purple-500 hover:bg-purple-600",
};

const typeLabelMap = {
    earlyArrival: "Early Arrival",
    lateArrival: "Late Arrival",
    workTime: "Work Time",
    earlyDeparture: "Early Departure",
    afterWork: "After Work",
};

function getAttendanceSegments(data: AttendanceRecord): AttendanceSegment[] {
    // 假設上班 07:00~18:00
    const calcTimeDiff = (start: string, end: string) => {
        const s = new Date(`1970-01-01T${start}`);
        const e = new Date(`1970-01-01T${end}`);
        return Math.max(0, Math.floor((e.getTime() - s.getTime()) / 60000));
    };
    const segments: AttendanceSegment[] = [];
    // 早到
    const earlyArrival = calcTimeDiff("08:00", data.check_in_time);
    if (earlyArrival > 0)
        segments.push({
            type: "earlyArrival",
            duration: earlyArrival,
            startTime: "07:00",
            endTime: data.check_in_time,
        });
    // 遲到
    if (data.late_arrival_minutes > 0)
        segments.push({
            type: "lateArrival",
            duration: data.late_arrival_minutes,
        });
    // 工作時間
    segments.push({
        type: "workTime",
        duration: data.total_stay_hours * 60,
        startTime: data.check_in_time,
        endTime: data.check_out_time,
    });
    // 早退
    if (data.early_departure_minutes > 0)
        segments.push({
            type: "earlyDeparture",
            duration: data.early_departure_minutes,
        });
    // 下班後
    const afterWork = calcTimeDiff(data.check_out_time, "17:00");
    if (afterWork > 0)
        segments.push({
            type: "afterWork",
            duration: afterWork,
            startTime: data.check_out_time,
            endTime: "18:00",
        });
    return segments;
}

const AttendanceBar = ({ data }: { data: AttendanceRecord }) => {
    const segments = getAttendanceSegments(data);
    const total = segments.reduce((sum, s) => sum + s.duration, 0);
    const formatDuration = (min: number) => {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${h > 0 ? `${h}h` : ""}${m > 0 ? `${m}m` : ""}`;
    };
    return (
        <div className="w-full min-w-[16rem] flex items-center gap-2">
            <TooltipProvider>
                <div className="flex w-full overflow-hidden rounded-xl bg-slate-100 h-7 shadow-sm">
                    {segments.map((seg, idx) => {
                        const percent = (seg.duration / total) * 100;
                        if (percent < 0.5) return null;
                        return (
                            <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "transition-all duration-200 ease-in-out h-full cursor-pointer",
                                            typeColorMap[seg.type],
                                            idx === 0 ? "rounded-l-xl" : "",
                                            idx === segments.length - 1
                                                ? "rounded-r-xl"
                                                : "",
                                            percent < 3 ? "min-w-[8px]" : "",
                                            "hover:shadow-lg hover:scale-y-110"
                                        )}
                                        style={{ width: `${percent}%` }}
                                    />
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    className="flex flex-col gap-1 p-3 min-w-[120px]"
                                >
                                    <div className="font-semibold text-base">
                                        {typeLabelMap[seg.type]}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {formatDuration(seg.duration)}
                                    </div>
                                    {seg.startTime && seg.endTime && (
                                        <div className="text-xs text-blue-700 font-mono">
                                            {seg.startTime} - {seg.endTime}
                                        </div>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>
            {/* 右側時間標籤 */}
            <div className="text-xs text-blue-700 font-mono ml-2 whitespace-nowrap font-semibold bg-blue-50 rounded px-2 py-0.5 border border-blue-100">
                {data.check_in_time} - {data.check_out_time}
            </div>
        </div>
    );
};

type StatCardColor =
    | "primary"
    | "success"
    | "warning"
    | "destructive"
    | "default";
interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: StatCardColor;
    trend?: number;
    trendLabel?: string;
    suffix?: string;
    description?: string;
}

const colorMap: Record<StatCardColor, string> = {
    primary: "text-blue-600 border-l-blue-600 bg-blue-50",
    success: "text-green-600 border-l-green-600 bg-green-50",
    warning: "text-red-600 border-l-red-600 bg-red-50",
    destructive: "text-yellow-600 border-l-yellow-600 bg-yellow-50",
    default: "text-muted-foreground border-l-muted-foreground bg-muted",
};

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color = "default",
    trend,
    trendLabel,
    suffix,
    description,
}) => {
    const trendIcon =
        trend === undefined ? null : trend > 0 ? (
            <TrendingUp className="inline h-4 w-4" />
        ) : (
            <TrendingDown className="inline h-4 w-4" />
        );
    const trendColor =
        trend === undefined
            ? ""
            : trend > 0
            ? "text-green-600"
            : "text-red-600";
    return (
        <Card
            className={`overflow-hidden border-l-4 ${colorMap[color]} hover:shadow-md transition-all`}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-secondary-foreground">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-full ${colorMap[color]}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${colorMap[color]}`}>
                        {value}
                    </span>
                    {suffix && (
                        <span className="text-secondary-foreground text-sm">
                            {suffix}
                        </span>
                    )}
                    {trend !== undefined && (
                        <span
                            className={`ml-2 flex items-center gap-1 ${trendColor}`}
                        >
                            {trendIcon}
                            {trend > 0 ? "+" : ""}
                            {trend}%
                            {trendLabel && (
                                <span className="text-xs text-secondary-foreground ml-1">
                                    ({trendLabel})
                                </span>
                            )}
                        </span>
                    )}
                </div>
                {description && (
                    <div className="text-xs text-secondary-foreground mt-1">
                        {description}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AttendancePage;
