import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// 模擬的出勤數據
const attendanceData = [
  { id: 1, name: 'John Doe', date: '2024-03-20', status: 'Present', checkIn: '09:00', checkOut: '18:00' },
  { id: 2, name: 'Jane Smith', date: '2024-03-20', status: 'Present', checkIn: '08:55', checkOut: '18:30' },
  { id: 3, name: 'Mike Johnson', date: '2024-03-20', status: 'Late', checkIn: '09:30', checkOut: '18:00' },
];

const AttendancePage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance Records</h1>
      
      
      
    </div>
  );
};

export default AttendancePage;