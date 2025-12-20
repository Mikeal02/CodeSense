import { useMemo } from "react";
import { FileCode, FolderTree, Code, GitBranch, Package, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  typescript: "#3178c6",
  javascript: "#f7df1e",
  python: "#3572A5",
  css: "#563d7c",
  html: "#e34c26",
  json: "#292929",
  markdown: "#083fa1",
  yaml: "#cb171e",
  rust: "#dea584",
  go: "#00ADD8",
  java: "#b07219",
  other: "#6c7086",
};

const getLanguage = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    css: "css",
    scss: "css",
    html: "html",
    json: "json",
    md: "markdown",
    yaml: "yaml",
    yml: "yaml",
    rs: "rust",
    go: "go",
    java: "java",
  };
  return langMap[ext || ""] || "other";
};

const FileStats = ({ files, className }: FileStatsProps) => {
  const stats = useMemo(() => {
    const totalLines = files.reduce((sum, f) => sum + f.content.split('\n').length, 0);
    const totalChars = files.reduce((sum, f) => sum + f.content.length, 0);
    
    // Language breakdown
    const langMap = new Map<string, LanguageStats>();
    files.forEach(file => {
      const lang = getLanguage(file.path);
      const lines = file.content.split('\n').length;
      if (!langMap.has(lang)) {
        langMap.set(lang, {
          name: lang,
          count: 0,
          lines: 0,
          color: languageColors[lang] || languageColors.other,
        });
      }
      const entry = langMap.get(lang)!;
      entry.count++;
      entry.lines += lines;
    });
    
    const languages = Array.from(langMap.values())
      .sort((a, b) => b.lines - a.lines);

    // Folder breakdown
    const folderCounts = new Map<string, number>();
    files.forEach(file => {
      const parts = file.path.split('/');
      if (parts.length > 1) {
        const folder = parts[0];
        folderCounts.set(folder, (folderCounts.get(folder) || 0) + 1);
      }
    });
    const topFolders = Array.from(folderCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Complexity indicators
    const largeFiles = files.filter(f => f.content.split('\n').length > 200);
    const deepNesting = files.filter(f => f.path.split('/').length > 4);
    
    return {
      totalFiles: files.length,
      totalLines,
      totalChars,
      languages,
      topFolders,
      largeFiles: largeFiles.length,
      deepNesting: deepNesting.length,
      avgLinesPerFile: Math.round(totalLines / files.length) || 0,
    };
  }, [files]);

  if (files.length === 0) {
    return null;
  }

  const maxLanguageLines = Math.max(...stats.languages.map(l => l.lines));

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card/50 rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileCode className="w-4 h-4" />
            <span className="text-xs">Files</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalFiles}</div>
        </div>
        
        <div className="bg-card/50 rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Code className="w-4 h-4" />
            <span className="text-xs">Lines</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalLines.toLocaleString()}</div>
        </div>
        
        <div className="bg-card/50 rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="w-4 h-4" />
            <span className="text-xs">Languages</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.languages.length}</div>
        </div>
        
        <div className="bg-card/50 rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <GitBranch className="w-4 h-4" />
            <span className="text-xs">Avg Lines/File</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.avgLinesPerFile}</div>
        </div>
      </div>

      {/* Language Breakdown */}
      <div className="bg-card/50 rounded-xl p-5 border border-border/50">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Code className="w-4 h-4 text-primary" />
          Language Breakdown
        </h3>
        
        {/* Language bar */}
        <div className="h-4 rounded-full overflow-hidden flex mb-4 bg-secondary">
          {stats.languages.map((lang, i) => (
            <div
              key={lang.name}
              style={{
                width: `${(lang.lines / stats.totalLines) * 100}%`,
                backgroundColor: lang.color,
              }}
              title={`${lang.name}: ${lang.lines} lines (${((lang.lines / stats.totalLines) * 100).toFixed(1)}%)`}
              className="transition-all duration-300 hover:opacity-80"
            />
          ))}
        </div>

        {/* Language list */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.languages.slice(0, 6).map(lang => (
            <div key={lang.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: lang.color }}
              />
              <span className="text-sm capitalize text-foreground">{lang.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {lang.count} files
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Folders */}
      <div className="bg-card/50 rounded-xl p-5 border border-border/50">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-primary" />
          Top Folders
        </h3>
        <div className="space-y-3">
          {stats.topFolders.map(([folder, count]) => (
            <div key={folder} className="flex items-center gap-3">
              <span className="text-sm text-foreground font-mono flex-1">{folder}/</span>
              <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(count / stats.totalFiles) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {(stats.largeFiles > 0 || stats.deepNesting > 0) && (
        <div className="bg-destructive/10 rounded-xl p-5 border border-destructive/30">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Complexity Warnings
          </h3>
          <div className="space-y-2 text-sm">
            {stats.largeFiles > 0 && (
              <p className="text-muted-foreground">
                <span className="text-destructive font-medium">{stats.largeFiles}</span> files with 200+ lines
              </p>
            )}
            {stats.deepNesting > 0 && (
              <p className="text-muted-foreground">
                <span className="text-destructive font-medium">{stats.deepNesting}</span> deeply nested files (4+ levels)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileStats;
