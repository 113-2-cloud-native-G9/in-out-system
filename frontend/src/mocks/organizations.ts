export const mockOrganizations = [
    {
        organization_id: "ORG001",
        organization_name: "Managerial",
    },
    {
        organization_id: "ORG002",
        organization_name: "Design",
    },
    {
        organization_id: "ORG003",
        organization_name: "Engineering",
    },
    {
        organization_id: "ORG004",
        organization_name: "Marketing",
    },
    {
        organization_id: "ORG005",
        organization_name: "HR",
    },
    {
        organization_id: "ORG006",
        organization_name: "Data Science",
    },
    {
        organization_id: "ORG007",
        organization_name: "Sales",
    },
];

export const mockOrganizationsWithChildren: Organization[] = [
    {
        organization_id: "ORG01", // Corporate (Top-Level Organization)
        organization_name: "Corporate", // Name of the organization (parent)
        parent_organization_id: null, // No parent organization (top-level)
        manager_id: "123", // Manager ID (unique identifier of the manager)
        manager_first_name: "Alice",
        manager_last_name: "Johnson", // Name of the manager
        children: [
            {
                organization_id: "ORG02", // Engineering Department
                organization_name: "Engineering", // Engineering
                parent_organization_id: "ORG01", // Parent is Corporate
                manager_id: "124", // Manager of Engineering
                manager_first_name: "Bob",
                manager_last_name: "Lee", // Name of the Engineering manager
                children: [
                    {
                        organization_id: "ORG05", // Development Sub-department
                        organization_name: "Development", // Development team
                        parent_organization_id: "ORG02", // Parent is Engineering
                        manager_id: "125", // Manager of Development
                        manager_first_name: "Davi",
                        manager_last_name: "Wrong", // Name of the Development manager
                        children: [],
                    },
                    {
                        organization_id: "ORG08", // QA Sub-department
                        organization_name: "QA", // QA team
                        parent_organization_id: "ORG02", // Parent is Engineering
                        manager_id: "126", // Manager of QA
                        manager_first_name: "David",
                        manager_last_name: "Wo", // Name of the QA manager
                        children: [],
                    },
                    {
                        organization_id: "ORG06", // West Region Sub-department
                        organization_name: "West Region", // West Region team
                        parent_organization_id: "ORG02", // Parent is Engineering
                        manager_id: "127", // Manager of West Region
                        manager_first_name: "Charlie",
                        manager_last_name: "Kim", // Name of the West Region manager
                        children: [],
                    },
                ],
            },
            {
                organization_id: "ORG03", // Sales Department
                organization_name: "Sales", // Sales
                parent_organization_id: "ORG01", // Parent is Corporate
                manager_id: "128", // Manager of Sales
                manager_first_name: "Charlie",
                manager_last_name: "Kim", // Name of the Sales manager
                children: [
                    {
                        organization_id: "ORG04", // Marketing Sub-department
                        organization_name: "Marketing", // Marketing team
                        parent_organization_id: "ORG03", // Parent is Sales
                        manager_id: "129",
                        manager_first_name: "Davi", // Manager of Marketing
                        manager_last_name: "Wrong", // Name of the Marketing manager
                        children: [],
                    },
                    {
                        organization_id: "ORG10", // Promotions Sub-department
                        organization_name: "Promotions", // Promotions team
                        parent_organization_id: "ORG03", // Parent is Sales
                        manager_id: "130", // Manager of Promotions
                        manager_first_name: "David",
                        manager_last_name: "Wo", // Name of the Promotions manager
                        children: [],
                    },
                ],
            },
        ],
    },
];
