import { JSX, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface Props {
    data: Organization[];
    onChange: (data: Organization[]) => void;
}

export function OrganizationEditor({ data, onChange }: Props) {
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Organization>>({});
    const [newOrgForm, setNewOrgForm] = useState<Partial<Organization>>({
        organization_name: "",
        manager_id: "",
        parent_organization_id: null,
    });
    const [openAddForm, setOpenAddForm] = useState(false);

    const organizationList = useMemo(() => {
        const flatten = (nodes: Organization[]): Organization[] =>
            nodes.flatMap((node) => [node, ...flatten(node.children || [])]);
        return flatten(data);
    }, [data]);

    const toggleExpand = (id: string) => {
        setExpandedMap((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleAdd = () => {
        if (
            !newOrgForm.organization_name ||
            !newOrgForm.manager_id ||
            !newOrgForm.parent_organization_id
        ) {
            alert("Please fill in all fields!");
            return;
        }

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
            parent_organization_id: newOrgForm.parent_organization_id || null,
            manager_id: newOrgForm.manager_id,
            manager_first_name: "",
            manager_last_name: "",
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

        setNewOrgForm({
            organization_name: "",
            manager_id: "",
            parent_organization_id: null,
        });
        setOpenAddForm(false);
    };

    const handleEdit = (org: Organization) => {
        setEditingId(org.organization_id);
        setEditForm({
            organization_name: org.organization_name,
            parent_organization_id: org.parent_organization_id,
            manager_id: org.manager_id,
        });
    };

    const handleEditChange = (field: keyof Organization, value: string) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const applyEdit = (id: string) => {
        if (!editForm.organization_name || !editForm.manager_id) return;

        const editedNode: Partial<Organization> = {
            organization_name: editForm.organization_name,
            parent_organization_id: editForm.parent_organization_id ?? null,
            manager_id: editForm.manager_id,
        };

        let movedNode: Organization | null = null;

        const removeAndExtract = (nodes: Organization[]): Organization[] =>
            nodes
                .map((node) => {
                    if (node.organization_id === id) {
                        movedNode = {
                            ...node,
                            ...editedNode,
                            children: node.children,
                        };
                        return null;
                    }
                    return {
                        ...node,
                        children: removeAndExtract(node.children),
                    };
                })
                .filter(Boolean) as Organization[];

        const cleanedData = removeAndExtract(data);

        if (!movedNode) return;

        const insertToParent = (
            nodes: Organization[],
            targetParentId: string | null
        ): Organization[] => {
            if (targetParentId === null) {
                return [...nodes, movedNode!];
            }

            return nodes.map((node) => {
                if (node.organization_id === targetParentId) {
                    return {
                        ...node,
                        children: [...node.children, movedNode!],
                    };
                }
                return {
                    ...node,
                    children: insertToParent(node.children, targetParentId),
                };
            });
        };

        const newTree = insertToParent(
            cleanedData,
            editedNode.parent_organization_id ?? null
        );

        onChange(newTree);
        setEditingId(null);
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

    const renderRow = (org: Organization, level = 0) => {
        const isExpanded = expandedMap[org.organization_id] ?? true;
        const isEditing = editingId === org.organization_id;

        return (
            <div
                key={org.organization_id}
                className="border-b border-border/50 hover:bg-secondary/5 transition-colors"
            >
                <div className="flex items-center py-3 px-4">
                    {/* Expand/Collapse Button */}
                    <div className="w-8">
                        {org.children.length > 0 && (
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
                        className="flex-1 flex items-center gap-2"
                        style={{ marginLeft: `${level * 1.5}rem` }}
                    >
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                            <Input
                                className="h-8 w-48"
                                value={editForm.organization_name || ""}
                                onChange={(e) =>
                                    handleEditChange(
                                        "organization_name",
                                        e.target.value
                                    )
                                }
                            />
                        ) : (
                            <div>
                                <span className="font-medium">{org.organization_name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                    ({org.organization_id})
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Parent Organization */}
                    <div className="flex-1">
                        {isEditing && (
                            <Select
                                value={editForm.parent_organization_id || ""}
                                onValueChange={(value) =>
                                    handleEditChange("parent_organization_id", value)
                                }
                            >
                                <SelectTrigger className="h-8 w-full">
                                    <SelectValue placeholder="Select Parent" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No Parent</SelectItem>
                                    {organizationList
                                        .filter(o => o.organization_id !== org.organization_id)
                                        .map((org) => (
                                            <SelectItem
                                                key={org.organization_id}
                                                value={org.organization_id}
                                            >
                                                {org.organization_name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Manager */}
                    <div className="w-48 flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                            <Input
                                className="h-8"
                                value={editForm.manager_id || ""}
                                onChange={(e) =>
                                    handleEditChange("manager_id", e.target.value)
                                }
                                placeholder="Manager ID"
                            />
                        ) : (
                            <span className="text-sm">
                                {org.manager_first_name} {org.manager_last_name}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => applyEdit(org.organization_id)}
                                >
                                    <Save className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => setEditingId(null)}
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
                                    onClick={() => handleEdit(org)}
                                >
                                    <Pencil className="h-4 w-4 text-primary" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => handleDelete(org.organization_id)}
                                    disabled={org.children.length > 0}
                                >
                                    <Trash2
                                        className={`h-4 w-4 ${org.children.length > 0
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
    };

    const renderTree = (nodes: Organization[], level = 0): JSX.Element[] =>
        nodes.flatMap((node) => {
            const rows = [renderRow(node, level)];
            if (expandedMap[node.organization_id] ?? true) {
                rows.push(...renderTree(node.children, level + 1));
            }
            return rows;
        });

    return (
        <div className="space-y-4">
            {/* Add New Department Section */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Add New Department</h3>
                    <Button
                        variant={openAddForm ? "ghost" : "secondary"}
                        size="sm"
                        onClick={() => setOpenAddForm(!openAddForm)}
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
                                <Select
                                    value={newOrgForm.parent_organization_id || ""}
                                    onValueChange={(value) =>
                                        setNewOrgForm((f) => ({
                                            ...f,
                                            parent_organization_id: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {organizationList.map((org) => (
                                            <SelectItem
                                                key={org.organization_id}
                                                value={org.organization_id}
                                            >
                                                {org.organization_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Manager ID</Label>
                                <Input
                                    placeholder="Enter manager ID"
                                    value={newOrgForm.manager_id || ""}
                                    onChange={(e) =>
                                        setNewOrgForm((f) => ({
                                            ...f,
                                            manager_id: e.target.value,
                                        }))
                                    }
                                />
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
                        <div className="w-8"></div>
                        <div className="flex-1" style={{ marginLeft: "0rem" }}>
                            Department Name
                        </div>
                        <div className="w-48">Manager</div>
                        <div className="w-20">Actions</div>
                    </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto">
                    {renderTree(data)}
                </div>

            </Card>
        </div>
    );
}
