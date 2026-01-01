import { Clock, Github, FolderUp, Zap, X, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { RecentRepo } from "@/hooks/useRecentRepos";
import { formatDistanceToNow } from "date-fns";

interface RecentReposPanelProps {
  repos: RecentRepo[];
  onSelectRepo: (repo: RecentRepo) => void;
  onRemoveRepo: (name: string) => void;
  onClearAll: () => void;
  className?: string;
}

const RecentReposPanel = ({ 
  repos, 
  onSelectRepo, 
  onRemoveRepo, 
  onClearAll,
  className 
}: RecentReposPanelProps) => {
  if (repos.length === 0) {
    return null;
  }

  const getIcon = (source: RecentRepo["source"]) => {
    switch (source) {
      case "github":
        return <Github className="w-4 h-4" />;
      case "local":
        return <FolderUp className="w-4 h-4" />;
      case "demo":
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("glass rounded-xl p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Clock className="w-4 h-4 text-primary" />
          Recent Projects
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>
      
      <div className="space-y-1">
        {repos.slice(0, 5).map((repo) => (
          <div
            key={repo.name}
            className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
            onClick={() => onSelectRepo(repo)}
          >
            <div className="text-muted-foreground group-hover:text-primary transition-colors">
              {getIcon(repo.source)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {repo.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(repo.accessedAt, { addSuffix: true })}
                {repo.fileCount && ` • ${repo.fileCount} files`}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveRepo(repo.name);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded transition-all"
            >
              <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReposPanel;
