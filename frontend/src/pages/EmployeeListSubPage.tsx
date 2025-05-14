
import { JSX, useState } from "react";
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/queries/useEmployee";
// Temporarily comment out useEmployeeList while backend is not ready
// import { useEmployeeList } from "@/hooks/queries/useEmployee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Edit,
    UserPlus,
    UserRound,
    Briefcase,
    Layers,
    Target,
    Mail,
    Calendar,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Loader2,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import EditEmployeeDialog from "@/components/custom/EditEmployeeCard ";
import { User } from "@/types";
// Import mock data
import { mockEmployees } from "@/mocks/employees";

// Define sort direction type
type SortDirection = "asc" | "desc" | null;

// Define sort field type
type SortField =
    | "first_name"
    | "job_title"
    | "employee_id"
    | "email"
    | "organization_name"
    | "hire_date"
    | "hire_status"
    | null;

const EmployeeListPage = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortField, setSortField] = useState<SortField>("employee_id");
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const itemsPerPage: number = 10;

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 使用 React Query hooks
    // Temporarily use mock data for employee list
    // const { data: employees = [], isLoading, error } = useEmployeeList();

    // 暫時使用 mock data 作為員工列表
    const employees = mockEmployees;
    const isLoading = false;
    const error = null;

    // 使用真實的 create 和 update hooks
    const { mutate: createEmployee, isPending: isCreating } = useCreateEmployee();
    const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee();

    // Get unique departments for the department filter
    const departments: string[] = [
        "all",
        ...Array.from(new Set(employees.map((emp) => emp.organization_name))),
    ];

    // Filter the employees based on all criteria
    const filteredEmployees: User[] = employees.filter((employee) => {
        // Status filter
        const statusMatch: boolean =
            selectedStatus === "all" || employee.hire_status === selectedStatus;

        // Search query filter based on selected field
        let searchMatch: boolean = true;
        if (searchQuery) {
            searchMatch = Object.values(employee).some(
                (value) =>
                    typeof value === "string" &&
                    value.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Department filter
        const departmentMatch: boolean =
            selectedDepartment === "all" ||
            employee.organization_name === selectedDepartment;

        return statusMatch && searchMatch && departmentMatch;
    });

    // Sort filtered employees if sort field and direction are set
    const sortedEmployees: User[] = [...filteredEmployees].sort((a, b) => {
        if (!sortField || !sortDirection) return 0;

        const valueA =
            typeof a[sortField] === "string" ? a[sortField].toLowerCase() : "";
        const valueB =
            typeof b[sortField] === "string" ? b[sortField].toLowerCase() : "";

        if (sortDirection === "asc") {
            return valueA.localeCompare(valueB);
        } else {
            return valueB.localeCompare(valueA);
        }
    });

    // Get paginated data
    const indexOfLastEmployee: number = currentPage * itemsPerPage;
    const indexOfFirstEmployee: number = indexOfLastEmployee - itemsPerPage;
    const currentEmployees: User[] = sortedEmployees.slice(
        indexOfFirstEmployee,
        indexOfLastEmployee
    );

    const totalPages: number = Math.ceil(sortedEmployees.length / itemsPerPage);

    const handlePageChange = (pageNumber: number): void => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Handle sorting
    const handleSort = (field: SortField): void => {
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
    const renderSortIcon = (field: keyof User): JSX.Element | null => {
        if (sortField !== field) {
            return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
        }

        if (sortDirection === "asc") {
            return <ArrowUp size={14} className="ml-1" />;
        }

        if (sortDirection === "desc") {
            return <ArrowDown size={14} className="ml-1" />;
        }

        return null;
    };

    // Handle employee submit (create or update)
    const handleEmployeeSubmit = (formData: any, editingEmployee: User | null) => {
        setErrorMessage(null);

        const requiredFields = ["first_name", "last_name", "email", "job_title", "organization_name"];
        const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === "");
      
        if (missingFields.length > 0) {
          setErrorMessage(`Please fill in all fields`);
          return; 
        }
      

        if (editingEmployee) {
            // Update employee
            updateEmployee(
                {
                    employeeId: editingEmployee.employee_id,
                    data: formData
                },
                {
                    onSuccess: () => {
                        setSuccessMessage("Update Employee Successfully");
                        setErrorMessage(null);
                    },
                    onError: (err) => {
                        setErrorMessage("Update Employee Failed" + err.message);
                        setSuccessMessage(null);
                    },
                }
            );
        } else {
            // Create new employee
            createEmployee(formData, {
                onSuccess: () => {
                    setSuccessMessage("Create Employee Successfully");
                    setErrorMessage(null);
                },
                onError: (err) => {
                    setErrorMessage("Create Employee Failed" + err.message);
                    setSuccessMessage(null);
                },
            });
        }
    };

    // 載入狀態處理
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" size={32} />
                <span className="ml-2">Loading...</span>
            </div>
        );
    }

    // 錯誤處理
    if (error) {
        return (
            <div className="text-center text-red-500">
                Loading Failed
            </div>
        );
    }

    return (
        <div className="px-4">
            {errorMessage && (
                <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-md z-50 flex items-center">
                    <span>{errorMessage}</span>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="ml-4 font-bold cursor-pointer"
                        aria-label="Close alert"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* 成功訊息 */}
            {successMessage && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-md z-50 flex items-center">
                    <span>{successMessage}</span>
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="ml-4 font-bold cursor-pointer"
                        aria-label="Close alert"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="flex justify-between mb-4">
                <div className="flex items-center space-x-4">
                    {/* Search input */}
                    <Input
                        type="text"
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 bg-popover/20"
                    />

                    {/* Department filter */}
                    <Select
                        value={selectedDepartment}
                        onValueChange={(value: string) =>
                            setSelectedDepartment(value)
                        }
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                            {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                    {dept === "all" ? "All Departments" : dept}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status filter */}
                    <Select
                        value={selectedStatus}
                        onValueChange={(value: string) =>
                            setSelectedStatus(value)
                        }
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="onleave">On Leave</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-4">
                    <EditEmployeeDialog
                        editType="create"
                        onSubmit={(formData) => handleEmployeeSubmit(formData, null)}
                    >
                        <Button
                            className="cursor-pointer bg-accent hover:bg-accent/70 text-primary-foreground px-3 py-3 rounded-lg shadow-md flex items-center space-x-2 transition-all duration-300"
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <UserPlus size={18} className="text-primary-foreground" />
                            )}
                            <span>Add Employee</span>
                        </Button>
                    </EditEmployeeDialog>
                </div>
            </div>

            <div className="rounded-md max-h-dvh border overflow-y-auto relative">
                <Table>
                    <TableHeader className="bg-border">
                        <TableRow>
                            <TableHead
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => handleSort("employee_id")}
                            >
                                <div className="flex items-center">
                                    # ID {renderSortIcon("employee_id")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => handleSort("first_name")}
                            >
                                <div className="flex items-center">
                                    <UserRound size={14} className="mr-2" />{" "}
                                    Name {renderSortIcon("first_name")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => handleSort("job_title")}
                            >
                                <div className="flex items-center">
                                    <Briefcase size={14} className="mr-2" />{" "}
                                    Role {renderSortIcon("job_title")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => handleSort("organization_name")}
                            >
                                <div className="flex items-center">
                                    <Layers size={14} className="mr-2" />{" "}
                                    Department{" "}
                                    {renderSortIcon("organization_name")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => handleSort("hire_status")}
                            >
                                <div className="flex items-center">
                                    <Target size={14} className="mr-2" /> Status{" "}
                                    {renderSortIcon("hire_status")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => handleSort("email")}
                            >
                                <div className="flex items-center">
                                    <Mail size={14} className="mr-2" /> Contact{" "}
                                    {renderSortIcon("email")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => handleSort("hire_date")}
                            >
                                <div className="flex items-center">
                                    <Calendar size={14} className="mr-2" />{" "}
                                    Joined {renderSortIcon("hire_date")}
                                </div>
                            </TableHead>
                            <TableHead className="px-4 py-2 w-28">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentEmployees.length > 0 ? (
                            currentEmployees.map((employee) => (
                                <TableRow
                                    key={employee.employee_id}
                                    className="hover:bg-chart-1/20"
                                >
                                    <TableCell className="px-4 py-2">
                                        {employee.employee_id}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        {employee.first_name}{" "}
                                        {employee.last_name}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        {employee.job_title}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        {employee.organization_name}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full 
                        ${employee.hire_status === "active"
                                                    ? "bg-sidebar-accent text-primary-foreground"
                                                    : ""
                                                }
                        ${employee.hire_status === "inactive"
                                                    ? "bg-popover text-primary-foreground"
                                                    : ""
                                                }
                        ${employee.hire_status === "onleave"
                                                    ? "bg-chart-1 text-primary-foreground"
                                                    : ""
                                                }`}
                                        >
                                            {employee.hire_status
                                                .charAt(0)
                                                .toUpperCase() +
                                                employee.hire_status.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        {employee.email}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        {employee.hire_date}
                                    </TableCell>
                                    <TableCell className="px-8 py-2">
                                        <EditEmployeeDialog
                                            editType="update"
                                            employeeData={employee}
                                            onSubmit={(formData) => handleEmployeeSubmit(formData, employee)}
                                        >
                                            <Edit
                                                size={16}
                                                className={`text-secondary cursor-pointer hover:text-primary ${isUpdating ? 'opacity-50' : ''
                                                    }`}
                                            />
                                        </EditEmployeeDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center py-6"
                                >
                                    No employees match the current filters
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-center items-center space-x-4">
                <Button
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center space-x-2">
                    {currentPage > 1 && (
                        <span
                            className="text-sm text-secondary cursor-pointer"
                            onClick={() => handlePageChange(1)}
                        >
                            1
                        </span>
                    )}
                    {currentPage > 2 && (
                        <span className="text-sm text-secondary/50">...</span>
                    )}
                    <span className="text-sm font-bold text-foreground">
                        {currentPage}
                    </span>
                    {currentPage < totalPages - 1 && (
                        <span className="text-sm text-secondary/50">...</span>
                    )}
                    {currentPage < totalPages && (
                        <span
                            className="text-sm text-secondary cursor-pointer"
                            onClick={() => handlePageChange(totalPages)}
                        >
                            {totalPages}
                        </span>
                    )}
                </div>

                <Button
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default EmployeeListPage;
