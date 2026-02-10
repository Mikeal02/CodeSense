import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, X, Check, CheckCheck, Trash2,
  Info, AlertTriangle, CheckCircle, XCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Notification, NotificationType } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "./ui/scroll-area";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-info", bg: "bg-info/10" },
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

const NotificationCenter = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
  onClearAll,
}: NotificationCenterProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-96 bg-background border-l border-border shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="font-semibold">Notifications</span>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-xs gap-1">
                  <CheckCheck className="w-3.5 h-3.5" />
                  Read all
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notifications */}
          <ScrollArea className="flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">All clear!</p>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {notifications.map((notif, i) => {
                  const config = typeConfig[notif.type];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        "group flex gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                        notif.read ? "opacity-60 hover:opacity-100" : "bg-secondary/30",
                        "hover:bg-secondary/50"
                      )}
                      onClick={() => !notif.read && onMarkAsRead(notif.id)}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.bg)}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium truncate">{notif.title}</p>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                        </div>
                        {notif.message && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                        </p>
                        {notif.action && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-primary mt-1 -ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              notif.action!.onClick();
                            }}
                          >
                            {notif.action.label}
                          </Button>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="w-full text-xs text-muted-foreground hover:text-destructive gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all notifications
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationCenter;
