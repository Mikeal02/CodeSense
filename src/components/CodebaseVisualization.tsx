import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef, useState } from "react";

const nodes = [
  { id: "entry", x: 50, y: 15, label: "main.ts", size: 14, color: "primary" },
  { id: "router", x: 30, y: 35, label: "Router", size: 12, color: "info" },
  { id: "api", x: 70, y: 30, label: "API", size: 12, color: "warning" },
  { id: "auth", x: 15, y: 55, label: "Auth", size: 10, color: "success" },
  { id: "db", x: 50, y: 55, label: "Database", size: 11, color: "accent" },
  { id: "ui", x: 80, y: 52, label: "Components", size: 13, color: "primary" },
  { id: "utils", x: 35, y: 75, label: "Utils", size: 9, color: "info" },
  { id: "config", x: 65, y: 78, label: "Config", size: 9, color: "warning" },
  { id: "ai", x: 50, y: 40, label: "AI Engine", size: 16, color: "accent", isCore: true },
];

const edges = [
  ["entry", "router"], ["entry", "api"], ["router", "auth"], ["router", "ui"],
  ["api", "db"], ["api", "ai"], ["ai", "db"], ["ai", "utils"],
  ["ui", "utils"], ["db", "config"], ["auth", "db"],
];

const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

const colorMap: Record<string, string> = {
  primary: "hsl(var(--primary))",
  info: "hsl(var(--info))",
  warning: "hsl(var(--warning))",
  success: "hsl(var(--success))",
  accent: "hsl(var(--accent))",
};

const CodebaseVisualization = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 150, damping: 20 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0.5); mouseY.set(0.5); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className="relative w-full aspect-square max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glow background */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border border-border/20" />

      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {/* Edges */}
        {edges.map(([from, to], i) => {
          const a = nodeMap[from];
          const b = nodeMap[to];
          const isHighlighted = hoveredNode === from || hoveredNode === to;
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--border))"}
              strokeWidth={isHighlighted ? 0.4 : 0.15}
              strokeOpacity={isHighlighted ? 0.8 : 0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
            />
          );
        })}

        {/* Data flow particles */}
        {edges.slice(0, 5).map(([from, to], i) => {
          const a = nodeMap[from];
          const b = nodeMap[to];
          return (
            <motion.circle
              key={`particle-${i}`}
              r={0.5}
              fill="hsl(var(--primary))"
              opacity={0.6}
              animate={{
                cx: [a.x, b.x],
                cy: [a.y, b.y],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "linear",
              }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const color = colorMap[node.color];
          const isHovered = hoveredNode === node.id;
          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              {/* Glow ring */}
              {node.isCore && (
                <motion.circle
                  cx={node.x} cy={node.y} r={node.size / 2 + 3}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.3}
                  strokeOpacity={0.2}
                  animate={{ r: [node.size / 2 + 2, node.size / 2 + 4, node.size / 2 + 2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}
              <motion.circle
                cx={node.x} cy={node.y}
                r={isHovered ? node.size / 2 + 1 : node.size / 2}
                fill={`${color}`}
                fillOpacity={isHovered ? 0.25 : 0.12}
                stroke={color}
                strokeWidth={isHovered ? 0.5 : 0.3}
                strokeOpacity={isHovered ? 0.8 : 0.4}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.07, type: "spring", stiffness: 300 }}
              />
              <motion.text
                x={node.x} y={node.y + 0.5}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground"
                fontSize={node.isCore ? 3 : 2.2}
                fontFamily="monospace"
                fontWeight={node.isCore ? 700 : 500}
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0.7 }}
                transition={{ delay: 0.5 + i * 0.07 }}
              >
                {node.label}
              </motion.text>
            </g>
          );
        })}
      </svg>

      {/* "AI Processing" badge */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-primary"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[10px] font-mono text-muted-foreground">AI Processing • {nodes.length} modules</span>
      </motion.div>
    </motion.div>
  );
};

export default CodebaseVisualization;
