import { useMemo } from "react";
import { motion } from "framer-motion";
import { X, Zap, Clock, TrendingDown, TrendingUp, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { PerformanceStats } from "@/hooks/usePerformanceMetrics";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PerformanceMonitorProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PerformanceStats;
  onClear: () => void;
}

const PerformanceMonitor = ({ isOpen, onClose, stats, onClear }: PerformanceMonitorProps) => {
  const chartData = useMemo(() => {
    return Object.entries(stats.operationCounts).map(([name, count]) => ({
      name: name.length > 15 ? name.slice(0, 15) + '...' : name,
      count,
    })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [stats.operationCounts]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success to-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Performance Monitor</h3>
              <p className="text-xs text-muted-foreground">{stats.totalOperations} operations tracked</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">Clear</Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Average</span>
              </div>
              <div className="text-xl font-bold">{stats.averageDuration.toFixed(0)}ms</div>
            </div>
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Slowest</span>
              </div>
              <div className="text-xl font-bold">{stats.slowestOperation?.duration?.toFixed(0) || 0}ms</div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {stats.slowestOperation?.operation || "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center gap-2 text-success mb-1">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs">Fastest</span>
              </div>
              <div className="text-xl font-bold">{stats.fastestOperation?.duration?.toFixed(0) || 0}ms</div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {stats.fastestOperation?.operation || "N/A"}
              </p>
            </div>
          </div>

          {/* Operations Chart */}
          {chartData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Operation Frequency
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Operations */}
          <div>
            <h4 className="text-sm font-medium mb-3">Recent Operations</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {stats.recentEntries.slice(0, 10).map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-1.5 px-3 rounded bg-secondary/20 text-sm">
                  <span className="text-foreground/80 truncate flex-1">{entry.operation}</span>
                  <span className={cn(
                    "text-xs font-mono ml-2",
                    (entry.duration || 0) > 1000 ? "text-destructive" :
                    (entry.duration || 0) > 500 ? "text-warning" : "text-success"
                  )}>
                    {entry.duration?.toFixed(0)}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PerformanceMonitor;
