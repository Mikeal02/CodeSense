import { useMemo, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Info } from "lucide-react";
import { Button } from "./ui/button";

interface DependencyGraphProps {
  files: { path: string; content: string }[];
  className?: string;
}

interface GraphNode {
  id: string;
  name: string;
  type: "component" | "hook" | "util" | "page" | "style" | "config" | "other";
  imports: string[];
  importedBy: string[];
  x: number;
  y: number;
  size: number;
  color: string;
}

const getNodeType = (path: string): GraphNode["type"] => {
  if (path.includes("/components/")) return "component";
  if (path.includes("/hooks/")) return "hook";
  if (path.includes("/utils/") || path.includes("/lib/")) return "util";
  if (path.includes("/pages/")) return "page";
  if (path.endsWith(".css") || path.endsWith(".scss")) return "style";
  if (path.includes("config") || path.endsWith(".json") || path.endsWith(".toml")) return "config";
  return "other";
};

const nodeColors: Record<GraphNode["type"], string> = {
  component: "hsl(217, 91%, 60%)",
  hook: "hsl(142, 71%, 45%)",
  util: "hsl(38, 92%, 50%)",
  page: "hsl(265, 83%, 67%)",
  style: "hsl(0, 84%, 60%)",
  config: "hsl(172, 66%, 50%)",
  other: "hsl(215, 20%, 55%)",
};

const extractImports = (content: string): string[] => {
  const imports: string[] = [];
  const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    // Only include local imports (starting with ./ or @/)
    if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/')) {
      // Normalize the path
      let normalized = importPath
        .replace('@/', '')
        .replace(/^\.\//, '')
        .replace(/\.\.\//g, '');
      
      // Remove file extensions if present
      normalized = normalized.replace(/\.(ts|tsx|js|jsx|css|scss)$/, '');
      
      imports.push(normalized);
    }
  }
  return imports;
};

const DependencyGraph = ({ files, className }: DependencyGraphProps) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    
    // First pass: create all nodes
    files.forEach((file, index) => {
      const path = file.path;
      const name = path.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '') || path;
      const type = getNodeType(path);
      const imports = extractImports(file.content);
      
      nodeMap.set(path, {
        id: path,
        name,
        type,
        imports,
        importedBy: [],
        x: 0,
        y: 0,
        size: Math.min(40, 20 + (file.content.split('\n').length / 50) * 10),
        color: nodeColors[type],
      });
    });

    // Second pass: calculate importedBy
    nodeMap.forEach((node) => {
      node.imports.forEach((imp) => {
        // Find the matching file
        const matchingFile = Array.from(nodeMap.keys()).find(key => 
          key.includes(imp) || 
          key.replace(/\.(ts|tsx|js|jsx)$/, '').endsWith(imp)
        );
        if (matchingFile && nodeMap.has(matchingFile)) {
          nodeMap.get(matchingFile)!.importedBy.push(node.id);
        }
      });
    });

    // Layout using force-directed-like approach (simplified)
    const nodesArray = Array.from(nodeMap.values());
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Group by type
    const typeGroups: Record<string, GraphNode[]> = {};
    nodesArray.forEach(node => {
      if (!typeGroups[node.type]) typeGroups[node.type] = [];
      typeGroups[node.type].push(node);
    });

    // Position nodes in clusters by type
    const typeAngles: Record<string, number> = {
      page: 0,
      component: Math.PI / 3,
      hook: (2 * Math.PI) / 3,
      util: Math.PI,
      style: (4 * Math.PI) / 3,
      config: (5 * Math.PI) / 3,
      other: Math.PI / 2,
    };

    Object.entries(typeGroups).forEach(([type, nodes]) => {
      const baseAngle = typeAngles[type as keyof typeof typeAngles] || 0;
      const radius = 150 + nodes.length * 10;
      
      nodes.forEach((node, i) => {
        const angleOffset = (i / nodes.length) * (Math.PI / 3) - Math.PI / 6;
        const r = radius + (i % 3) * 30;
        node.x = centerX + Math.cos(baseAngle + angleOffset) * r;
        node.y = centerY + Math.sin(baseAngle + angleOffset) * r;
      });
    });

    return nodesArray;
  }, [files]);

  const edges = useMemo(() => {
    const edgeList: { from: GraphNode; to: GraphNode; strength: number }[] = [];
    
    nodes.forEach(node => {
      node.imports.forEach(imp => {
        const targetNode = nodes.find(n => 
          n.id.includes(imp) || 
          n.id.replace(/\.(ts|tsx|js|jsx)$/, '').endsWith(imp)
        );
        if (targetNode) {
          edgeList.push({
            from: node,
            to: targetNode,
            strength: 1,
          });
        }
      });
    });
    
    return edgeList;
  }, [nodes]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const isConnected = (nodeId: string) => {
    if (!hoveredNode) return true;
    if (nodeId === hoveredNode) return true;
    const hoveredNodeData = nodes.find(n => n.id === hoveredNode);
    if (!hoveredNodeData) return false;
    return hoveredNodeData.imports.some(imp => nodeId.includes(imp)) ||
           hoveredNodeData.importedBy.includes(nodeId);
  };

  if (files.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 text-muted-foreground", className)}>
        No files to visualize
      </div>
    );
  }

  return (
    <div className={cn("relative bg-card rounded-xl overflow-hidden border border-border/50", className)}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button variant="secondary" size="icon" onClick={() => setZoom(z => Math.min(3, z * 1.2))} className="h-8 w-8">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => setZoom(z => Math.max(0.3, z * 0.8))} className="h-8 w-8">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={resetView} className="h-8 w-8">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-sm rounded-lg p-3 text-xs space-y-1.5 border border-border/50">
        <div className="font-medium text-foreground mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Legend
        </div>
        {Object.entries(nodeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-10 bg-card/95 backdrop-blur-sm rounded-lg p-4 max-w-xs border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedNode.color }} />
            <span className="font-medium text-foreground">{selectedNode.name}</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Type: <span className="text-foreground/80 capitalize">{selectedNode.type}</span></p>
            <p>Imports: <span className="text-foreground/80">{selectedNode.imports.length} files</span></p>
            <p>Imported by: <span className="text-foreground/80">{selectedNode.importedBy.length} files</span></p>
            <p className="truncate text-muted-foreground">{selectedNode.id}</p>
          </div>
        </div>
      )}

      {/* Graph Canvas */}
      <svg
        ref={containerRef}
        className="w-full h-[500px] cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          <g>
            {edges.map((edge, i) => {
              const opacity = isConnected(edge.from.id) && isConnected(edge.to.id) ? 0.6 : 0.1;
              return (
                  <line
                  key={i}
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={edge.to.x}
                  y2={edge.to.y}
                  stroke="hsl(215, 20%, 55%)"
                  strokeWidth={1}
                  opacity={opacity}
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
          </g>

          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="hsl(215, 20%, 55%)" opacity="0.5" />
            </marker>
          </defs>

          {/* Nodes */}
          <g>
            {nodes.map((node) => {
              const opacity = isConnected(node.id) ? 1 : 0.2;
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode === node.id;
              
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer"
                  opacity={opacity}
                >
                  {/* Glow effect for hovered/selected */}
                  {(isHovered || isSelected) && (
                    <circle
                      r={node.size + 8}
                      fill={node.color}
                      opacity={0.2}
                    />
                  )}
                  
                  {/* Main node */}
                  <circle
                    r={node.size}
                    fill={node.color}
                    stroke={isSelected ? "hsl(210, 40%, 98%)" : "transparent"}
                    strokeWidth={2}
                    className="transition-all duration-200"
                  />
                  
                  {/* Label */}
                  <text
                    y={node.size + 14}
                    textAnchor="middle"
                    fill="hsl(215, 20%, 55%)"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {node.name.length > 12 ? node.name.slice(0, 12) + '...' : node.name}
                  </text>

                  {/* Connection count badge */}
                  {(node.imports.length + node.importedBy.length) > 3 && (
                    <g transform={`translate(${node.size * 0.7}, ${-node.size * 0.7})`}>
                      <circle r="8" fill="hsl(220, 14%, 16%)" />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="hsl(210, 40%, 98%)"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        {node.imports.length + node.importedBy.length}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Stats */}
      <div className="absolute bottom-4 right-4 z-10 text-xs text-muted-foreground">
        {nodes.length} nodes • {edges.length} edges • Zoom: {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default DependencyGraph;
