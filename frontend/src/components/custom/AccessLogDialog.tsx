import React, { JSX, useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AccessLog } from "@/types/accesslog";
import { usePersonalAccessLogs } from "@/hooks/queries/useAccessLog";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Clock,
    DoorOpen,
    LogIn,
    Calendar,
    Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AccessLogDialogProps {
    children: React.ReactNode;
    date: string;
}

const AccessLogDialog = ({ children, date }: AccessLogDialogProps) => {
    // 對話框開啟狀態
    const [open, setOpen] = useState(false);

    // 數據和載入狀態
    const { data: logs, isLoading, refetch } = usePersonalAccessLogs(date);

    // 排序狀態
    const [sortField, setSortField] = useState<keyof AccessLog | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        null
    );

    // 當對話框打開時，獲取數據
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);

        // 當對話框打開時，獲取數據
        if (newOpen) {
            // 重新使用usePersonalAccessLogs
            refetch();
        }
    };

    // 使用 useMemo 處理排序
    const displayedData = useMemo(() => {
        // 如果沒有數據，則返回空數組
        if (!logs) {
            return [];
        }

        if (sortField && sortDirection) {
            return [...logs].sort((a, b) => {
                // 獲取屬性值，確保不為 undefined
                let aValue = a[sortField] || "";
                let bValue = b[sortField] || "";

                // 處理時間欄位 (HH:mm:ss)
                if (
                    typeof aValue === "string" &&
                    aValue.includes(":") &&
                    typeof bValue === "string" &&
                    bValue.includes(":")
                ) {
                    // 將時間轉換為秒數進行比較 (HH:mm:ss)
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
                // 處理日期欄位 (ISO 8601)
                else if (
                    typeof aValue === "string" &&
                    !isNaN(Date.parse(aValue)) &&
                    typeof bValue === "string" &&
                    !isNaN(Date.parse(bValue))
                ) {
                    aValue = new Date(aValue).getTime(); // 轉換為時間戳
                    bValue = new Date(bValue).getTime(); // 轉換為時間戳
                }

                // 確保比較值不為 undefined
                aValue = aValue ?? "";
                bValue = bValue ?? "";

                // 比較值
                if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
                if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
                return 0;
            });
        }

        return logs;
    }, [logs, sortField, sortDirection]);

    // 處理排序邏輯
    const handleSort = (field: keyof AccessLog): void => {
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

    // 渲染排序圖標的函數
    const renderSortIcon = (field: keyof AccessLog): JSX.Element | null => {
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

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="md:min-w-[50rem] min-h-[20rem]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full py-10">
                        <Loader2
                            size={36}
                            className="animate-spin text-blue-500 mb-4"
                        />
                        <p className="text-lg text-muted-foreground">
                            Loading access logs...
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <span>
                                        {new Date(date).toLocaleDateString(
                                            undefined,
                                            {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }
                                        )}
                                    </span>
                                </DialogTitle>
                            </div>
                        </DialogHeader>
                        <div className="overflow-y-auto max-h-[60vh]">
                            <Table>
                                <TableHeader className="sticky top-0 bg-card z-10">
                                    <TableRow>
                                        <TableHead
                                            className="px-4 py-2 cursor-pointer w-32"
                                            onClick={() =>
                                                handleSort("access_time")
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <Clock
                                                    size={16}
                                                    className="text-blue-600"
                                                />
                                                Time
                                                {renderSortIcon("access_time")}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="px-4 py-2 cursor-pointer w-36"
                                            onClick={() =>
                                                handleSort("direction")
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <ArrowUpDown
                                                    size={16}
                                                    className="text-purple-600"
                                                />
                                                Direction
                                                {renderSortIcon("direction")}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="px-4 py-2 cursor-pointer w-64"
                                            onClick={() =>
                                                handleSort("gate_name")
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <DoorOpen
                                                    size={16}
                                                    className="text-green-600"
                                                />
                                                Gate Name
                                                {renderSortIcon("gate_name")}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="px-4 py-2 cursor-pointer"
                                            onClick={() =>
                                                handleSort("gate_type")
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <LogIn
                                                    size={16}
                                                    className="text-amber-600"
                                                />
                                                Gate Type
                                                {renderSortIcon("gate_type")}
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayedData.length > 0 ? (
                                        displayedData.map((log) => (
                                            <TableRow
                                                key={log.log_id}
                                                className="hover:bg-blue-50/40"
                                            >
                                                <TableCell className="font-mono">
                                                    {new Date(
                                                        log.access_time
                                                    ).toLocaleTimeString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={`${
                                                            log.direction ===
                                                            "in"
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-amber-50 text-amber-700"
                                                        }`}
                                                    >
                                                        {log.direction.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {log.gate_name}
                                                </TableCell>
                                                <TableCell>
                                                    {log.gate_type}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-8 text-muted-foreground"
                                            >
                                                No access logs found for this
                                                date
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AccessLogDialog;
