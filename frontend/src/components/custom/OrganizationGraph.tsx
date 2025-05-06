import Tree from "react-d3-tree";
import { useEffect, useState } from "react";

export function OrganizationGraph({ data }: { data: Organization[] }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDark = () =>
            setIsDark(document.documentElement.classList.contains("dark"));
        checkDark();

        // 監聽 class 變化（可選，若你有主動切換 dark class）
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const convertToTree = (nodes: Organization[]): any =>
        nodes.map((node) => ({
            name: node.organization_name,
            attributes: {
                ID: node.organization_id,
                Manager: `${node.manager_first_name} ${node.manager_last_name}`,
            },
            color: isDark ? "#1e293b" : "white", // 節點顏色
            textColor: isDark ? "white" : "#1e293b", // 文字顏色
            children: convertToTree(node.children),
        }));

    const renderCustomNode = ({ nodeDatum, toggleNode }) => (
        <g>
            <circle
                r={15}
                fill={nodeDatum.color || "steelblue"}
                stroke={isDark ? "#334155" : "#cbd5e1"}
                onClick={toggleNode}
                style={{ cursor: "pointer" }}
            />
            <text
                fill={nodeDatum.textColor || "black"}
                strokeWidth="0.5"
                x={20}
                y={5}
                style={{ fontWeight: "bold" }}
            >
                {nodeDatum.name}
            </text>
            <text
                fill={nodeDatum.textColor}
                fontSize={15}
                strokeWidth="0.5"
                x={20}
                y={20}
            >
                {nodeDatum.attributes.ID}
            </text>
            <text
                fill={nodeDatum.textColor}
                strokeWidth="0.5"
                fontSize={15}
                x={20}
                y={35}
            >
                {nodeDatum.attributes.Manager}
            </text>
        </g>
    );

    if (data.length === 0) {
        return <div className="w-full h-[calc(100vh-15rem)] rounded shadow" />;
    }

    return (
        <div className="w-full h-[calc(100vh-15rem)]  rounded shadow ">
            <Tree
                data={convertToTree(data)}
                renderCustomNodeElement={renderCustomNode}
                nodeSize={{ x: 200, y: 180 }}
                orientation="vertical"
                pathFunc="step"
                draggable={true}
            />
        </div>
    );
}
