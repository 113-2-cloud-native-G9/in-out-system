import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User } from "@/types/user";
import { mockOrganizations } from "@/mocks/organizations";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose
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
import { CalendarIcon } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface EditEmployeeDialogProps {
    children: React.ReactNode; // Trigger element
    editType: "create" | "update";
    employeeData?: User;
    onSubmit?: (formData: any) => void; // Optional callback for form submission
}

const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

const EditEmployeeDialog = ({
    children,
    editType,
    employeeData,
    onSubmit
}: EditEmployeeDialogProps) => {
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
        hire_status: "active" as "active" | "inactive" | "onleave",
        hire_date: "",
    });

    useEffect(() => {
        const updateFormData = async () => {
            if (editType === "update" && employeeData) {
                setFormData({
                    employee_id: employeeData.employee_id,
                    hashed_password: "",
                    first_name: employeeData.first_name,
                    last_name: employeeData.last_name,
                    email: employeeData.email,
                    phone_number: employeeData.phone_number,
                    is_admin: employeeData.is_admin,
                    job_title: employeeData.job_title,
                    organization_id: employeeData.organization_id,
                    hire_status: employeeData.hire_status,
                    hire_date: employeeData.hire_date,
                });
            } else if (editType === "create") {
                const password = '0000';
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
                    hire_status: "active",
                    hire_date: "",
                });
            }
        };

        updateFormData(); // Call the async function to update the form data
    }, [editType, employeeData]);

    const handleChange = <K extends keyof typeof formData>(
        field: K,
        value: (typeof formData)[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    return (
        <Dialog>
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
                                className={editType === "update" ? "cursor-not-allowed" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium mb-1">Is Admin?</p>
                            <RadioGroup
                                defaultValue={formData.is_admin ? "yes" : "no"}
                                value={formData.is_admin ? "yes" : "no"}
                                onValueChange={(value) =>
                                    handleChange("is_admin", value === "yes")
                                }
                                className="flex space-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="admin-yes" />
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
                            <Select
                                value={formData.organization_id}
                                onValueChange={(value) => {
                                    const selected = mockOrganizations.find(
                                        (org) => org.organization_id === value
                                    );
                                    handleChange("organization_id", value);
                                }}
                            >
                                <SelectTrigger className="border-foreground/50">
                                    <SelectValue placeholder="Select a Department" />
                                </SelectTrigger>
                                <SelectContent className="bg-background">
                                    {mockOrganizations.map((org) => (
                                        <SelectItem
                                            key={org.organization_id}
                                            value={org.organization_id}
                                        >
                                            {org.organization_id} -{" "}
                                            {org.organization_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    value: "active" | "inactive" | "onleave"
                                ) => handleChange("hire_status", value)}
                            >
                                <SelectTrigger className="border-foreground/50">
                                    <SelectValue placeholder="Select Hire Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-background">
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                    <SelectItem value="onleave">
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
                        <Button variant="outline">
                            Cancel
                        </Button>
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