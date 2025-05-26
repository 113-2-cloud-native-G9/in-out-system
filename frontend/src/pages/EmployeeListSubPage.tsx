import { JSX, useState, useEffect } from "react";
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/queries/useEmployee";
import { 
    useOrganizationList, 
    useOrganizationDetail, 
    convertOrganizationEmployeeToUser
} from "@/hooks/queries/useOrganization";
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
import { useUser } from "@/providers/authProvider";
import { useQueryClient } from "@tanstack/react-query";

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
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortField, setSortField] = useState<SortField>("employee_id");
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [employees, setEmployees] = useState<User[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string>("");
    const [refreshKey, setRefreshKey] = useState<number>(0); // 用於觸發手動重新加載
    const itemsPerPage: number = 10;

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 使用 useUser hook 獲取當前用戶資訊
    const { user: currentUser, isAuthenticated } = useUser();

    // 獲取 queryClient 以手動使緩存失效
    const queryClient = useQueryClient();

    // 獲取組織列表
    const { data: organizations = [], isLoading: isLoadingOrgs, error: orgsError } = useOrganizationList();
    
    // 獲取當前選中組織的詳細資訊
    const { 
        data: selectedOrgDetail, 
        isLoading: isLoadingOrgDetail, 
        refetch: refetchOrgDetail 
    } = useOrganizationDetail(selectedOrgId);

    // 組合加載狀態
    const isLoading = isLoadingOrgs || (selectedOrgId && isLoadingOrgDetail);

    // 初始化選擇的組織 ID
    useEffect(() => {
        // 如果用戶是經理，預設選中其組織
        if (currentUser?.is_manager && currentUser.organization_id && !selectedOrgId) {
            setSelectedOrgId(currentUser.organization_id);
            setSelectedDepartment(currentUser.organization_name || "");
        } 
        // 如果是普通用戶且有組織 ID，預設選中其組織
        else if (currentUser?.organization_id && !selectedOrgId) {
            setSelectedOrgId(currentUser.organization_id);
            setSelectedDepartment(currentUser.organization_name || "");
        }
        // 如果有組織列表但尚未選中任何組織，選擇第一個組織
        else if (organizations.length > 0 && !selectedOrgId) {
            setSelectedOrgId(organizations[0].organization_id);
            setSelectedDepartment(organizations[0].organization_name);
        }
    }, [currentUser, organizations, selectedOrgId]);

    // 當選中的組織改變時或 refreshKey 變化時獲取員工數據
    useEffect(() => {
        if (selectedOrgDetail?.employee_list) {
            const employeeList = selectedOrgDetail.employee_list.map(emp => 
                convertOrganizationEmployeeToUser(
                    emp,
                    selectedOrgDetail.organization_id,
                    selectedOrgDetail.organization_name
                )
            );
            setEmployees(employeeList);
        } else {
            setEmployees([]);
        }
    }, [selectedOrgDetail, refreshKey]);

    // 處理組織選擇變更
    const handleOrganizationChange = (orgId: string) => {
        setSelectedOrgId(orgId);
        const org = organizations.find(o => o.organization_id === orgId);
        setSelectedDepartment(org?.organization_name || "");
        setCurrentPage(1); // 重置頁碼
    };

    // 使用真實的 create 和 update hooks
    const { mutate: createEmployee, isPending: isCreating } = useCreateEmployee();
    const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee();

    // 檢查用戶是否有權限管理員工（管理員或經理）
    const canManageEmployees = currentUser?.is_admin || currentUser?.is_manager;
    
    // 檢查用戶是否有權限管理選中組織的員工
    const canManageSelectedOrg = currentUser?.is_admin || 
        (currentUser?.is_manager && currentUser.organization_id === selectedOrgId);

    // 重新加載組織詳細信息數據
    const refreshOrganizationData = () => {
        // 使組織詳細信息快取失效
        queryClient.invalidateQueries({ queryKey: ['organization', 'detail', selectedOrgId] });
        // 重新獲取組織詳細信息
        refetchOrgDetail();
        // 增加 refreshKey 觸發 useEffect
        setRefreshKey(prev => prev + 1);
    };

    // Filter the employees based on criteria (除了組織，已經由選擇組織處理)
    const filteredEmployees: User[] = employees.filter((employee) => {
        // Status filter
        const statusMatch: boolean =
            selectedStatus === "all" || 
            (employee.hire_status && employee.hire_status === selectedStatus);

        // Search query filter
        let searchMatch: boolean = true;
        if (searchQuery) {
            searchMatch = Object.values(employee).some(
                (value) =>
                    typeof value === "string" &&
                    value.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return statusMatch && searchMatch;
    });

    // Sort filtered employees if sort field and direction are set
    const sortedEmployees: User[] = [...filteredEmployees].sort((a, b) => {
        if (!sortField || !sortDirection) return 0;

        const fieldA = a[sortField];
        const fieldB = b[sortField];
        
        // 處理可能為空的字段
        const valueA = typeof fieldA === "string" ? fieldA.toLowerCase() : "";
        const valueB = typeof fieldB === "string" ? fieldB.toLowerCase() : "";

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

        // 檢查用戶權限
        if (!canManageEmployees) {
            setErrorMessage("You don't have permission to manage employees.");
            return;
        }

        // 如果是經理，只能管理自己組織的員工
        if (currentUser?.is_manager && !currentUser.is_admin && 
            formData.organization_id !== currentUser.organization_id) {
            setErrorMessage("You can only manage employees in your organization.");
            return;
        }

        const requiredFields = ["first_name", "last_name", "email", "job_title", "organization_id"];
        const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === "");
      
        if (missingFields.length > 0) {
            setErrorMessage(`Please fill in all fields`);
            return; 
        }
      
        if (editingEmployee) {
            // 如果是經理，只能編輯其組織的員工
            if (currentUser?.is_manager && !currentUser?.is_admin && 
                editingEmployee.organization_id !== currentUser.organization_id) {
                setErrorMessage("You can only edit employees in your organization.");
                return;
            }

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
                        // 重新加載數據
                        refreshOrganizationData();
                    },
                    onError: (err) => {
                        setErrorMessage("Update Employee Failed: " + err.message);
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
                    // 重新加載數據
                    refreshOrganizationData();
                },
                onError: (err) => {
                    setErrorMessage("Create Employee Failed: " + err.message);
                    setSuccessMessage(null);
                },
            });
        }
    };

    // 檢查用戶是否已登錄
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                    <p>Please log in to view this page.</p>
                </div>
            </div>
        );
    }

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
    if (orgsError) {
        return (
            <div className="text-center text-red-500">
                Loading Failed: {orgsError.message}
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
                    {/* Organization selector (only for admins or users who need to switch) */}
                    {(currentUser?.is_admin || !currentUser?.is_manager) && (
                        <Select
                            value={selectedOrgId}
                            onValueChange={handleOrganizationChange}
                        >
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select Organization" />
                            </SelectTrigger>
                            <SelectContent className="bg-card">
                                {organizations.map((org) => (
                                    <SelectItem key={org.organization_id} value={org.organization_id}>
                                        {org.organization_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Search input */}
                    <Input
                        type="text"
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 bg-popover/20"
                    />

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
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Onleave">On Leave</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Refresh button */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={refreshOrganizationData}
                        title="Refresh Data"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                            <path d="M3 21v-5h5"></path>
                        </svg>
                    </Button>
                </div>
                <div className="flex items-center space-x-4">
                    {canManageSelectedOrg && (
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
                    )}
                </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg mb-4">
                <h2 className="text-lg font-medium">
                    {selectedDepartment 
                    ? `${selectedDepartment} Department` 
                    : 'No Organization Selected'}
                </h2>
                <p className="text-sm text-muted-foreground">
                    Showing {filteredEmployees.length} employees
                    {selectedOrgDetail?.employee_count 
                        ? ` (Total: ${selectedOrgDetail.employee_count})` 
                        : ''}
                </p>
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
                            {canManageSelectedOrg && (
                                <TableHead className="px-4 py-2 w-28">Actions</TableHead>
                            )}
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
                                        <span
                                            className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full 
                                            ${employee.hire_status === "Active"
                                                ? "bg-sidebar-accent text-primary-foreground"
                                                : ""
                                            }
                                            ${employee.hire_status === "Inactive"
                                                ? "bg-popover text-primary-foreground"
                                                : ""
                                            }
                                            ${employee.hire_status === "Onleave"
                                                ? "bg-chart-1 text-primary-foreground"
                                                : ""
                                            }`}
                                        >
                                            {employee.hire_status
                                                ? employee.hire_status.charAt(0).toUpperCase() + employee.hire_status.slice(1)
                                                : "Unknown"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        {employee.email}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        {employee.hire_date}
                                    </TableCell>
                                    {canManageSelectedOrg && (
                                        <TableCell className="px-8 py-2">
                                            <EditEmployeeDialog
                                                editType="update"
                                                employeeData={employee}
                                                onSubmit={(formData) => handleEmployeeSubmit(formData, employee)}
                                            >
                                                <Edit
                                                    size={16}
                                                    className={`text-secondary cursor-pointer hover:text-primary ${isUpdating ? 'opacity-50' : ''}`}
                                                />
                                            </EditEmployeeDialog>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={canManageSelectedOrg ? 7 : 6}
                                    className="text-center py-6"
                                >
                                    {selectedOrgId 
                                        ? "No employees match the current filters" 
                                        : "Please select an organization to view employees"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {currentEmployees.length > 0 && (
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
            )}
        </div>
    );
};

export default EmployeeListPage;
