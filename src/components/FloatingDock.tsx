import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command, MessageSquare, BarChart3, FileSearch, Shield,
  GitCompare, Sparkles, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingDockProps {
  isConnected: boolean;
  onOpenCommandPalette: () => void;
  onOpenCodeReview: () => void;
  onOpenDepScanner: () => void;
  onOpenAnalytics: () => void;
  onOpenDiffView: () => void;
  onOpenConversations: () => void;
}

const dockItems = [
  { id: "command", icon: Command, label: "Command", key: "onOpenCommandPalette", connected: false },
  { id: "review", icon: FileSearch, label: "Review", key: "onOpenCodeReview", connected: true },
  { id: "security", icon: Shield, label: "Security", key: "onOpenDepScanner", connected: true },
  { id: "analytics", icon: BarChart3, label: "Analytics", key: "onOpenAnalytics", connected: true },
  { id: "diff", icon: GitCompare, label: "Compare", key: "onOpenDiffView", connected: true },
  { id: "chat", icon: MessageSquare, label: "Chat", key: "onOpenConversations", connected: true },
];

const FloatingDock = ({
  isConnected, onOpenCommandPalette, onOpenCodeReview,
  onOpenDepScanner, onOpenAnalytics, onOpenDiffView, onOpenConversations,
}: FloatingDockProps) => {
  const [expanded, setExpanded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handlers: Record<string, () => void> = {
    onOpenCommandPalette,
    onOpenCodeReview,
    onOpenDepScanner,
    onOpenAnalytics,
    onOpenDiffView,
    onOpenConversations,
  };

  const visibleItems = dockItems.filter((item) => !item.connected || isConnected);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="floating-dock mb-2"
          >
            {visibleItems.map((item, i) => {
              const Icon = item.icon;
              const isHovered = hoveredId === item.id;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => { handlers[item.key]?.(); setExpanded(false); }}
                  className="relative p-2.5 rounded-xl transition-colors hover:bg-primary/10 group"
                >
                  <motion.div
                    animate={{ scale: isHovered ? 1.25 : 1, y: isHovered ? -4 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-colors",
                      isHovered ? "text-primary" : "text-muted-foreground"
                    )} />
                  </motion.div>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span
                        initial={{ opacity: 0, y: 4, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.9 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-popover text-popover-foreground px-2 py-1 rounded-md border border-border/50 shadow-lg whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active dot */}
                  <motion.div
                    animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "mx-auto flex items-center justify-center w-12 h-12 rounded-2xl",
          "bg-primary text-primary-foreground shadow-xl shadow-primary/25",
          "transition-all duration-300",
          expanded && "bg-card text-foreground border border-border/40 shadow-lg"
        )}
      >
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingDock;
