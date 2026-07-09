import { motion } from "framer-motion";
import {
  Clock,  Brain, MessageSquare, FileCode, Bookmark,
  Download, Search, Palette, Save, AlertTriangle, X
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { ActivityEntry, ActivityType } from "@/hooks/useActivityLog";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface ActivityTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityEntry[];
  onClear: () => void;
}

const typeConfig: Record<ActivityType, { icon: typeof FaGithub; color: string }> = {
  repo_connected: { icon: FaGithub, color: "text-success" },
  mode_selected: { icon: Brain, color: "text-primary" },
  question_asked: { icon: MessageSquare, color: "text-info" },
  file_viewed: { icon: FileCode, color: "text-accent" },
  bookmark_added: { icon: Bookmark, color: "text-warning" },
  export_created: { icon: Download, color: "text-success" },
  search_performed: { icon: Search, color: "text-muted-foreground" },
  theme_changed: { icon: Palette, color: "text-accent" },
  conversation_saved: { icon: Save, color: "text-primary" },
  error_occurred: { icon: AlertTriangle, color: "text-destructive" },
  report_shared: { icon: Download, color: "text-info" },
};

const ActivityTimeline = ({ isOpen, onClose, activities, onClear }: ActivityTimelineProps) => {
  if (!isOpen) return null;

  // Group by date
  const grouped = activities.reduce((acc, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, ActivityEntry[]>);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Activity Log</h3>
              <p className="text-xs text-muted-foreground">{activities.length} events tracked</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activities.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-muted-foreground">
                Clear
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Clock className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">No activity recorded yet</p>
            </div>
          ) : (
            <div className="p-4">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date} className="mb-6">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{date}</h4>
                  <div className="relative pl-6 space-y-3">
                    {/* Timeline line */}
                    <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
                    
                    {items.map((activity, i) => {
                      const config = typeConfig[activity.type];
                      const Icon = config.icon;

                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="relative flex items-start gap-3"
                        >
                          <div className={cn(
                            "absolute -left-6 w-5 h-5 rounded-full bg-background border-2 border-border flex items-center justify-center",
                          )}>
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", config.color)} />
                              <span className="text-sm font-medium truncate">{activity.title}</span>
                            </div>
                            {activity.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
};

export default ActivityTimeline;
