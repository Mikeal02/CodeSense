import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  X, FileCode, Code, FolderTree, AlertTriangle, TrendingUp,
  BarChart3, PieChart as PieChartIcon, Layers
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, ResponsiveContainer, Treemap
} from "recharts";

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  files: { path: string; content: string }[];
}

const COLORS = [
  "hsl(172, 66%, 50%)", "hsl(265, 83%, 67%)", "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)", "hsl(142, 71%, 45%)", "hsl(217, 91%, 60%)",
  "hsl(330, 70%, 55%)", "hsl(45, 85%, 55%)",
];

const getLanguage = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript",
    py: "Python", css: "CSS", scss: "SCSS", html: "HTML",
    json: "JSON", md: "Markdown", yaml: "YAML", yml: "YAML",
    rs: "Rust", go: "Go", java: "Java", sql: "SQL",
  };
  return map[ext || ""] || "Other";
};

const AnalyticsDashboard = ({ isOpen, onClose, files }: AnalyticsDashboardProps) => {
  const analytics = useMemo(() => {
    if (files.length === 0) return null;

    const totalLines = files.reduce((s, f) => s + f.content.split('\n').length, 0);
    const totalChars = files.reduce((s, f) => s + f.content.length, 0);

    // Language stats
    const langMap = new Map<string, { count: number; lines: number }>();
    files.forEach(f => {
      const lang = getLanguage(f.path);
      const lines = f.content.split('\n').length;
      const existing = langMap.get(lang) || { count: 0, lines: 0 };
      langMap.set(lang, { count: existing.count + 1, lines: existing.lines + lines });
    });
    const languages = Array.from(langMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.lines - a.lines);

    // File size distribution
    const fileSizes = files.map(f => ({
      name: f.path.split('/').pop() || f.path,
      path: f.path,
      lines: f.content.split('\n').length,
      chars: f.content.length,
    })).sort((a, b) => b.lines - a.lines);

    // Folder distribution
    const folders = new Map<string, number>();
    files.forEach(f => {
      const parts = f.path.split('/');
      if (parts.length > 1) {
        const folder = parts[0];
        folders.set(folder, (folders.get(folder) || 0) + 1);
      }
    });
    const folderData = Array.from(folders.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Complexity: lines of code per file for treemap
    const treemapData = files.slice(0, 30).map(f => ({
      name: f.path.split('/').pop() || f.path,
      size: f.content.split('\n').length,
      fullPath: f.path,
    }));

    // Code patterns
    const importCount = files.reduce((s, f) => s + (f.content.match(/^import /gm)?.length || 0), 0);
    const functionCount = files.reduce((s, f) => s + (f.content.match(/function |const \w+ = (\(|async)/gm)?.length || 0), 0);
    const classCount = files.reduce((s, f) => s + (f.content.match(/^class /gm)?.length || 0), 0);
    const commentLines = files.reduce((s, f) => s + (f.content.match(/\/\/|\/\*|\*\/|#/gm)?.length || 0), 0);

    const largeFiles = files.filter(f => f.content.split('\n').length > 200).length;
    const deepFiles = files.filter(f => f.path.split('/').length > 4).length;

    return {
      totalFiles: files.length,
      totalLines,
      totalChars,
      languages,
      fileSizes,
      folderData,
      treemapData,
      importCount,
      functionCount,
      classCount,
      commentLines,
      largeFiles,
      deepFiles,
      avgLines: Math.round(totalLines / files.length),
      codeToCommentRatio: commentLines > 0 ? Math.round(totalLines / commentLines) : 0,
    };
  }, [files]);

  if (!isOpen || !analytics) return null;

  const pieData = analytics.languages.map(l => ({
    name: l.name,
    value: l.lines,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md overflow-y-auto"
    >
      <div className="container mx-auto px-6 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-sm text-muted-foreground">Deep dive into your codebase metrics</p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Files", value: analytics.totalFiles, icon: FileCode },
            { label: "Lines", value: analytics.totalLines.toLocaleString(), icon: Code },
            { label: "Languages", value: analytics.languages.length, icon: Layers },
            { label: "Functions", value: analytics.functionCount, icon: TrendingUp },
            { label: "Imports", value: analytics.importCount, icon: FolderTree },
            { label: "Avg Lines", value: analytics.avgLines, icon: BarChart3 },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Language Distribution Pie */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-primary" />
              Language Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [`${value} lines`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {analytics.languages.slice(0, 6).map((lang, i) => (
                <div key={lang.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm">{lang.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{lang.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* File Size Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Top Files by Size
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.fileSizes.slice(0, 10)} layout="vertical">
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="lines" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Warnings & Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "rounded-xl p-5 border",
              analytics.largeFiles > 0 ? "bg-destructive/5 border-destructive/20" : "bg-success/5 border-success/20"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={cn("w-4 h-4", analytics.largeFiles > 0 ? "text-destructive" : "text-success")} />
              <span className="text-sm font-medium">Large Files</span>
            </div>
            <div className="text-2xl font-bold">{analytics.largeFiles}</div>
            <p className="text-xs text-muted-foreground mt-1">Files with 200+ lines</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl p-5 border bg-info/5 border-info/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-info" />
              <span className="text-sm font-medium">Code:Comment Ratio</span>
            </div>
            <div className="text-2xl font-bold">{analytics.codeToCommentRatio}:1</div>
            <p className="text-xs text-muted-foreground mt-1">Lines per comment</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "rounded-xl p-5 border",
              analytics.deepFiles > 0 ? "bg-warning/5 border-warning/20" : "bg-success/5 border-success/20"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <FolderTree className={cn("w-4 h-4", analytics.deepFiles > 0 ? "text-warning" : "text-success")} />
              <span className="text-sm font-medium">Deep Nesting</span>
            </div>
            <div className="text-2xl font-bold">{analytics.deepFiles}</div>
            <p className="text-xs text-muted-foreground mt-1">Files 4+ levels deep</p>
          </motion.div>
        </div>

        {/* Folder Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-primary" />
            Folder Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {analytics.folderData.slice(0, 8).map((folder, i) => (
              <div key={folder.name} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="text-sm font-mono text-foreground">{folder.name}/</div>
                <div className="text-lg font-bold text-primary mt-1">{folder.value}</div>
                <div className="text-xs text-muted-foreground">files</div>
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(folder.value / analytics.totalFiles) * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
