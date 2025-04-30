import { JSX, useMemo, useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    Pencil,
    Trash2,
    CirclePlus,
    CircleX,
} from "lucide-react";

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
            alert("請填寫所有欄位！");
            return;
        }

        // 🔍 1. 遞迴收集所有 org IDs
        const collectAllIds = (nodes: Organization[]): string[] =>
            nodes.flatMap((node) => [
                node.organization_id,
                ...collectAllIds(node.children),
            ]);

        const allIds = collectAllIds(data);

        // 🧮 2. 解析 ORG 編號並找出最大值
        const maxOrgNum = allIds.reduce((max, id) => {
            const match = id.match(/^ORG(\d{2,})$/);
            if (match) {
                const num = parseInt(match[1], 10);
                return Math.max(max, num);
            }
            return max;
        }, 0);

        const nextOrgId = `ORG${(maxOrgNum + 1).toString().padStart(2, "0")}`;

        // 🆕 3. 建立新部門
        const newOrg: Organization = {
            organization_id: nextOrgId,
            organization_name: newOrgForm.organization_name,
            parent_organization_id: newOrgForm.parent_organization_id || null,
            manager_id: newOrgForm.manager_id,
            manager_first_name: "",
            manager_last_name: "",
            children: [],
        };

        // 🌳 4. 插入新部門
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

        // 🧹 5. 清空表單
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

        // 1. 移除原本的位置，並取得該 node
        const removeAndExtract = (nodes: Organization[]): Organization[] =>
            nodes
                .map((node) => {
                    if (node.organization_id === id) {
                        movedNode = {
                            ...node,
                            ...editedNode,
                            children: node.children,
                        };
                        return null; // 剔除
                    }
                    return {
                        ...node,
                        children: removeAndExtract(node.children),
                    };
                })
                .filter(Boolean) as Organization[];

        const cleanedData = removeAndExtract(data);

        if (!movedNode) return;

        // 2. 插入新的位置
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
                className="flex items-center border-b py-1 px-2 text-sm"
            >
                <div className="w-5">
                    {org.children.length > 0 && (
                        <button
                            onClick={() => toggleExpand(org.organization_id)}
                        >
                            {isExpanded ? (
                                <ChevronDown
                                    className="cursor-pointer"
                                    size={16}
                                />
                            ) : (
                                <ChevronRight
                                    className="cursor-pointer"
                                    size={16}
                                />
                            )}
                        </button>
                    )}
                </div>
                <div
                    className="flex-1 pl-2"
                    style={{ marginLeft: `${level * 1.25}rem` }}
                >
                    {isEditing ? (
                        <input
                            className="border rounded px-1 text-sm w-32"
                            value={editForm.organization_name || ""}
                            onChange={(e) =>
                                handleEditChange(
                                    "organization_name",
                                    e.target.value
                                )
                            }
                        />
                    ) : (
                        <span>
                            {org.organization_name} ({org.organization_id})
                        </span>
                    )}
                </div>
                <div className="flex-1 px-2">
                    {isEditing && (
                        <select
                            className="border rounded px-1 text-sm w-full"
                            value={editForm.parent_organization_id || ""}
                            onChange={(e) =>
                                handleEditChange(
                                    "parent_organization_id",
                                    e.target.value
                                )
                            }
                        >
                            <option value="">Select Parent</option>
                            {organizationList.map((org) => (
                                <option
                                    key={org.organization_id}
                                    value={org.organization_id}
                                >
                                    {org.organization_name} (
                                    {org.organization_id})
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="w-32 px-2">
                    {isEditing ? (
                        <input
                            className="border rounded px-1 text-sm w-full"
                            value={editForm.manager_id || ""}
                            onChange={(e) =>
                                handleEditChange("manager_id", e.target.value)
                            }
                        />
                    ) : (
                        <span>
                            {org.manager_first_name} {org.manager_last_name}
                        </span>
                    )}
                </div>
                <div className="flex space-x-1">
                    {isEditing ? (
                        <button
                            className="text-green-600 text-xs px-2 py-0.5 border rounded cursor-pointer
                            dark:text-green-400 dark:border-green-400"
                            onClick={() => applyEdit(org.organization_id)}
                        >
                            儲存
                        </button>
                    ) : (
                        <button
                            className="text-blue-600 hover:text-blue-800 cursor-pointer
                            dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => handleEdit(org)}
                        >
                            <Pencil size={16} />
                        </button>
                    )}
                    <button
                        className={`text-red-600 hover:text-red-800
                            dark:text-red-400 dark:hover:text-red-300
                            ${
                                org.children.length > 0
                                    ? "cursor-not-allowed"
                                    : "cursor-pointer"
                            }`}
                        onClick={() => handleDelete(org.organization_id)}
                        disabled={org.children.length !== 0}
                    >
                        <Trash2 size={16} />
                    </button>
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
        <div className="border rounded p-2 shadow text-sm">
            <div className="text-lg font-bold mb-2 flex justify-between items-center px-3">
                Organization Structure Editor
                {openAddForm ? (
                    <CircleX
                        className="cursor-pointer "
                        size={20}
                        onClick={() => setOpenAddForm(false)}
                    />
                ) : (
                    <CirclePlus
                        className="cursor-pointer "
                        size={20}
                        onClick={() => setOpenAddForm(true)}
                    />
                )}
            </div>

            {openAddForm && (
                <div className="mb-4 border rounded p-2 ">
                    <div className="font-semibold mb-2">
                        Create New Department
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                        <input
                            className="border px-2 py-1 rounded w-32"
                            placeholder="Name"
                            value={newOrgForm.organization_name || ""}
                            onChange={(e) =>
                                setNewOrgForm((f) => ({
                                    ...f,
                                    organization_name: e.target.value,
                                }))
                            }
                        />
                        <select
                            className="border px-2 py-1 rounded w-52"
                            value={newOrgForm.parent_organization_id || ""}
                            onChange={(e) =>
                                setNewOrgForm((f) => ({
                                    ...f,
                                    parent_organization_id: e.target.value,
                                }))
                            }
                        >
                            <option value="">Select Parent</option>
                            {organizationList.map((org) => (
                                <option
                                    key={org.organization_id}
                                    value={org.organization_id}
                                >
                                    {org.organization_name} (
                                    {org.organization_id})
                                </option>
                            ))}
                        </select>
                        <input
                            className="border px-2 py-1 rounded w-40"
                            placeholder="Manager ID"
                            value={newOrgForm.manager_id || ""}
                            onChange={(e) =>
                                setNewOrgForm((f) => ({
                                    ...f,
                                    manager_id: e.target.value,
                                }))
                            }
                        />

                        <button
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            onClick={() => handleAdd()}
                        >
                            新增
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1">{renderTree(data)}</div>
        </div>
    );
}
