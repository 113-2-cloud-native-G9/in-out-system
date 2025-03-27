import React, { JSX, use, useEffect, useState } from "react";
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
import { AccessLog } from "@/types";
import { mockAccessLogs } from "@/mocks/accesslog";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Clock,
    DoorOpen,
    LogIn,
} from "lucide-react";

interface AccessLogDialogProps {
    children: React.ReactNode;
    date: string;
    userID: number;
}

const AccessLogDialog = ({ children, date, userID }: AccessLogDialogProps) => {
    const [logs, setLogs] = React.useState<AccessLog[]>([]);
    const [sortField, setSortField] = useState<keyof AccessLog | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        null
    );
    const [displayedData, setDisplayedData] = useState<AccessLog[]>([]);

    useEffect(() => {
        console.log(date, userID);
        setLogs(mockAccessLogs);
    }, [date, userID]);

    useEffect(() => {
        if (sortField) {
            const sortedData = [...logs].sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                // Handle time fields (HH:mm:ss)
                if (
                    typeof aValue === "string" &&
                    aValue.includes(":") &&
                    typeof bValue === "string" &&
                    bValue.includes(":")
                ) {
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
        } else {
            setDisplayedData(logs);
        }
    }, [sortField, sortDirection, logs]);

    // Handle sorting logic
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

    // Function to render sort icon
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
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="md:min-w-[50rem] min-h-[20rem]">
                <DialogHeader>
                    <DialogTitle>
                        {new Date(date).toLocaleDateString() + " "}Access Logs
                    </DialogTitle>
                </DialogHeader>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="px-4 py-2 cursor-pointer w-32"
                                onClick={() => handleSort("access_time")}
                            >
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    Time
                                    {renderSortIcon("access_time")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="px-4 py-2 cursor-pointer w-36"
                                onClick={() => handleSort("direction")}
                            >
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown size={16} />
                                    Direction
                                    {renderSortIcon("direction")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="px-4 py-2 cursor-pointer w-64"
                                onClick={() => handleSort("gate_name")}
                            >
                                <div className="flex items-center gap-2">
                                    <DoorOpen size={16} />
                                    Gate Name
                                    {renderSortIcon("gate_name")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => handleSort("gate_type")}
                            >
                                <div className="flex items-center gap-2">
                                    <LogIn size={16} />
                                    Gate Type
                                    {renderSortIcon("gate_type")}
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedData.map((log) => (
                            <TableRow key={log.log_id}>
                                <TableCell>
                                    {new Date(
                                        log.access_time
                                    ).toLocaleTimeString()}
                                </TableCell>
                                <TableCell>{log.direction}</TableCell>
                                <TableCell>{log.gate_name}</TableCell>
                                <TableCell>{log.gate_type}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
};

export default AccessLogDialog;
