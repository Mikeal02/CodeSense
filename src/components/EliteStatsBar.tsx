import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FileCode, Cpu, Activity, Clock, Layers, Zap } from "lucide-react";

interface EliteStatsBarProps {
  fileCount: number;
  tokenEstimate: number;
  activeMode: string;
  analysisTime?: number;
  linesOfCode?: number;
}

const AnimatedNumber = ({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = decimals > 0
            ? v.toFixed(decimals) + suffix
            : Math.floor(v).toLocaleString() + suffix;
        }
      },
    });
    return () => controls.stop();
  }, [value, suffix, decimals]);

  return <span ref={ref} className="font-mono font-bold text-foreground">0</span>;
};

const StatItem = ({ icon: Icon, label, children, color, delay }: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/20"
  >
    <Icon className={`w-3.5 h-3.5 ${color}`} />
    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
    <span className="text-xs">{children}</span>
  </motion.div>
);

const SystemLoadBar = ({ value }: { value: number }) => (
  <div className="w-16 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
    <motion.div
      className="h-full rounded-full"
      style={{
        background: value > 80
          ? "hsl(var(--destructive))"
          : value > 50
            ? "hsl(var(--warning))"
            : "hsl(var(--success))",
      }}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    />
  </div>
);

const EliteStatsBar = ({ fileCount, tokenEstimate, activeMode, analysisTime, linesOfCode }: EliteStatsBarProps) => {
  const [systemLoad, setSystemLoad] = useState(0);

  useEffect(() => {
    const target = Math.min(95, Math.max(15, (fileCount / 100) * 40 + Math.random() * 20));
    setSystemLoad(target);
    const interval = setInterval(() => {
      setSystemLoad((prev) => Math.max(10, Math.min(95, prev + (Math.random() - 0.5) * 8)));
    }, 3000);
    return () => clearInterval(interval);
  }, [fileCount]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-border/20 bg-card/40 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 py-2 overflow-x-auto scrollbar-hide">
          {/* Live indicator */}
          <motion.div
            className="flex items-center gap-1.5 pr-3 border-r border-border/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-success"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] text-success font-mono uppercase tracking-wider">Live</span>
          </motion.div>

          <StatItem icon={FileCode} label="Files" color="text-primary" delay={0.1}>
            <AnimatedNumber value={fileCount} />
          </StatItem>

          <StatItem icon={Cpu} label="Tokens" color="text-info" delay={0.15}>
            <AnimatedNumber value={tokenEstimate} suffix="K" />
          </StatItem>

          {linesOfCode !== undefined && (
            <StatItem icon={Layers} label="LOC" color="text-accent" delay={0.2}>
              <AnimatedNumber value={linesOfCode} />
            </StatItem>
          )}

          <StatItem icon={Zap} label="Mode" color="text-warning" delay={0.25}>
            <span className="font-mono font-medium text-foreground text-xs capitalize">{activeMode || "—"}</span>
          </StatItem>

          {analysisTime !== undefined && (
            <StatItem icon={Clock} label="Time" color="text-success" delay={0.3}>
              <AnimatedNumber value={analysisTime} suffix="s" decimals={1} />
            </StatItem>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center gap-2 px-3 py-1.5 ml-auto"
          >
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Load</span>
            <SystemLoadBar value={systemLoad} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EliteStatsBar;
