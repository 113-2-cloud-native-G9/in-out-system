import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User } from "@/types/user";
import { mockOrganizations } from "@/mocks/organizations";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, CalendarIcon } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface EditEmployeeCardProps {
    closeForm: () => void;
    editType: "create" | "update";
    employeeData?: User;
}

const EditEmployeeCard = ({
    closeForm,
    editType,
    employeeData,
}: EditEmployeeCardProps) => {
    const [formData, setFormData] = useState({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        isManager: false,
        isAdmin: false,
        jobTitle: "",
        organizationId: "",
        organizationName: "",
        hireStatus: "active" as "active" | "inactive" | "onleave",
        hireDate: "",
    });

    useEffect(() => {
        if (editType === "update" && employeeData) {
            setFormData({
                employeeId: employeeData.employee_id,
                firstName: employeeData.first_name,
                lastName: employeeData.last_name,
                email: employeeData.email,
                phoneNumber: employeeData.phone_number,
                isManager: employeeData.is_manager,
                isAdmin: employeeData.is_admin,
                jobTitle: employeeData.job_title,
                organizationId: employeeData.organization_id,
                organizationName: employeeData.organization_name,
                hireStatus: employeeData.hire_status,
                hireDate: employeeData.hire_date,
            });
        }
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
        if (editType === "update") {
            console.log("Updating employee:", formData);
        } else {
            console.log("Creating new employee:", formData);
        }
        closeForm();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <Card className="w-full max-w-3xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>
                            {editType === "create"
                                ? "Create New Employee"
                                : "Update Employee"}
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={closeForm}
                    >
                        <X size={18} />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
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
                                value={formData.employeeId}
                                onChange={(e) =>
                                    handleChange("employeeId", e.target.value)
                                }
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isAdmin"
                                checked={formData.isAdmin}
                                onCheckedChange={(checked) =>
                                    handleChange("isAdmin", !!checked)
                                }
                            />
                            <label
                                htmlFor="isAdmin"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Is Admin?
                            </label>
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
                                value={formData.firstName}
                                onChange={(e) =>
                                    handleChange("firstName", e.target.value)
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
                                value={formData.lastName}
                                onChange={(e) =>
                                    handleChange("lastName", e.target.value)
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
                                value={formData.phoneNumber}
                                onChange={(e) =>
                                    handleChange("phoneNumber", e.target.value)
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
                                value={formData.organizationId}
                                onValueChange={(value) => {
                                    const selected = mockOrganizations.find(
                                        (org) => org.organization_id === value
                                    );
                                    handleChange("organizationId", value);
                                    handleChange(
                                        "organizationName",
                                        selected?.organization_name || ""
                                    );
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
                                value={formData.jobTitle}
                                onChange={(e) =>
                                    handleChange("jobTitle", e.target.value)
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
                                value={formData.hireStatus}
                                onValueChange={(
                                    value: "active" | "inactive" | "onleave"
                                ) => handleChange("hireStatus", value)}
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
                                            "cursor-pointer w-full justify-start text-left font-normal",
                                            !formData.hireDate &&
                                                "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.hireDate ? (
                                            format(
                                                new Date(formData.hireDate),
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
                                            formData.hireDate
                                                ? new Date(formData.hireDate)
                                                : undefined
                                        }
                                        onSelect={(date) => {
                                            handleChange(
                                                "hireDate",
                                                date
                                                    ? format(date, "yyyy-MM-dd")
                                                    : ""
                                            );
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={closeForm}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {editType === "create" ? "Create" : "Update"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default EditEmployeeCard;
