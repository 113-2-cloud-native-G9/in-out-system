import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useOrganizationList } from "@/hooks/queries/useOrganization";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "@/types";

interface EditEmployeeDialogProps {
    children: React.ReactNode; // Trigger element
    editType: "create" | "update";
    employeeData?: User;
    onSubmit?: (formData: any) => void; // Optional callback for form submission
}

// 首字母大寫轉換函數
const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};



const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    return hashHex;
};

const EditEmployeeDialog = ({
    children,
    editType,
    employeeData,
    onSubmit,
}: EditEmployeeDialogProps) => {
    // 使用首字母大寫格式
    const [formData, setFormData] = useState({
        employee_id: "",
        hashed_password: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        is_admin: false,
        job_title: "",
        organization_id: "",
        organization_name: "",
        hire_status: "Active" as "Active" | "Inactive" | "Onleave",
        hire_date: "",
    });

    const [open, setOpen] = useState(false);
    const [organizationList, setOrganizationList] = useState<any[]>([]);

    // 使用 React Query 獲取組織列表，增加錯誤處理
    const { 
        data: organizations, 
        isLoading: organizationsLoading,
        error: organizationsError,
        refetch: refetchOrganizations,
        isSuccess: organizationsSuccess
    } = useOrganizationList();

    // 當資料成功載入時，更新本地狀態
    useEffect(() => {
        if (organizationsSuccess && organizations) {
            console.log('Organizations data received in component:', organizations);
            setOrganizationList(organizations);
        }
    }, [organizations, organizationsSuccess]);

    // 設置表單數據
    useEffect(() => {
        const updateFormData = async () => {
            if (editType === "update" && employeeData) {
                console.log("Setting form data for employee:", employeeData);
                
                // 設置表單數據，首字母大寫
                setFormData({
                    employee_id: employeeData.employee_id || "",
                    hashed_password: "",
                    first_name: employeeData.first_name || "",
                    last_name: employeeData.last_name || "",
                    email: employeeData.email || "",
                    phone_number: employeeData.phone_number || "",
                    is_admin: employeeData.is_admin || false,
                    job_title: employeeData.job_title || "",
                    organization_id: employeeData.organization_id || "",
                    organization_name: employeeData.organization_name || "",
                    hire_status: "Active" as "Active" | "Inactive" | "Onleave",
                    hire_date: employeeData.hire_date || "",
                });
            } else if (editType === "create") {
                const password = "0000";
                const hashedPassword = await hashPassword(password);
                setFormData({
                    employee_id: "",
                    hashed_password: hashedPassword,
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone_number: "",
                    is_admin: false,
                    job_title: "",
                    organization_id: "",
                    organization_name: "",
                    hire_status: "Active",
                    hire_date: "",
                });
            }
        };

        if (open) {
            updateFormData(); // 只有在對話框打開時更新表單數據
        }
    }, [editType, employeeData, open]);

    const handleChange = <K extends keyof typeof formData>(
        field: K,
        value: (typeof formData)[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // 如果更改了組織 ID，同時更新組織名稱
        if (field === 'organization_id') {
            const selectedOrg = organizationList.find(org => org.organization_id === value);
            if (selectedOrg) {
                setFormData(prev => ({
                    ...prev,
                    organization_name: selectedOrg.organization_name
                }));
            }
        }
    };

    const handleSubmit = () => {
        if (onSubmit) {
            
            onSubmit(formData);
            setOpen(false); 
        }
    };

    // 重試載入組織列表
    const handleRetryOrganizations = () => {
        refetchOrganizations();
    };

    // Dialog 開啟時重新載入組織列表
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            refetchOrganizations();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="md:min-w-[50rem] min-h-[20rem]">
                <DialogHeader>
                    <DialogTitle>
                        {editType === "create"
                            ? "Create New Employee"
                            : "Update Employee"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="employeeId"
                                className="text-sm font-medium"
                            >
                                Employee Id
                            </label>
                            <Input
                                id="employeeId"
                                value={formData.employee_id}
                                onChange={(e) =>
                                    handleChange("employee_id", e.target.value)
                                }
                                readOnly={editType === "update"}
                                className={
                                    editType === "update"
                                        ? "cursor-not-allowed"
                                        : ""
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium mb-1">
                                Is Admin?
                            </p>
                            <RadioGroup
                                defaultValue={formData.is_admin ? "yes" : "no"}
                                value={formData.is_admin ? "yes" : "no"}
                                onValueChange={(value) =>
                                    handleChange("is_admin", value === "yes")
                                }
                                className="flex space-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="yes"
                                        id="admin-yes"
                                    />
                                    <label
                                        htmlFor="admin-yes"
                                        className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                        Yes
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="admin-no" />
                                    <label
                                        htmlFor="admin-no"
                                        className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                        No
                                    </label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="firstName"
                                className="text-sm font-medium"
                            >
                                First Name
                            </label>
                            <Input
                                id="firstName"
                                value={formData.first_name}
                                onChange={(e) =>
                                    handleChange("first_name", e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="lastName"
                                className="text-sm font-medium"
                            >
                                Last Name
                            </label>
                            <Input
                                id="lastName"
                                value={formData.last_name}
                                onChange={(e) =>
                                    handleChange("last_name", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium"
                            >
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    handleChange("email", e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="phoneNumber"
                                className="text-sm font-medium"
                            >
                                Phone Number
                            </label>
                            <Input
                                id="phoneNumber"
                                value={formData.phone_number}
                                onChange={(e) =>
                                    handleChange("phone_number", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="organizationName"
                                className="text-sm font-medium"
                            >
                                Department
                            </label>
                            {organizationsError ? (
                                <div className="flex items-center justify-between p-2 border rounded-md bg-destructive/10 text-destructive">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        <span className="text-sm">Failed to load departments</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={handleRetryOrganizations}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : (
                                <Select
                                    value={formData.organization_id}
                                    onValueChange={(value) => {
                                        handleChange("organization_id", value);
                                    }}
                                    disabled={organizationsLoading}
                                >
                                    <SelectTrigger className="border-foreground/50">
                                        <SelectValue placeholder={organizationsLoading ? "Loading..." : "Select a Department"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background">
                                        {organizationsLoading ? (
                                            <div className="flex items-center justify-center p-2">
                                                <Loader2 className="animate-spin" size={16} />
                                                <span className="ml-2">Loading departments...</span>
                                            </div>
                                        ) : organizationList.length > 0 ? (
                                            organizationList.map((org) => (
                                                <SelectItem
                                                    key={org.organization_id}
                                                    value={org.organization_id}
                                                >
                                                    {org.organization_name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-4 text-sm text-muted-foreground">
                                                <p className="font-medium mb-1">No departments available</p>
                                                <p className="text-xs">Please check if the API is returning data</p>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="mt-2 w-full"
                                                    onClick={handleRetryOrganizations}
                                                >
                                                    Retry Loading
                                                </Button>
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="jobTitle"
                                className="text-sm font-medium"
                            >
                                Job Title
                            </label>
                            <Input
                                id="jobTitle"
                                value={formData.job_title}
                                onChange={(e) =>
                                    handleChange("job_title", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="hireStatus"
                                className="text-sm font-medium"
                            >
                                Hire Status
                            </label>
                            <Select
                                value={formData.hire_status}
                                onValueChange={(
                                    value: "Active" | "Inactive" | "Onleave"
                                ) => handleChange("hire_status", value)}
                            >
                                <SelectTrigger className="border-foreground/50">
                                    <SelectValue placeholder="Select Hire Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-background">
                                    <SelectItem value="Active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="Inactive">
                                        Inactive
                                    </SelectItem>
                                    <SelectItem value="Onleave">
                                        On Leave
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="hireDate"
                                className="text-sm font-medium"
                            >
                                Hire Date
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "bg-popover/50 cursor-pointer w-full justify-start border-foreground/50 text-left font-normal",
                                            !formData.hire_date &&
                                                "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.hire_date ? (
                                            format(
                                                new Date(formData.hire_date),
                                                "PPP"
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        className="bg-border"
                                        selected={
                                            formData.hire_date
                                                ? new Date(formData.hire_date)
                                                : undefined
                                        }
                                        onSelect={(date) => {
                                            handleChange(
                                                "hire_date",
                                                date
                                                    ? format(date, "yyyy-MM-dd")
                                                    : ""
                                            );
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-end space-x-2">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} variant="secondary">
                        {editType === "create" ? "Create" : "Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditEmployeeDialog;
