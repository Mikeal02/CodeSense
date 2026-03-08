import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  GitBranch, FileCode, Cpu, Wifi, WifiOff, Clock, 
  AlertCircle, CheckCircle, Loader2, Terminal, Globe,
  HardDrive, Zap, Eye
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

const StatusBar = ({
  isConnected,
  repoName,
  fileCount,
  activeMode,
  isLoading,
  isDarkMode,
  messageCount,
  performanceScore,
}: StatusBarProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setUptime(prev => prev + 1);
      // Simulate memory usage fluctuation
      setMemoryUsage(Math.round(40 + Math.random() * 30));
    }, 1000);
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
      className="fixed bottom-0 left-0 right-0 z-40 h-7 bg-card/95 backdrop-blur-xl border-t border-border/60 flex items-center justify-between px-3 text-[11px] font-mono select-none"
      data-onboarding="status-bar"
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-sm",
          isConnected ? "bg-success/10 text-success" : "text-muted-foreground"
        )}>
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Disconnected</span>
            </>
          )}
        </div>

        {/* Branch / Repo */}
        {repoName && (
          <div className="flex items-center gap-1.5 text-foreground/70">
            <GitBranch className="w-3 h-3" />
            <span className="max-w-[160px] truncate">{repoName}</span>
          </div>
        )}

        {/* File count */}
        {fileCount > 0 && (
          <div className="flex items-center gap-1.5 text-foreground/70">
            <FileCode className="w-3 h-3" />
            <span>{fileCount} files</span>
          </div>
        )}

        {/* Active mode */}
        {activeMode && (
          <div className="flex items-center gap-1.5 text-primary">
            <Zap className="w-3 h-3" />
            <span>{activeMode}</span>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-1.5 text-warning">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Messages */}
        <div className="flex items-center gap-1.5 text-foreground/60">
          <Terminal className="w-3 h-3" />
          <span>{messageCount} msgs</span>
        </div>

        {/* Memory */}
        <div className="flex items-center gap-1.5 text-foreground/60">
          <HardDrive className="w-3 h-3" />
          <span>{memoryUsage}MB</span>
        </div>

        {/* Performance score */}
        {performanceScore !== undefined && (
          <div className={cn(
            "flex items-center gap-1.5",
            performanceScore > 80 ? "text-success" : performanceScore > 50 ? "text-warning" : "text-destructive"
          )}>
            <Cpu className="w-3 h-3" />
            <span>{performanceScore}%</span>
          </div>
        )}

        {/* Uptime */}
        <div className="flex items-center gap-1.5 text-foreground/60">
          <Clock className="w-3 h-3" />
          <span>{formatUptime(uptime)}</span>
        </div>

        {/* Theme indicator */}
        <div className="flex items-center gap-1.5 text-foreground/60">
          <Eye className="w-3 h-3" />
          <span>{isDarkMode ? "Dark" : "Light"}</span>
        </div>

        {/* Status dot */}
        <div className={cn(
          "w-2 h-2 rounded-full",
          isLoading ? "bg-warning animate-pulse" : isConnected ? "bg-success" : "bg-muted-foreground"
        )} />
      </div>
    </motion.div>
  );
};

export default StatusBar;
