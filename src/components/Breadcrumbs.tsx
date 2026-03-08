import { ChevronRight, Home, Code2, FolderTree, MessageSquare, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BreadcrumbsProps {
  repoName?: string;
  activeMode?: string;
  isConnected: boolean;
  activePanel?: string;
  className?: string;
}

const panelIcons: Record<string, typeof Home> = {
  chat: MessageSquare,
  analytics: BarChart3,
  files: FolderTree,
};

const Breadcrumbs = ({ repoName, activeMode, isConnected, activePanel, className }: BreadcrumbsProps) => {
  if (!isConnected) return null;

  const crumbs = [
    { label: "CodeSense", icon: Code2 },
    ...(repoName ? [{ label: repoName, icon: FolderTree }] : []),
    ...(activeMode ? [{ label: activeMode, icon: panelIcons[activePanel || ""] || Home }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-1.5 text-[11px] text-muted-foreground px-4 sm:px-6 py-2 bg-card/20 backdrop-blur-sm border-b border-border/15",
        className
      )}
    >
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-border/60" />}
          <crumb.icon className="w-3 h-3 text-muted-foreground/50" />
          <span className={cn(
            "font-mono",
            i === crumbs.length - 1 ? "text-foreground/80 font-medium" : "text-muted-foreground/50"
          )}>
            {crumb.label}
          </span>
        </span>
      ))}
    </motion.div>
  );
};

export default Breadcrumbs;
