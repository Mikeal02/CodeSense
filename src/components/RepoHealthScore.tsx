import { motion } from "framer-motion";
import { useMemo } from "react";
import { FileContent } from "@/hooks/useCodebaseAnalysis";
import { Shield, Zap, GitBranch, FileCode, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepoHealthScoreProps {
  files: FileContent[];
  repoName: string;
}

const CircleGauge = ({ value, size = 80, strokeWidth = 7, color }: { value: number; size?: number; strokeWidth?: number; color: string }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  );
};

const RepoHealthScore = ({ files, repoName }: RepoHealthScoreProps) => {
  const metrics = useMemo(() => {
    const totalFiles = files.length;
    const totalLines = files.reduce((acc, f) => acc + f.content.split("\n").length, 0);
    const avgLines = totalLines / Math.max(totalFiles, 1);

    // Heuristic scores
    const sizeScore = Math.max(0, 100 - Math.max(0, (avgLines - 100) / 5));
    const diversityScore = (() => {
      const exts = new Set(files.map((f) => f.path.split(".").pop()));
      return Math.min(100, exts.size * 15);
    })();
    const structureScore = (() => {
      const hasSrc = files.some((f) => f.path.startsWith("src/"));
      const hasTests = files.some((f) => f.path.includes("test") || f.path.includes("spec"));
      const hasConfig = files.some((f) => f.path.includes("config") || f.path.endsWith(".json"));
      return (hasSrc ? 40 : 0) + (hasTests ? 35 : 0) + (hasConfig ? 25 : 0);
    })();
    const docScore = (() => {
      const documented = files.filter((f) => {
        const content = f.content;
        return content.includes("/**") || content.includes("//") || f.path.endsWith(".md");
      }).length;
      return Math.min(100, Math.round((documented / Math.max(totalFiles, 1)) * 100));
    })();

    const overall = Math.round((sizeScore + diversityScore + structureScore + docScore) / 4);

    return { sizeScore: Math.round(sizeScore), diversityScore, structureScore, docScore, overall, totalFiles, totalLines, avgLines: Math.round(avgLines) };
  }, [files]);

  const getGrade = (score: number) => {
    if (score >= 85) return { label: "Excellent", color: "hsl(142, 71%, 45%)" };
    if (score >= 70) return { label: "Good", color: "hsl(172, 66%, 50%)" };
    if (score >= 50) return { label: "Fair", color: "hsl(38, 92%, 50%)" };
    return { label: "Needs Work", color: "hsl(0, 84%, 60%)" };
  };

  const grade = getGrade(metrics.overall);

  const subMetrics = [
    { label: "Code Size", value: metrics.sizeScore, icon: FileCode, color: "hsl(172, 66%, 50%)" },
    { label: "Diversity", value: metrics.diversityScore, icon: GitBranch, color: "hsl(217, 91%, 60%)" },
    { label: "Structure", value: metrics.structureScore, icon: Shield, color: "hsl(265, 83%, 67%)" },
    { label: "Docs", value: metrics.docScore, icon: TrendingUp, color: "hsl(38, 92%, 50%)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl border border-border/50 p-5 max-w-2xl mx-auto"
    >
      <div className="flex items-start gap-5">
        {/* Big gauge */}
        <div className="relative flex-shrink-0">
          <CircleGauge value={metrics.overall} size={100} strokeWidth={8} color={grade.color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono text-foreground">{metrics.overall}</span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4" style={{ color: grade.color }} />
            <span className="font-semibold text-foreground">Repo Health Score</span>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: grade.color, background: `${grade.color}20` }}>
              {grade.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3 truncate">{repoName}</p>

          {/* Sub metrics */}
          <div className="grid grid-cols-2 gap-2">
            {subMetrics.map((m) => (
              <div key={m.label} className="flex items-center gap-2">
                <m.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: m.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                    <span className="text-[10px] font-mono text-foreground">{m.value}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-border overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Files", value: metrics.totalFiles, icon: FileCode },
          { label: "Total Lines", value: metrics.totalLines.toLocaleString(), icon: TrendingUp },
          { label: "Avg Lines/File", value: metrics.avgLines, icon: AlertTriangle },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-sm font-bold font-mono text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RepoHealthScore;
