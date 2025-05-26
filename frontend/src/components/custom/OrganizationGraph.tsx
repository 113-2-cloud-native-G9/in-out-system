import React, { useEffect, useState, useRef, useMemo } from "react";
import Tree from "react-d3-tree";
import { Organization } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Search,
  Building,
  User,
  Users,
  Download,
  Expand,
  Network,
  Tag
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
// @ts-ignore: dom-to-image 沒有型別宣告
import domtoimage from "dom-to-image";

interface TreeNode {
  name: string;
  attributes: {
    ID: string;
    Manager: string;
    employeeCount?: number;
    status?: string;
  };
  children: TreeNode[];
}

export function OrganizationGraph({ data }: { data: Organization[] }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const treeContainer = useRef<HTMLDivElement>(null);



  // 初始化時居中顯示樹圖
  useEffect(() => {
    if (treeContainer.current && data.length > 0) {
      const dimensions = treeContainer.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 4,
      });
    }
  }, [data]);

  const convertToTree = (nodes: Organization[]): TreeNode[] =>
    nodes.map((node) => ({
      name: node.organization_name,
      attributes: {
        ID: node.organization_id,
        Manager: `${node.manager_first_name} ${node.manager_last_name}`,
        employeeCount: node.employee_count,
        status: "active", // 模擬狀態
      },
      children: convertToTree(node.children),
    }));

  const treeData = useMemo(() => convertToTree(data), [data]);

  // 搜尋功能
  const findNodePath = (tree: TreeNode[], searchName: string): TreeNode | null => {
    for (const node of tree) {
      if (node.name.toLowerCase().includes(searchName.toLowerCase())) {
        return node;
      }
      const result = findNodePath(node.children, searchName);
      if (result) return result;
    }
    return null;
  };

  // 渲染自定義節點
  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
    const isSelected = selectedNode?.name === nodeDatum.name;
    const isSearchMatch = searchTerm && nodeDatum.name.toLowerCase().includes(searchTerm.toLowerCase());


    return (
      <g>
        {/* 節點背景卡片 */}
        <rect
          x={-110}
          y={-55}
          width={220}
          height={120}
          rx={14}
          ry={14}
          fill={isSelected ? 'var(--secondary)' : 'var(--card)'}
          stroke={isSelected ? 'var(--primary)' : 'var(--border)'}
          strokeWidth={isSelected ? 2 : 1.5}
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }}
        />

        {/* 組織圖標 */}
        <Building
          x={-95}
          y={-40}
          size={20}
          color={'var(--popover-foreground)'}
        />

        {/* 部門名稱（第一行） */}
        <foreignObject x={-65} y={-41} width={150} height={24}>
          <div style={{ color: 'var(--popover-foreground)', fontSize: 16, fontWeight: 500, fontFamily: 'inherit', textAlign: 'left', lineHeight: '24px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {nodeDatum.name}
          </div>
        </foreignObject>

        {/* ID 行 */}
        <g>
          <foreignObject x={-65} y={-5} width={120} height={20}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Tag style={{ width: 13, height: 13, color: 'var(--popover-foreground)' }} />
              <span style={{ marginLeft: 4, color: 'var(--popover-foreground)', fontSize: 12, fontWeight: 400, textAlign: 'left' }}>
                ID: {nodeDatum.attributes.ID}
              </span>
            </div>
          </foreignObject>
          {/* Manager 行 */}
          <foreignObject x={-65} y={15} width={120} height={20}>
            <div style={{ display: 'flex' }}>
              <User style={{ width: 14, height: 14, color: 'var(--popover-foreground)' }} />
              <span style={{ marginLeft: 4, color: 'var(--popover-foreground)', fontSize: 12, fontWeight: 400, textAlign: 'left' }}>
                Manager: {nodeDatum.attributes.Manager}
              </span>
            </div>
          </foreignObject>
        </g>

        {/* 員工數量（右上角 badge） */}
        <g transform="translate(60, -35)">
          <foreignObject x={-10} y={-10} width={45} height={24}>
            <div className="flex items-center gap-1 bg-muted/40 rounded-full px-2 py-0.5 text-xs font-mono text-muted-foreground">
              <Users className="w-3 h-3" />
              {nodeDatum.attributes.employeeCount}
            </div>
          </foreignObject>
        </g>

        {/* 展開/收起指示器 */}
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <g transform="translate(0, 55)" style={{ cursor: 'pointer' }}
            onClick={e => {
              e.stopPropagation();
              if (toggleNode) toggleNode();
            }}
          >
            <circle
              r={10}
              fill={'var(--muted)'}
              stroke={'var(--primary)'}
            />
            <text
              textAnchor="middle"
              y={5}
              fontSize={16}
              style={{ fill: 'var(--popover-foreground)' }}
            >
              {nodeDatum.__rd3t.collapsed ? '+' : '−'}
            </text>
          </g>
        )}
      </g>
    );
  };

  // 全屏切換
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      treeContainer.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 重置視圖
  const resetView = () => {
    if (treeContainer.current) {
      const dimensions = treeContainer.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 4,
      });
      setZoom(1);
    }
  };

  // 搜尋處理
  const handleSearch = () => {
    if (searchTerm && treeData.length > 0) {
      const foundNode = findNodePath(treeData, searchTerm);
      if (foundNode) {
        setSelectedNode(foundNode);
        // 這裡可以加入聚焦到找到的節點的邏輯
      }
    }
  };

  // 導出為圖片
  const exportAsImage = () => {
    if (!treeContainer.current) return;
    domtoimage.toSvg(treeContainer.current)
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = 'organization-graph.svg';
        link.href = dataUrl;
        link.click();
      })
      .catch((error: unknown) => {
        console.error('Export failed:', error);
        alert('匯出 SVG 失敗，請再試一次');
      });
  };

  if (data.length === 0) {
    return (
      <Card className="w-full h-[calc(100vh-15rem)]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Network className="h-16 w-16 mx-auto text-accent-foreground" />
            <p>No organization data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[calc(100vh-15rem)] relative">
      <CardContent className="p-0 h-full">
        {/* 工具欄 */}
        <div className="absolute top-4 left-4 right-4 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            {/* 搜尋欄 */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-8"
              />
              <Button size="sm" variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* 控制按鈕 */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setZoom(zoom * 1.2)}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setZoom(zoom * 0.8)}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetView}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset View</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-6" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={exportAsImage}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export as Image</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* 資訊面板 */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold text-foreground">{selectedNode.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedNode(null)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p><span className="font-medium text-foreground">ID:</span> {selectedNode.attributes.ID}</p>
              <p><span className="font-medium text-foreground">Manager:</span> {selectedNode.attributes.Manager}</p>
              <p><span className="font-medium text-foreground">Employees:</span> {selectedNode.attributes.employeeCount}</p>
              <Badge variant="secondary">{selectedNode.attributes.status}</Badge>
            </div>
          </div>
        )}


        {/* 樹狀圖 */}
        <div ref={treeContainer} className="w-full h-full">
          <Tree
            data={treeData}
            renderCustomNodeElement={renderCustomNode}
            nodeSize={{ x: 250, y: 150 }}
            orientation="vertical"
            pathFunc="step"
            draggable={true}
            zoom={zoom}
            translate={translate}
            onUpdate={(update) => {
              setZoom(update.zoom);
              setTranslate(update.translate);
            }}
            scaleExtent={{ min: 0.1, max: 3 }}
            separation={{ siblings: 1.2, nonSiblings: 2 }}
            depthFactor={200}
          />
        </div>
      </CardContent>
    </Card>
  );
}