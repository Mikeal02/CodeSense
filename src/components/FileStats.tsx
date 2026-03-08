import { useMemo } from "react";
import { FileCode, FolderTree, Code, GitBranch, Package, AlertTriangle, TrendingUp, Zap, Shield, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FileStatsProps {
  files: { path: string; content: string }[];
  className?: string;
}

interface LanguageStats {
  name: string;
  count: number;
  lines: number;
  color: string;
}

const languageColors: Record<string, string> = {
  typescript: "hsl(var(--info))", javascript: "hsl(var(--warning))",
  python: "hsl(142 71% 45%)", css: "hsl(var(--accent))",
  html: "hsl(var(--destructive))", json: "hsl(var(--muted-foreground))",
  markdown: "hsl(var(--info))", yaml: "hsl(var(--destructive))",
  rust: "hsl(20 70% 65%)", go: "hsl(190 80% 50%)", java: "hsl(20 60% 50%)",
  other: "hsl(var(--muted-foreground))",
};

const getLanguage = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
    py: "python", css: "css", scss: "css", html: "html", json: "json",
    md: "markdown", yaml: "yaml", yml: "yaml", rs: "rust", go: "go", java: "java",
  };
  return langMap[ext || ""] || "other";
};

const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => (
  <motion.span
    key={value}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="tabular-nums"
  >
    {value.toLocaleString()}{suffix}
  </motion.span>
);

const FileStats = ({ files, className }: FileStatsProps) => {
  const stats = useMemo(() => {
    const totalLines = files.reduce((sum, f) => sum + f.content.split('\n').length, 0);
    const totalChars = files.reduce((sum, f) => sum + f.content.length, 0);

    const langMap = new Map<string, LanguageStats>();
    files.forEach(file => {
      const lang = getLanguage(file.path);
      const lines = file.content.split('\n').length;
      if (!langMap.has(lang)) {
        langMap.set(lang, { name: lang, count: 0, lines: 0, color: languageColors[lang] || languageColors.other });
      }
      const entry = langMap.get(lang)!;
      entry.count++;
      entry.lines += lines;
    });
    const languages = Array.from(langMap.values()).sort((a, b) => b.lines - a.lines);

    const folderCounts = new Map<string, number>();
    files.forEach(file => {
      const parts = file.path.split('/');
      if (parts.length > 1) folderCounts.set(parts[0], (folderCounts.get(parts[0]) || 0) + 1);
    });
    const topFolders = Array.from(folderCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const largeFiles = files.filter(f => f.content.split('\n').length > 200);
    const deepNesting = files.filter(f => f.path.split('/').length > 4);

    // Complexity score
    const avgLines = totalLines / files.length;
    const complexity = Math.min(100, Math.round(
      (languages.length / 8) * 25 +
      (files.length / 100) * 25 +
      (avgLines > 100 ? 25 : avgLines / 100 * 25) +
      (largeFiles.length / files.length) * 25
    ));

    return {
      totalFiles: files.length, totalLines, totalChars, languages, topFolders,
      largeFiles: largeFiles.length, deepNesting: deepNesting.length,
      avgLinesPerFile: Math.round(totalLines / files.length) || 0,
      complexity,
    };
  }, [files]);

  if (files.length === 0) return null;

  const statCards = [
    { icon: FileCode, label: "Files", value: stats.totalFiles, color: "text-primary" },
    { icon: Code, label: "Lines", value: stats.totalLines, color: "text-info" },
    { icon: Package, label: "Languages", value: stats.languages.length, color: "text-accent" },
    { icon: GitBranch, label: "Avg L/F", value: stats.avgLinesPerFile, color: "text-success" },
    { icon: Zap, label: "Complexity", value: stats.complexity, color: "text-warning", suffix: "%" },
    { icon: Hash, label: "Characters", value: stats.totalChars, color: "text-muted-foreground" },
  ];

  return (
    <div className={cn("space-y-5", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-3 border border-border/30 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors group"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <card.icon className={cn("w-3 h-3", card.color)} />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50">{card.label}</span>
            </div>
            <div className="text-lg font-bold text-foreground leading-none">
              <AnimatedNumber value={card.value} suffix={card.suffix} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Language Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl p-4 border border-border/30 bg-card/30 backdrop-blur-sm"
      >
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-primary" />
          Language Distribution
        </h3>

        {/* Stacked bar */}
        <div className="h-3 rounded-full overflow-hidden flex mb-3 bg-secondary/30">
          {stats.languages.map(lang => (
            <motion.div
              key={lang.name}
              initial={{ width: 0 }}
              animate={{ width: `${(lang.lines / stats.totalLines) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ backgroundColor: lang.color }}
              title={`${lang.name}: ${lang.lines} lines`}
              className="h-full hover:opacity-80 transition-opacity cursor-default"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {stats.languages.slice(0, 6).map(lang => (
            <div key={lang.name} className="flex items-center gap-2 text-[11px]">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: lang.color }} />
              <span className="capitalize text-foreground/80">{lang.name}</span>
              <span className="text-muted-foreground/40 ml-auto tabular-nums">{lang.count}f · {lang.lines}L</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Folders */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl p-4 border border-border/30 bg-card/30 backdrop-blur-sm"
      >
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
          <FolderTree className="w-3.5 h-3.5 text-primary" />
          Directory Composition
        </h3>
        <div className="space-y-2">
          {stats.topFolders.map(([folder, count], i) => (
            <div key={folder} className="flex items-center gap-3">
              <span className="text-[11px] text-foreground/70 font-mono w-20 truncate">{folder}/</span>
              <div className="flex-1 h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / stats.totalFiles) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="h-full bg-primary/60 rounded-full"
                />
              </div>
              <span className="text-[10px] text-muted-foreground/40 w-8 text-right tabular-nums">{count}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Warnings */}
      {(stats.largeFiles > 0 || stats.deepNesting > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl p-4 border border-destructive/20 bg-destructive/5 backdrop-blur-sm"
        >
          <h3 className="text-xs font-semibold mb-2 flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-3.5 h-3.5" />
            Complexity Warnings
          </h3>
          <div className="space-y-1 text-[11px]">
            {stats.largeFiles > 0 && (
              <p className="text-muted-foreground">
                <span className="text-destructive font-medium">{stats.largeFiles}</span> files exceed 200 lines
              </p>
            )}
            {stats.deepNesting > 0 && (
              <p className="text-muted-foreground">
                <span className="text-destructive font-medium">{stats.deepNesting}</span> deeply nested files (4+ levels)
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileStats;
