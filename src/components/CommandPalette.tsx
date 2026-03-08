import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCode,
  Search,
  Bookmark,
  Download,
  Keyboard,
  Columns2,
  BarChart3,
  Moon,
  Sun,
  Zap,
  Eye,
  Map,
  PlayCircle,
  GraduationCap,
  MessageSquare,
  Briefcase,
  Brain,
  AlertTriangle,
  GitBranch,
  FileText,
  Link2,
  Settings,
  Clock,
  GitCompare,
  Activity,
  HelpCircle,
  Command,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fuzzyFilter } from "@/lib/fuzzyMatch";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: { path: string; content: string }[];
  onSelectFile: (path: string) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  onOpenSplitView: () => void;
  onOpenStats: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
  // New props for enhanced palette
  onSelectMode?: (mode: string) => void;
  activeMode?: string;
  onOpenSettings?: () => void;
  onOpenAnalytics?: () => void;
  onOpenActivityLog?: () => void;
  onOpenConversations?: () => void;
  onOpenDiffView?: () => void;
  onOpenPerformance?: () => void;
  onStartOnboarding?: () => void;
  isConnected?: boolean;
}

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: string;
  shortcut?: string;
  action: () => void;
  keywords?: string;
}

const modeIcons: Record<string, React.ElementType> = {
  overview: Eye,
  map: Map,
  flow: PlayCircle,
  teach: GraduationCap,
  ask: MessageSquare,
  interview: Briefcase,
  forgot: Brain,
  complexity: AlertTriangle,
  impact: GitBranch,
  resume: FileText,
  coupling: Link2,
};

const modeLabels: Record<string, string> = {
  overview: "Project Overview",
  map: "Project Map",
  flow: "Execution Flow",
  teach: "Teach-Me Mode",
  ask: "Ask Anything",
  interview: "Interview Prep",
  forgot: "Forgot Everything",
  complexity: "Complexity Detection",
  impact: "Change Impact",
  resume: "Resume Summary",
  coupling: "Coupling Analysis",
};

const CommandPalette = ({
  isOpen,
  onClose,
  files,
  onSelectFile,
  onOpenSearch,
  onOpenBookmarks,
  onOpenExport,
  onOpenShortcuts,
  onOpenSplitView,
  onOpenStats,
  onToggleTheme,
  isDarkMode,
  onSelectMode,
  activeMode,
  onOpenSettings,
  onOpenAnalytics,
  onOpenActivityLog,
  onOpenConversations,
  onOpenDiffView,
  onOpenPerformance,
  onStartOnboarding,
  isConnected,
}: CommandPaletteProps) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (callback: () => void) => {
    callback();
    onClose();
  };

  // Build all palette items
  const allItems = useMemo<PaletteItem[]>(() => {
    const items: PaletteItem[] = [];

    // Actions
    items.push(
      { id: "search", label: "Search in Files", icon: Search, category: "Actions", shortcut: "⌘⇧F", action: onOpenSearch, keywords: "find grep code" },
      { id: "split", label: "Open Split View", icon: Columns2, category: "Actions", shortcut: "⌘\\", action: onOpenSplitView, keywords: "dual panel side" },
      { id: "bookmarks", label: "View Bookmarks", icon: Bookmark, category: "Actions", shortcut: "⌘B", action: onOpenBookmarks, keywords: "saved favorites" },
      { id: "stats", label: "View Statistics", icon: BarChart3, category: "Actions", action: onOpenStats, keywords: "metrics charts" },
      { id: "export", label: "Export Report", icon: Download, category: "Actions", shortcut: "⌘E", action: onOpenExport, keywords: "download save pdf" },
    );

    // Modes
    Object.entries(modeLabels).forEach(([id, label]) => {
      items.push({
        id: `mode-${id}`,
        label,
        description: activeMode === id ? "Active" : undefined,
        icon: modeIcons[id] || Zap,
        category: "Analysis Modes",
        action: () => onSelectMode?.(id),
        keywords: `mode analyze ${id}`,
      });
    });

    // Tools
    if (onOpenAnalytics) items.push({ id: "analytics", label: "Analytics Dashboard", icon: BarChart3, category: "Tools", shortcut: "⌘⇧A", action: onOpenAnalytics, keywords: "charts data" });
    if (onOpenDiffView) items.push({ id: "diff", label: "File Comparison", icon: GitCompare, category: "Tools", action: onOpenDiffView, keywords: "diff compare changes" });
    if (onOpenConversations) items.push({ id: "conversations", label: "Conversations", icon: MessageSquare, category: "Tools", action: onOpenConversations, keywords: "chat history" });
    if (onOpenActivityLog) items.push({ id: "activity", label: "Activity Log", icon: Clock, category: "Tools", shortcut: "⌘J", action: onOpenActivityLog, keywords: "history timeline" });
    if (onOpenPerformance) items.push({ id: "perf", label: "Performance Monitor", icon: Activity, category: "Tools", shortcut: "⌘⇧P", action: onOpenPerformance, keywords: "speed metrics" });

    // Settings
    if (onToggleTheme) items.push({
      id: "theme",
      label: isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode",
      icon: isDarkMode ? Sun : Moon,
      category: "Settings",
      action: onToggleTheme,
      keywords: "theme dark light toggle",
    });
    if (onOpenSettings) items.push({ id: "settings", label: "Open Settings", icon: Settings, category: "Settings", shortcut: "⌘,", action: onOpenSettings, keywords: "preferences config" });
    items.push({ id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard, category: "Settings", shortcut: "⌘/", action: onOpenShortcuts, keywords: "hotkeys keys" });
    if (onStartOnboarding) items.push({ id: "onboarding", label: "Start Onboarding Tour", icon: HelpCircle, category: "Settings", action: onStartOnboarding, keywords: "help tour guide walkthrough" });

    // Files
    files.slice(0, 50).forEach(f => {
      items.push({
        id: `file-${f.path}`,
        label: f.path.split("/").pop() || f.path,
        description: f.path,
        icon: FileCode,
        category: "Files",
        action: () => onSelectFile(f.path),
        keywords: f.path,
      });
    });

    return items;
  }, [files, isDarkMode, activeMode, onOpenSearch, onOpenBookmarks, onOpenExport, onOpenShortcuts, onOpenSplitView, onOpenStats, onToggleTheme, onSelectMode, onOpenSettings, onOpenAnalytics, onOpenActivityLog, onOpenConversations, onOpenDiffView, onOpenPerformance, onStartOnboarding]);

  // Fuzzy filter
  const filtered = useMemo(() => {
    const results = fuzzyFilter(
      allItems,
      search,
      item => `${item.label} ${item.keywords || ""} ${item.description || ""}`,
      25
    );
    return results;
  }, [allItems, search]);

  // Group filtered results by category
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(r => {
      const cat = r.item.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(r);
    });
    return groups;
  }, [filtered]);

  const flatItems = filtered.map(r => r.item);

  // Keyboard navigation
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter" && flatItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(flatItems[selectedIndex].action);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, flatItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]" onClick={onClose}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        />

        {/* Palette */}
        <div className="flex items-start justify-center pt-[15vh]" onClick={e => e.stopPropagation()}>
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[560px] mx-4 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-background/50 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
              <Command className="w-4 h-4 text-primary shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search files, modes, actions, settings..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-[10px] font-mono text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-none py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No results for "{search}"</p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-4 py-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {category}
                      </span>
                    </div>
                    {items.map((result) => {
                      const item = result.item;
                      const globalIndex = flatItems.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.action)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isSelected
                              ? "bg-primary/10 text-foreground"
                              : "text-foreground/80 hover:bg-secondary/50"
                          )}
                        >
                          <Icon className={cn(
                            "w-4 h-4 shrink-0",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate block">{item.label}</span>
                            {item.description && (
                              <span className="text-[11px] text-muted-foreground truncate block">{item.description}</span>
                            )}
                          </div>
                          {item.shortcut && (
                            <kbd className="shrink-0 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-secondary text-[10px] font-mono text-muted-foreground">
                              {item.shortcut}
                            </kbd>
                          )}
                          {isSelected && (
                            <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hints */}
            <div className="px-4 py-2 border-t border-border/40 flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-secondary font-mono">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-secondary font-mono">↵</kbd> Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-secondary font-mono">esc</kbd> Close
              </span>
              <span className="ml-auto">{filtered.length} results</span>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
