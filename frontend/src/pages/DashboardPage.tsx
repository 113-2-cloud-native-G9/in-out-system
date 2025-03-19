import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 模擬的部門數據
const departmentData = [
  { name: 'Engineering', employeeCount: 50, averageHours: 8.5, productivity: 85 },
  { name: 'Marketing', employeeCount: 30, averageHours: 8.2, productivity: 80 },
  { name: 'Sales', employeeCount: 40, averageHours: 8.7, productivity: 90 },
  { name: 'HR', employeeCount: 15, averageHours: 8.0, productivity: 75 },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Company Dashboard</h1>
      
      
    </div>
  );
};

export default DashboardPage;