import { mockEmployeesAttendance } from "@/mocks/employeeAttendance";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmployeeAttendance } from "@/types/attendance"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
} from "recharts";

const DashboardPage = () => {
    const [attendances, setAttendances] = useState<Array<EmployeeAttendance>>(
        mockEmployeesAttendance
    );

    const overview = useMemo(() => {
        const totalEmployees = attendances.length;
        const allDates = new Set<string>();
        const weekendDays = [0, 6]; // Sunday = 0, Saturday = 6
        const lateCount = attendances.flatMap((e) =>
            e.records.filter((r) => r.late_arrival_minutes !== 0)
        ).length;
        const earlyCount = attendances.flatMap((e) =>
            e.records.filter((r) => r.early_departure_minutes !== 0)
        ).length;

        let totalWorkDays = 0;
        let allReportDates = new Set<string>();

        attendances.forEach((employee) => {
            employee.records.forEach((record) => {
                allReportDates.add(record.report_date);
            });
        });

        // 計算本月天數與排除週末的工作日數
        const reportMonth = Array.from(allReportDates)[0]?.slice(0, 7); // 取 YYYY-MM
        if (reportMonth) {
            const [year, month] = reportMonth.split("-").map(Number);
            const daysInMonth = new Date(year, month, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, month - 1, d);
                if (!weekendDays.includes(date.getDay())) {
                    totalWorkDays++;
                }
            }
        }

        const totalPossibleAttendances = totalEmployees * totalWorkDays;
        const totalActualAttendances = attendances.reduce(
            (acc, e) => acc + e.records.length,
            0
        );
        const avgAttendanceRate =
            totalActualAttendances / totalPossibleAttendances;

        const avgLateEarlyPerPerson = (lateCount + earlyCount) / totalEmployees;
        const totalLateEarly = lateCount + earlyCount;
        const absentCount =
            totalEmployees -
            attendances.filter((e) => e.records.length >= totalWorkDays * 0.7)
                .length;

        return {
            totalEmployees,
            totalWorkDays,
            avgAttendanceRate: (avgAttendanceRate * 100).toFixed(1) + "%",
            avgLateEarlyPerPerson: avgLateEarlyPerPerson.toFixed(2),
            totalLateEarly,
            absentCount,
        };
    }, [attendances]);

    const exceptions = useMemo(() => {
        const topLateEmployees = attendances
            .map((emp) => ({
                name: emp.employee_name,
                count: emp.records.filter((r) => r.late_arrival_status === "Y")
                    .length,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topEarlyEmployees = attendances
            .map((emp) => ({
                name: emp.employee_name,
                count: emp.records.filter(
                    (r) => r.early_departure_status === "Y"
                ).length,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const totalWorkDays = overview.totalWorkDays;
        const lowAttendanceEmployees = attendances
            .filter((emp) => emp.records.length < totalWorkDays * 0.7)
            .map((emp) => emp.employee_name);

        return {
            topLateEmployees,
            topEarlyEmployees,
            lowAttendanceEmployees,
        };
    }, [attendances, overview.totalWorkDays]);

    const trendData = useMemo(() => {
        const dailyMap: Record<
            string,
            { date: string; present: number; late: number; early: number }
        > = {};
        const lateMinutesMap: Record<
            string,
            { name: string; totalLateMinutes: number }
        > = {};

        attendances.forEach((emp) => {
            let lateTotal = 0;
            let lateCount = 0;

            emp.records.forEach((r) => {
                // 出勤統計
                if (!dailyMap[r.report_date]) {
                    dailyMap[r.report_date] = {
                        date: r.report_date,
                        present: 0,
                        late: 0,
                        early: 0,
                    };
                }
                dailyMap[r.report_date].present++;
                if (r.late_arrival_status === "Y")
                    dailyMap[r.report_date].late++;
                if (r.early_departure_status === "Y")
                    dailyMap[r.report_date].early++;

                // 平均遲到分鐘統計
                if (r.late_arrival_status === "Y") {
                    lateTotal += r.late_arrival_minutes;
                    lateCount++;
                }
            });

            lateMinutesMap[emp.employee_name] = {
                name: emp.employee_name,
                totalLateMinutes: lateCount ? lateTotal : 0,
            };
        });

        const dailyTrend = Object.values(dailyMap).sort((a, b) =>
            a.date.localeCompare(b.date)
        );
        const lateMinuteList = Object.values(lateMinutesMap).sort(
            (a, b) => b.totalLateMinutes - a.totalLateMinutes
        );

        return {
            dailyTrend,
            lateMinuteList,
        };
    }, [attendances]);

    return (
        <div className="space-y-6 overflow-y-auto h-[calc(100vh-8rem)]">
            <h1 className="text-3xl font-bold">Company Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 概覽區 */}
                <div className="space-y-4 px-1">
                    <h2 className="text-2xl font-bold">
                        Basic Information Overview
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                👥 Total Employees: {overview.totalEmployees}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                📅 Workdays in Month: {overview.totalWorkDays}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                📈 Average Attendance Rate:{" "}
                                {overview.avgAttendanceRate}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                ⏰ Avg Late/Early per Person:{" "}
                                {overview.avgLateEarlyPerPerson}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                🔁 Total Late/Early: {overview.totalLateEarly}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                ❌ Absentee Count: {overview.absentCount}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 異常與細節區 */}
                <div className="space-y-4 px-1">
                    <h2 className="text-2xl font-bold">
                        Exception & Detail Overview
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>Top 5 Late Arrivals</CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {exceptions.topLateEmployees.map((e, i) => (
                                        <li key={i}>
                                            {e.name} - {e.count} times
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>Top 5 Early Leaves</CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {exceptions.topEarlyEmployees.map(
                                        (e, i) => (
                                            <li key={i}>
                                                {e.name} - {e.count} times
                                            </li>
                                        )
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>Low Attendance (&lt;70%)</CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {exceptions.lowAttendanceEmployees.length >
                                    0 ? (
                                        exceptions.lowAttendanceEmployees.map(
                                            (name, i) => <li key={i}>{name}</li>
                                        )
                                    ) : (
                                        <li>None</li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* 趨勢與圖表區 */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold">Trend & Chart Overview</h2>
                <Card>
                    <CardHeader>Daily Attendance</CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData.dailyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="present"
                                    stroke="#8884d8"
                                    name="Attendance"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>Late & Early Leave</CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={trendData.dailyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="late"
                                    stackId="a"
                                    fill="#f87171"
                                    name="Late"
                                />
                                <Bar
                                    dataKey="early"
                                    stackId="a"
                                    fill="#60a5fa"
                                    name="Early Leave"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>Late Minutes</CardHeader>
                    <CardContent>
                        <p className="font-semibold mb-2">
                            Tatal Late Minutes Per Employee
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={trendData.lateMinuteList}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={120}
                                />
                                <Tooltip />
                                <Bar
                                    dataKey="totalLateMinutes"
                                    fill="#facc15"
                                    name="Avg Late (min)"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
