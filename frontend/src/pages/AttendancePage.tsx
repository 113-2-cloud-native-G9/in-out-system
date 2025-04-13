import { JSX, useEffect, useState } from "react";
import {
    AttendanceRecord,
    EarlyDepartureStatus,
    LateArrivalStatus,
    AttendanceStatus,
} from "@/types";
import { mockAttendance } from "@/mocks/attendance";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Calendar,
    Clock,
    Clock9,
    DoorClosed,
    Briefcase,
    ClockAlert,
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
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import AccessLogDialog from "@/components/custom/AccessLogDialog";

type AttendanceStatistics = {
    totalAttendance: number;
    totalWorkHour: number;
    lateCheckIns: number;
    lateMinutes: number;
    earlyDepartures: number;
    earlyMinutes: number;
};

const AttendancePage = () => {
    const [attendanceData, setAttendanceData] = useState<
        Array<AttendanceRecord>
    >(mockAttendance.records);
    const [displayedData, setDisplayedData] =
        useState<Array<AttendanceRecord>>(attendanceData);
    const [monthFilter, setMonthFilter] = useState<number>(
        new Date().getMonth()
    );
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [attendanceStatistics, setAttendanceStatistics] =
        useState<AttendanceStatistics>({
            totalAttendance: 0,
            totalWorkHour: 0,
            lateCheckIns: 0,
            lateMinutes: 0,
            earlyDepartures: 0,
            earlyMinutes: 0,
        });

    useEffect(() => {
        let filteredData = attendanceData;
        if (statusFilter !== "All") {
            filteredData = filteredData.filter(
                (record) =>
                    (statusFilter === "Late" &&
                        record.late_arrival_status ===
                            LateArrivalStatus.Late) ||
                    (statusFilter === "Early departure" &&
                        record.early_departure_status ===
                            EarlyDepartureStatus.Early) ||
                    (statusFilter === "On time" &&
                        record.late_arrival_status ===
                            LateArrivalStatus.OnTime &&
                        record.early_departure_status ===
                            EarlyDepartureStatus.OnTime)
            );
        }

        setDisplayedData(filteredData);
    }, [statusFilter, attendanceData]);

    useEffect(() => {
        const totalAttendance = displayedData.length;
        const totalWorkHour = displayedData.reduce(
            (acc, record) => acc + record.total_stay_hours,
            0
        );

        const lateCheckIns = displayedData.filter(
            (record) => record.late_arrival_status === LateArrivalStatus.Late
        ).length;
        const lateMinutes = displayedData.reduce(
            (acc, record) => acc + record.late_arrival_minutes,
            0
        );
        const earlyDepartures = displayedData.filter(
            (record) =>
                record.early_departure_status === EarlyDepartureStatus.Early
        ).length;
        const earlyMinutes = displayedData.reduce(
            (acc, record) => acc + record.early_departure_minutes,
            0
        );

        setAttendanceStatistics({
            totalAttendance,
            totalWorkHour,
            lateCheckIns,
            lateMinutes,
            earlyDepartures,
            earlyMinutes,
        });
    }, [attendanceData]);

    return (
        <div className="space-y-6 flex flex-col gap-8">
            {/* 標題與篩選器 */}
            <div className="flex justify-between items-center mb-0">
                <h1 className="text-3xl font-bold">Attendance Dashboard</h1>
                <div>
                    {/* 月份篩選器 */}

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
                            {attendanceStatistics.totalAttendance}
                        </p>
                        <p className="text-sm text-muted">
                            Total work hours:{" "}
                            {attendanceStatistics.totalWorkHour}
                        </p>
                    </CardContent>
                </Card>
                <Card className="min-w-60">
                    <CardHeader>
                        <CardTitle>Late Check-ins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">
                            {attendanceStatistics.lateCheckIns}
                        </p>
                        <p className="text-sm text-muted">
                            Total late minutes:{" "}
                            {attendanceStatistics.lateMinutes}
                        </p>
                    </CardContent>
                </Card>
                <Card className="min-w-60">
                    <CardHeader>
                        <CardTitle>Early Departures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">
                            {attendanceStatistics.earlyDepartures}
                        </p>
                        <p className="text-sm text-muted">
                            Total early minutes:{" "}
                            {attendanceStatistics.earlyMinutes}
                        </p>
                    </CardContent>
                </Card>
                <AttendanceChart data={displayedData} />
            </div>

            {/* 出勤記錄列表 */}
            <div
                className="flex gap-8"
                style={{ maxHeight: "calc(100vh - 30rem)" }}
            >
                <AttendanceTable data={displayedData} />
            </div>
        </div>
    );
};

const AttendanceTable = ({ data }: { data: Array<AttendanceRecord> }) => {
    const [sortField, setSortField] = useState<keyof AttendanceRecord | null>(
        null
    );
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        null
    );
    const [displayedData, setDisplayedData] =
        useState<Array<AttendanceRecord>>(data);

    // Handle sorting logic
    const handleSort = (field: keyof AttendanceRecord): void => {
        if (sortField === field) {
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else if (sortDirection === "desc") {
                setSortDirection(null);
                setSortField(null);
            } else {
                setSortDirection("asc");
            }
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Function to render sort icon
    const renderSortIcon = (
        field: keyof AttendanceRecord
    ): JSX.Element | null => {
        if (sortField !== field) {
            return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
        }

        if (sortDirection === "asc") {
            return <ArrowUp size={14} />;
        }

        if (sortDirection === "desc") {
            return <ArrowDown size={14} />;
        }

        return null;
    };

    useEffect(() => {
        if (sortField) {
            const sortedData = [...data].sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                // Handle time fields (HH:mm:ss)
                if (typeof aValue === "string" && aValue.includes(":")) {
                    // Convert time to seconds for comparison (HH:mm:ss)
                    const aTimeInSeconds = aValue
                        .split(":")
                        .reduce((acc, time) => acc * 60 + parseInt(time), 0);

                    const bTimeInSeconds = bValue
                        .split(":")
                        .reduce(
                            (acc: number, time: string) =>
                                acc * 60 + parseInt(time),
                            0
                        );

                    aValue = aTimeInSeconds;
                    bValue = bTimeInSeconds;
                }
                // Handle date fields (ISO 8601)
                else if (
                    typeof aValue === "string" &&
                    !isNaN(Date.parse(aValue))
                ) {
                    aValue = new Date(aValue).getTime(); // Convert to timestamp
                    bValue = new Date(bValue).getTime(); // Convert to timestamp
                }

                // Compare values
                if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
                if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
                return 0;
            });
            setDisplayedData(sortedData);
        }
    }, [sortField, sortDirection, data]);

    return (
        <Table>
            <TableHeader className="bg-border">
                <TableRow>
                    <TableHead
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => handleSort("report_date")}
                    >
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            Date {renderSortIcon("report_date")}
                        </div>
                    </TableHead>
                    <TableHead
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => handleSort("check_in_time")}
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            Check-In Time {renderSortIcon("check_in_time")}
                        </div>
                    </TableHead>
                    <TableHead
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => handleSort("check_out_time")}
                    >
                        <div className="flex items-center gap-2">
                            <Clock9 size={16} />
                            Check-Out Time {renderSortIcon("check_out_time")}
                        </div>
                    </TableHead>
                    <TableHead
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => handleSort("check_in_gate")}
                    >
                        <div className="flex items-center gap-2">
                            <DoorClosed size={16} />
                            Check-In Gate {renderSortIcon("check_in_gate")}
                        </div>
                    </TableHead>
                    <TableHead
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => handleSort("check_out_gate")}
                    >
                        <div className="flex items-center gap-2">
                            <DoorClosed size={16} />
                            Check-Out Gate {renderSortIcon("check_out_gate")}
                        </div>
                    </TableHead>
                    <TableHead
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => handleSort("total_stay_hours")}
                    >
                        <div className="flex items-center gap-2">
                            <Briefcase size={16} />
                            Working Time {renderSortIcon("total_stay_hours")}
                        </div>
                    </TableHead>
                    <TableHead
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => handleSort("late_arrival_minutes")}
                    >
                        <div className="flex items-center gap-2">
                            <ClockAlert size={16} />
                            Late Status {renderSortIcon("late_arrival_minutes")}
                        </div>
                    </TableHead>
                    <TableHead
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => handleSort("early_departure_minutes")}
                    >
                        <div className="flex items-center gap-2">
                            <ClockAlert size={16} />
                            Early Status
                            {renderSortIcon("early_departure_minutes")}
                        </div>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {displayedData.length > 0 ? (
                    displayedData.map((record) => (
                        <AccessLogDialog
                            key={record.record_id}
                            date={record.report_date}
                            userID={record.record_id}
                        >
                            <TableRow className="hover:bg-chart-1/20 hover:cursor-pointer">
                                <TableCell className="px-4 py-2">
                                    {new Date(
                                        record.report_date
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="px-4 py-2">
                                    {record.check_in_time}
                                </TableCell>
                                <TableCell className="px-4 py-2">
                                    {record.check_out_time}
                                </TableCell>
                                <TableCell className="px-4 py-2">
                                    {record.check_in_gate}
                                </TableCell>
                                <TableCell className="px-4 py-2">
                                    {record.check_out_gate}
                                </TableCell>
                                <TableCell className="px-4 py-2">
                                    {record.total_stay_hours}
                                </TableCell>
                                <TableCell
                                    className={
                                        record.late_arrival_status ===
                                        LateArrivalStatus.Late
                                            ? "px-4 py-2 text-destructive"
                                            : "px-4 py-2"
                                    }
                                >
                                    {record.late_arrival_minutes > 0
                                        ? `${record.late_arrival_status} for ${record.late_arrival_minutes} minutes`
                                        : record.late_arrival_status}
                                </TableCell>
                                <TableCell
                                    className={
                                        record.early_departure_status ===
                                        EarlyDepartureStatus.Early
                                            ? "px-4 py-2 text-destructive"
                                            : "px-4 py-2"
                                    }
                                >
                                    {record.early_departure_minutes > 0
                                        ? `${record.early_departure_status} for ${record.early_departure_minutes} minutes`
                                        : record.early_departure_status}
                                </TableCell>
                            </TableRow>
                        </AccessLogDialog>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={11} className="text-center py-6">
                            No attendance records match the current filters
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

const AttendanceChart = ({ data }: { data: Array<AttendanceRecord> }) => {
    const [chartData, setChartData] = useState<
        Array<{
            date: string;
            Work: number;
            Late: number;
            Early: number;
        }>
    >([]);

    useEffect(() => {
        const chartData = data
            .map((record) => ({
                date: new Date(record.report_date).toLocaleDateString(),
                Work: record.total_stay_hours,
                Late: record.late_arrival_minutes,
                Early: record.early_departure_minutes,
            }))
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            );

        setChartData(chartData);
        console.log(chartData);
    }, [data]);

    const chartConfig = {
        Work: {
            label: "Working Time",
            color: "var(--chart-3)",
        },
        Late: {
            label: "Late Minutes",
            color: "var(--chart-2)",
        },
        Early: {
            label: "Early Minutes",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig;
    return (
        <ChartContainer
            config={chartConfig}
            title="Attendance Chart"
            className="min-w-96"
            style={{ width: "calc(100dvh - 50rem)" }}
        >
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <ChartLegend content={<ChartLegendContent />} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={20}
                    axisLine={false}
                    tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.getDate().toString(); // 取得日期中的「日」部分
                    }}
                />
                <ChartTooltip
                    cursor={false}
                    formatter={(value: number, name: string) => {
                        if (name === "Work") return `Work for ${value} hours`;
                        return `${name} for ${value} minutes`;
                    }}
                    content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="Work" fill="var(--color-Work)" radius={4} />
                <Bar
                    dataKey="Late"
                    stackId="a"
                    fill="var(--color-Late)"
                    radius={4}
                />
                <Bar
                    dataKey="Early"
                    stackId="a"
                    fill="var(--color-Early)"
                    radius={4}
                />
            </BarChart>
        </ChartContainer>
    );
};

export default AttendancePage;
