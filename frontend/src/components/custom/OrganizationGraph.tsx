import Tree from "react-d3-tree";

export function OrganizationGraph({ data }: { data: Organization[] }) {
    const convertToTree = (nodes: Organization[]): any =>
        nodes.map((node) => ({
            name: node.organization_name,
            attributes: {
                ID: node.organization_id,
                Manager: `${node.manager_first_name} ${node.manager_last_name}`,
            },
            children: convertToTree(node.children),
        }));

    if (data.length === 0) {
        return <div className="w-full h-[calc(100vh-15rem)] rounded shadow" />;
    }

    return (
        <div className="w-full h-[calc(100vh-15rem)]  rounded shadow dark:bg-gray-300">
            <Tree
                data={convertToTree(data)}
                rootNodeClassName="text-2xl font-bold dark:text-white fill-white"
                branchNodeClassName="text-lg font-semibold"
                leafNodeClassName="text-base font-normal"
                nodeSize={{ x: 200, y: 180 }}
                orientation="vertical"
                pathFunc="step"
                draggable={true}
            />
        </div>
    );
}
