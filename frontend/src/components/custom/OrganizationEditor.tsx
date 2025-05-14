import { JSX, useMemo, useState, useEffect } from "react";
import {
    ChevronDown,
    ChevronRight,
    Pencil,
    Trash2,
    Plus,
    Save,
    X,
    Building,
    User
} from "lucide-react";
import { Organization } from "@/types";
import { useEmployeeList } from "@/hooks/queries/useEmployee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface OrganizationEditorProps {
    data: Organization[];
    onChange: (data: Organization[]) => void;
    onError?: (msg: string) => void; // ✅ 新增錯誤 callback
}

export function OrganizationEditor({ data, onChange, onError }: OrganizationEditorProps) {
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ organization_name?: string; parent_organization_id?: string | null; manager_id?: string }>({ organization_name: "", parent_organization_id: null, manager_id: "" });
    // 為了確保至少有測試數據，設置初始值
    const [employees, setEmployees] = useState<Array<{ employee_id: string; first_name: string; last_name: string }>>([{
        employee_id: 'E001',
        first_name: 'John',
        last_name: 'Doe'
    }, {
        employee_id: 'E002',
        first_name: 'Jane',
        last_name: 'Smith'
    }, {
        employee_id: 'E003',
        first_name: 'Robert',
        last_name: 'Johnson'
    }]);
    const { data: employeeList, isLoading: isLoadingEmployees } = useEmployeeList();
    const [searchQuery, setSearchQuery] = useState("");
    const [addSearchQuery, setAddSearchQuery] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [addDropdownOpen, setAddDropdownOpen] = useState(false);
    const [parentSearchQuery, setParentSearchQuery] = useState("");
    const [parentDropdownOpen, setParentDropdownOpen] = useState(false);
    const [newOrgForm, setNewOrgForm] = useState<Partial<Organization>>({
        organization_name: "",
        manager_id: "",
        parent_organization_id: null,
    });

    // 用於處理點擊外部關閉下拉選單
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const editDropdown = document.getElementById('edit-manager-dropdown');
            const addDropdown = document.getElementById('add-manager-dropdown');
            const parentDropdown = document.getElementById('parent-department-dropdown');

            if (editDropdown && !editDropdown.contains(target)) {
                setDropdownOpen(false);
            }

            if (addDropdown && !addDropdown.contains(target)) {
                setAddDropdownOpen(false);
            }

            if (parentDropdown && !parentDropdown.contains(target)) {
                setParentDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 從 React Query 獲取員工列表
    useEffect(() => {

        if (employeeList && Array.isArray(employeeList)) {

            try {
                const formattedList = employeeList.map(emp => ({
                    employee_id: emp.employee_id || '',
                    first_name: emp.first_name || '',
                    last_name: emp.last_name || ''
                }));

                setEmployees(formattedList);
            } catch (error) {
                console.error('Error formatting employee list:', error);
            }
        }
    }, [employeeList, isLoadingEmployees]);

    // 過濾員工列表基於編輯搜索查詢
    const filteredEmployees = useMemo(() => {
        const results = (!searchQuery || searchQuery.trim() === '')
            ? employees
            : employees.filter(emp =>
                emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
            );

        console.log('Filtered employees for search query:', searchQuery, results);
        return results;
    }, [employees, searchQuery]);



    // 過濾員工列表基於新增搜索查詢
    const filteredAddEmployees = useMemo(() => {
        const results = (!addSearchQuery || addSearchQuery.trim() === '')
            ? employees
            : employees.filter(emp =>
                emp.employee_id.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
                emp.first_name.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
                emp.last_name.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
                `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(addSearchQuery.toLowerCase())
            );

        console.log('Filtered employees for add search query:', addSearchQuery, results);
        return results;
    }, [employees, addSearchQuery]);

    // 清理新增部門表單
    const clearNewOrgForm = () => {
        setNewOrgForm({
            organization_name: "",
            manager_id: "",
            parent_organization_id: null,
        });
        setAddSearchQuery("");
        setParentSearchQuery("");
    };

    const [openAddForm, setOpenAddForm] = useState(false);

    const organizationList = useMemo(() => {
        const flatten = (nodes: Organization[]): Organization[] =>
            nodes.flatMap((node) => [node, ...flatten(node.children || [])]);
        return flatten(data);
    }, [data]);

    // 過濾父部門列表
    const filteredParentOrgs = useMemo(() => {
        if (!parentSearchQuery) return organizationList;

        return organizationList.filter(org =>
            org.organization_id.toLowerCase().includes(parentSearchQuery.toLowerCase()) ||
            org.organization_name.toLowerCase().includes(parentSearchQuery.toLowerCase())
        );
    }, [organizationList, parentSearchQuery]);

    const toggleExpand = (id: string) => {
        setExpandedMap((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleAdd = () => {

        onError?.("");

        if (
            !newOrgForm.organization_name ||
            !newOrgForm.manager_id ||
            !newOrgForm.parent_organization_id
        ) {
            onError?.("Please fill in all fields!");
            return;
        }

        // 找到管理者的全名
        const selectedManager = employees.find(emp => emp.employee_id === newOrgForm.manager_id);

        const collectAllIds = (nodes: Organization[]): string[] =>
            nodes.flatMap((node) => [
                node.organization_id,
                ...collectAllIds(node.children),
            ]);

        const allIds = collectAllIds(data);
        const maxOrgNum = allIds.reduce((max, id) => {
            const match = id.match(/^ORG(\d{2,})$/);
            if (match) {
                const num = parseInt(match[1], 10);
                return Math.max(max, num);
            }
            return max;
        }, 0);

        const nextOrgId = `ORG${(maxOrgNum + 1).toString().padStart(3, "0")}`;

        const newOrg: Organization = {
            organization_id: nextOrgId,
            organization_name: newOrgForm.organization_name,
            parent_organization_id: newOrgForm.parent_organization_id === null || newOrgForm.parent_organization_id === undefined ? null : newOrgForm.parent_organization_id,
            manager_id: newOrgForm.manager_id,
            manager_first_name: selectedManager?.first_name || "",
            manager_last_name: selectedManager?.last_name || "",
            children: [],
        };

        const insertToParent = (
            nodes: Organization[],
            parentId: string | null
        ): Organization[] => {
            if (parentId === null) return [...nodes, newOrg];

            return nodes.map((node) => {
                if (node.organization_id === parentId) {
                    return {
                        ...node,
                        children: [...node.children, newOrg],
                    };
                }
                return {
                    ...node,
                    children: insertToParent(node.children, parentId),
                };
            });
        };

        const updated = insertToParent(data, newOrg.parent_organization_id);
        onChange(updated);

        clearNewOrgForm(); // 清理表單和搜索狀態
        setOpenAddForm(false);
        onError?.("");
    };

    // 用於清理編輯表單
    const clearEditForm = () => {
        onError?.("");
        setEditForm({
            organization_name: "",
            parent_organization_id: null,
            manager_id: "",
        });
        setSearchQuery("");
        setEditingId(null);
    };

    const handleEdit = (org: Organization) => {
        try {
            // Clone the organization to avoid reference issues
            const safeOrg = {
                ...org,
                // Ensure we have all required properties with safe defaults
                organization_name: org.organization_name || "",
                manager_id: org.manager_id || "",
                parent_organization_id: org.parent_organization_id === undefined ? null : org.parent_organization_id
            };

            setEditingId(safeOrg.organization_id);
            setEditForm({
                organization_name: safeOrg.organization_name,
                parent_organization_id: safeOrg.parent_organization_id,
                manager_id: safeOrg.manager_id,
            });

            // 存儲當前的 manager
            const manager = employees.find(emp => emp.employee_id === safeOrg.manager_id);
            // 在畫面上顯示目前的經理姓名
            if (manager) {
                // 不設置搜尋框文字，只保留照常顯示經理
                // setSearchQuery(`${manager.first_name} ${manager.last_name} (${manager.employee_id})`);
            } else {
                setSearchQuery("");
            }
            console.log('Set edit form to:', {
                organization_name: safeOrg.organization_name,
                parent_organization_id: safeOrg.parent_organization_id,
                manager_id: safeOrg.manager_id,
            });
        } catch (error) {
            onError?.("An error occurred while trying to edit. Please try again.");
        }
    };

    const handleEditChange = (field: string, value: string) => {

        setEditForm((prev) => {
            const updated = {
                ...prev,
                [field]: value === "_null" ? null : (value === "" ? null : value), // Convert empty strings or _null to null
            };
            return updated;
        });
    };

    const applyEdit = (id: string) => {
        try {

            if (!editForm.organization_name || !editForm.manager_id) {
                onError?.("Please fill in all required fields before saving.");
                return;
            }

            // Simple in-place update for now, ignoring parent changes to avoid complexity
            const updateInPlace = (nodes: Organization[]): Organization[] => {
                return nodes.map(node => {
                    if (node.organization_id === id) {
                        return {
                            ...node,
                            organization_name: editForm.organization_name || node.organization_name,
                            manager_id: editForm.manager_id || node.manager_id,
                            // Keep the same parent and children
                            parent_organization_id: node.parent_organization_id,
                            children: node.children
                        };
                    }
                    return {
                        ...node,
                        children: updateInPlace(node.children)
                    };
                });
            };

            // Simple in-place update
            const updatedTree = updateInPlace(data);
            onChange(updatedTree);

            clearEditForm();
        } catch (error) {
            console.error('Error in applyEdit:', error);
            onError?.('An error occurred while saving changes. Please try again.');
            clearEditForm(); // Reset editing state to avoid UI being stuck
        }
    };

    const handleDelete = (id: string) => {
        const deleteRecursive = (nodes: Organization[]): Organization[] =>
            nodes
                .filter((n) => n.organization_id !== id)
                .map((n) => ({
                    ...n,
                    children: deleteRecursive(n.children),
                }));

        onChange(deleteRecursive(data));
    };

    // 安全地渲染每個行，確保不會因為無效數據而崩潰
    const renderRow = (org: Organization, level = 0): JSX.Element => {
        try {
            if (!org || !org.organization_id) {
                console.error('Invalid organization object:', org);
                return <></>; // Return empty fragment for invalid data
            }

            const isExpanded = expandedMap[org.organization_id] ?? true;
            const isEditing = editingId === org.organization_id;

            return (
                <div
                    key={org.organization_id}
                    className="border-b border-border/50 hover:bg-secondary/5 transition-colors"
                >
                    <div className="flex items-center py-3 px-4">
                        {/* Expand/Collapse Button */}
                        <div className="w-8 flex-shrink-0">
                            {(org.children && org.children.length > 0) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-6 w-6"
                                    onClick={() => toggleExpand(org.organization_id)}
                                >
                                    {isExpanded ? (
                                        <ChevronDown size={14} />
                                    ) : (
                                        <ChevronRight size={14} />
                                    )}
                                </Button>
                            )}
                        </div>

                        {/* Organization Name */}
                        <div
                            className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden"
                            style={{ marginLeft: `${level * 1}rem` }}
                        >
                            <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {isEditing ? (
                                <Input
                                    className="h-8 w-full max-w-xs"
                                    value={editForm.organization_name || ""}
                                    onChange={(e) =>
                                        handleEditChange("organization_name", e.target.value)
                                    }
                                />
                            ) : (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="truncate">{org.organization_name}</div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {org.organization_name} ({org.organization_id})
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                            )}
                        </div>

                        {/* Manager */}
                        <div className="w-40 flex-shrink-0 flex items-center gap-2 ml-2">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {isEditing ? (
                                <div className="relative" id="edit-manager-dropdown">

                                    <div className="flex">
                                        <Input
                                            className="h-8 pr-10"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onFocus={() => {
                                                setDropdownOpen(true);
                                                // 當獲得焦點時清空搜索框以顯示所有選項
                                                setSearchQuery("");
                                            }}
                                            placeholder="Search manager..."
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                        >
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    {dropdownOpen && (
                                        <div className="absolute z-50 mt-1 w-full bg-background rounded-md shadow-lg border border-border overflow-auto max-h-40">
                                            {isLoadingEmployees ? (
                                                <div className="p-2 text-center text-muted-foreground">
                                                    Loading...
                                                </div>
                                            ) : filteredEmployees && filteredEmployees.length > 0 ? (
                                                filteredEmployees.map((emp) => (
                                                    <div
                                                        key={emp.employee_id}
                                                        className={`p-2 cursor-pointer ${emp.employee_id === editForm.manager_id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/20'}`}
                                                        onClick={() => {
                                                            handleEditChange("manager_id", emp.employee_id);
                                                            setSearchQuery(`${emp.first_name} ${emp.last_name} (${emp.employee_id})`);
                                                            setDropdownOpen(false);
                                                        }}
                                                    >
                                                        <div className="font-medium">{emp.first_name} {emp.last_name}</div>
                                                        <div className="text-xs text-muted-foreground">{emp.employee_id}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-2 text-center text-muted-foreground">
                                                    No employees found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-sm truncate" title={`${org.manager_first_name || ""} ${org.manager_last_name || ""} (${org.manager_id || ""})`}>
                                    {org.manager_first_name || ""} {org.manager_last_name || ""}
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="w-24 flex-shrink-0 flex items-center justify-end gap-1 ml-2">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            applyEdit(org.organization_id);
                                        }}
                                    >
                                        <Save className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={() => clearEditForm()}
                                    >
                                        <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleEdit(org);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4 text-primary" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={() => handleDelete(org.organization_id)}
                                        disabled={org.children && org.children.length > 0}
                                    >
                                        <Trash2
                                            className={`h-4 w-4 ${org.children && org.children.length > 0
                                                ? "text-muted-foreground cursor-not-allowed"
                                                : "text-destructive"
                                                }`}
                                        />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            );
        } catch (error) {
            return <div className="p-2 text-red-500">Error rendering row</div>;
        }
    };

    const renderTree = (nodes: Organization[], level = 0): JSX.Element[] => {
        try {
            if (!nodes || !Array.isArray(nodes)) {
                return [];
            }

            return nodes.flatMap((node) => {
                if (!node || !node.organization_id) {
                    return [];
                }

                const rows = [renderRow(node, level)];
                if ((expandedMap[node.organization_id] ?? true) && node.children && Array.isArray(node.children)) {
                    rows.push(...renderTree(node.children, level + 1));
                }
                return rows;
            });
        } catch (error) {
            console.error('Error rendering tree:', error);
            return [];
        }
    };

    return (
        <div className="space-y-4">
            {/* Add New Department Section */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Add New Department</h3>
                    <Button
                        variant={openAddForm ? "ghost" : "secondary"}
                        size="sm"
                        onClick={() => {
                            setOpenAddForm(!openAddForm);
                            onError?.("");
                        }}
                    >
                        {openAddForm ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {openAddForm && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>Department Name</Label>
                                <Input
                                    placeholder="Enter department name"
                                    value={newOrgForm.organization_name || ""}
                                    onChange={(e) =>
                                        setNewOrgForm((f) => ({
                                            ...f,
                                            organization_name: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Parent Department</Label>
                                <div className="relative" id="parent-department-dropdown">


                                    <div className="flex">
                                        <Input
                                            className="pr-10"
                                            value={parentSearchQuery}
                                            onChange={(e) => setParentSearchQuery(e.target.value)}
                                            onFocus={() => {
                                                setParentDropdownOpen(true);
                                                // 當獲得焦點時清空搜索框以顯示所有選項
                                                setParentSearchQuery("");
                                            }}
                                            placeholder="Search department..."
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                            onClick={() => setParentDropdownOpen(!parentDropdownOpen)}
                                        >
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    {parentDropdownOpen && (
                                        <div className="absolute z-50 mt-1 w-full bg-background rounded-md shadow-lg border border-border overflow-auto max-h-40">
                                            <div
                                                className={`p-2 cursor-pointer ${newOrgForm.parent_organization_id === null ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/20'}`}
                                                onClick={() => {
                                                    setNewOrgForm((f) => ({
                                                        ...f,
                                                        parent_organization_id: null,
                                                    }));
                                                    setParentSearchQuery("No Parent");
                                                    setParentDropdownOpen(false);
                                                }}
                                            >
                                                <div className="font-medium">No Parent</div>
                                            </div>

                                            {filteredParentOrgs.length > 0 ? (
                                                filteredParentOrgs.map((org) => (
                                                    <div
                                                        key={org.organization_id}
                                                        className={`p-2 cursor-pointer ${org.organization_id === newOrgForm.parent_organization_id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/20'}`}
                                                        onClick={() => {
                                                            setNewOrgForm((f) => ({
                                                                ...f,
                                                                parent_organization_id: org.organization_id,
                                                            }));
                                                            setParentSearchQuery(`${org.organization_name} (${org.organization_id})`);
                                                            setParentDropdownOpen(false);
                                                        }}
                                                    >
                                                        <div className="font-medium">{org.organization_name}</div>
                                                        <div className="text-xs text-muted-foreground">{org.organization_id}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-2 text-center text-muted-foreground">
                                                    No departments found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Manager</Label>
                                <div className="relative" id="add-manager-dropdown">

                                    <div className="flex">
                                        <Input
                                            className="pr-10"
                                            value={addSearchQuery}
                                            onChange={(e) => setAddSearchQuery(e.target.value)}
                                            onFocus={() => {
                                                setAddDropdownOpen(true);
                                                // 當獲得焦點時清空搜索框以顯示所有選項
                                                setAddSearchQuery("");
                                            }}
                                            placeholder="Search manager..."
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                            onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                                        >
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    {addDropdownOpen && (
                                        <div className="absolute z-50 mt-1 w-full bg-background rounded-md shadow-lg border border-border overflow-auto max-h-40">
                                            {isLoadingEmployees ? (
                                                <div className="p-2 text-center text-muted-foreground">
                                                    Loading...
                                                </div>
                                            ) : filteredAddEmployees.length > 0 ? (
                                                filteredAddEmployees.map((emp) => (
                                                    <div
                                                        key={emp.employee_id}
                                                        className={`p-2 cursor-pointer ${emp.employee_id === newOrgForm.manager_id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/20'}`}
                                                        onClick={() => {
                                                            setNewOrgForm((f) => ({
                                                                ...f,
                                                                manager_id: emp.employee_id,
                                                            }));
                                                            setAddSearchQuery(`${emp.first_name} ${emp.last_name} (${emp.employee_id})`);
                                                            setAddDropdownOpen(false);
                                                        }}
                                                    >
                                                        <div className="font-medium">{emp.first_name} {emp.last_name}</div>
                                                        <div className="text-xs text-muted-foreground">{emp.employee_id}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-2 text-center text-muted-foreground">
                                                    No employees found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            variant="secondary"
                            onClick={handleAdd}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Department
                        </Button>
                    </div>
                )}
            </Card>

            {/* Organization Tree */}
            <Card>
                <div className="bg-secondary/10 px-4 py-3 border-b">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                        <div className="w-8 flex-shrink-0"></div>
                        <div className="flex-1" style={{ marginLeft: "0rem" }}>
                            Department Name
                        </div>
                        <div className="w-40 flex-shrink-0 ml-2">Manager</div>
                        <div className="w-24 flex-shrink-0 flex justify-end ml-2">Actions</div>
                    </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto">
                    {data && Array.isArray(data) && data.length > 0 ? (
                        renderTree(data)
                    ) : (
                        <div className="p-4 text-center text-muted-foreground">
                            No organizations found. Add a new department to get started.
                        </div>
                    )}
                </div>
            </Card>

            {/* Error display for debugging */}
            {editingId && (
                <div className="text-xs text-muted-foreground">
                    Currently editing: {editingId}
                </div>
            )}
        </div>
    );
}
