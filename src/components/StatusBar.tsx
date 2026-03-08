import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { 
  GitBranch, FileCode, Cpu, WifiOff, Clock, 
  Loader2, Terminal, Zap, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  isConnected: boolean;
  repoName?: string;
  fileCount: number;
  activeMode?: string;
  isLoading: boolean;
  isDarkMode: boolean;
  messageCount: number;
  performanceScore?: number;
}

const StatusBar = memo(({
  isConnected,
  repoName,
  fileCount,
  activeMode,
  isLoading,
  isDarkMode,
  messageCount,
  performanceScore,
}: StatusBarProps) => {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-40 h-7 bg-card/80 backdrop-blur-2xl border-t border-border/20 flex items-center justify-between px-3 text-[10px] font-mono select-none"
      data-onboarding="status-bar"
    >
      {/* Left section */}
      <div className="flex items-center gap-2.5">
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-sm",
          isConnected ? "text-success" : "text-muted-foreground/50"
        )}>
          {isConnected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-success shadow-sm shadow-success/50" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Disconnected</span>
            </>
          )}
        </div>

        {repoName && (
          <div className="flex items-center gap-1.5 text-foreground/50">
            <GitBranch className="w-3 h-3" />
            <span className="max-w-[140px] truncate">{repoName}</span>
          </div>
        )}

        {fileCount > 0 && (
          <div className="flex items-center gap-1.5 text-foreground/50">
            <FileCode className="w-3 h-3" />
            <span>{fileCount} files</span>
          </div>
        )}

        {activeMode && (
          <div className="flex items-center gap-1.5 text-primary/70">
            <Zap className="w-3 h-3" />
            <span>{activeMode}</span>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-1.5 text-warning/70">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-foreground/30">
          <Terminal className="w-3 h-3" />
          <span>{messageCount} msgs</span>
        </div>

        {performanceScore !== undefined && (
          <div className={cn(
            "flex items-center gap-1.5",
            performanceScore > 80 ? "text-success/60" : performanceScore > 50 ? "text-warning/60" : "text-destructive/60"
          )}>
            <Cpu className="w-3 h-3" />
            <span>{performanceScore}%</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-foreground/30">
          <Clock className="w-3 h-3" />
          <span>{formatUptime(uptime)}</span>
        </div>

        <div className="flex items-center gap-1.5 text-foreground/30">
          <Eye className="w-3 h-3" />
          <span>{isDarkMode ? "Dark" : "Light"}</span>
        </div>

        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          isLoading ? "bg-warning animate-pulse" : isConnected ? "bg-success shadow-sm shadow-success/50" : "bg-muted-foreground/30"
        )} />
      </div>
    </motion.div>
  );
});

StatusBar.displayName = "StatusBar";

export default StatusBar;
