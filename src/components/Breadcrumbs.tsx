import { ChevronRight, Home, Code2, FolderTree, MessageSquare, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className={cn(
      "flex items-center gap-1.5 text-xs text-muted-foreground px-4 sm:px-6 py-2 bg-card/30 border-b border-border/30",
      className
    )}>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3 text-border" />}
          <crumb.icon className="w-3 h-3" />
          <span className={cn(
            i === crumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {crumb.label}
          </span>
        </span>
      ))}
    </div>
  );
};

export default Breadcrumbs;
