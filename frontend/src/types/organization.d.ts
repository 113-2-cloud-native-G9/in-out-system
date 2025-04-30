export {};

declare global {
    interface Organization {
        organization_id: string;
        organization_name: string;
        parent_organization_id: string | null;
        manager_id: string;
        manager_first_name?: string;
        manager_last_name?: string;
        children: Organization[];
    }
}
