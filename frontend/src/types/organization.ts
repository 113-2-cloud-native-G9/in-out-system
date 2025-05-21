export interface Organization {
    organization_id: string;
    organization_name: string;
    parent_organization_id: string | null;
    manager_id: string;
    manager_first_name?: string;
    manager_last_name?: string;
    employee_count: number;
    children: Organization[];
}

export interface OrganizationTree {
    organization_id: string;
    organization_name: string;
    parent_organization_id: string | null;
    manager_id: string;
    children: OrganizationTree[];
}
