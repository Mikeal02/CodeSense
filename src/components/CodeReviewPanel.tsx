import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Shield, Bug, Zap, Lightbulb, AlertTriangle, ChevronDown, ChevronRight,
  Loader2, FileCode, CheckCircle2, XCircle, AlertCircle, Info, Sparkles,
  Wand2, Copy, Check, ArrowRight, Code2, Undo2, Download
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { CodeReviewResult, CodeReviewIssue, useCodeReview } from "@/hooks/useCodeReview";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";

interface CodeReviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  files: { path: string; content: string }[];
}

const categoryConfig = {
  bug: { icon: Bug, label: "Bug", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  security: { icon: Shield, label: "Security", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  performance: { icon: Zap, label: "Performance", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  improvement: { icon: Lightbulb, label: "Improvement", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

const severityConfig = {
  critical: { color: "text-red-400", bg: "bg-red-500/20", icon: XCircle },
  high: { color: "text-orange-400", bg: "bg-orange-500/20", icon: AlertTriangle },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/20", icon: AlertCircle },
  low: { color: "text-blue-400", bg: "bg-blue-500/20", icon: Info },
};

const ScoreGauge = ({ score }: { score: number }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "hsl(142 71% 45%)" : score >= 60 ? "hsl(48 96% 53%)" : "hsl(0 84% 60%)";
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : score >= 50 ? "D" : "F";

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {grade}
        </motion.span>
        <span className="text-xs text-muted-foreground">{score}/100</span>
      </div>
    </div>
  );
};

const DiffView = ({ beforeCode, afterCode }: { beforeCode: string; afterCode: string }) => {
  const beforeLines = beforeCode.split("\n");
  const afterLines = afterCode.split("\n");

  return (
    <div className="rounded-lg border border-border overflow-hidden text-xs font-mono">
      {/* Before */}
      <div className="bg-red-500/5 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-[10px] font-sans font-medium text-red-400">Before</span>
        </div>
        <div className="p-2 overflow-x-auto">
          {beforeLines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-6 text-right pr-2 text-muted-foreground/40 select-none shrink-0">{i + 1}</span>
              <span className="text-red-300/80 whitespace-pre">{line}</span>
            </div>
          ))}
        </div>
      </div>
      {/* After */}
      <div className="bg-green-500/5">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-[10px] font-sans font-medium text-green-400">After (Fixed)</span>
        </div>
        <div className="p-2 overflow-x-auto">
          {afterLines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-6 text-right pr-2 text-muted-foreground/40 select-none shrink-0">{i + 1}</span>
              <span className="text-green-300/80 whitespace-pre">{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const IssueCard = ({
  issue,
  index,
  appliedFixes,
  onApplyFix,
  onUndoFix,
  onCopyFix,
}: {
  issue: CodeReviewIssue;
  index: number;
  appliedFixes: Set<number>;
  onApplyFix: (idx: number) => void;
  onUndoFix: (idx: number) => void;
  onCopyFix: (code: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const cat = categoryConfig[issue.category];
  const sev = severityConfig[issue.severity];
  const CatIcon = cat.icon;
  const hasFix = !!(issue.beforeCode && issue.afterCode);
  const isApplied = appliedFixes.has(index);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "border rounded-lg overflow-hidden transition-all",
        isApplied ? "border-green-500/30 bg-green-500/5" : cat.border
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
      >
        {isApplied ? (
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
        ) : (
          <CatIcon className={cn("w-4 h-4 shrink-0", cat.color)} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium truncate", isApplied ? "text-green-400 line-through opacity-70" : "text-foreground")}>
              {issue.title}
            </span>
            {issue.line && (
              <span className="text-xs text-muted-foreground font-mono shrink-0">L{issue.line}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasFix && !isApplied && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Wand2 className="w-2.5 h-2.5 inline mr-0.5" />FIX
            </span>
          )}
          <span className={cn("text-[10px] font-medium uppercase px-1.5 py-0.5 rounded", sev.bg, sev.color)}>
            {issue.severity}
          </span>
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-2">
              <p className="text-xs text-muted-foreground leading-relaxed">{issue.description}</p>

              {issue.suggestion && (
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-[10px] font-medium text-primary mb-1">💡 Suggestion</p>
                  <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono">{issue.suggestion}</pre>
                </div>
              )}

              {hasFix && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground">Auto-Fix Preview</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Before → After</span>
                  </div>

                  <DiffView beforeCode={issue.beforeCode!} afterCode={issue.afterCode!} />

                  <div className="flex items-center gap-2 pt-1">
                    {isApplied ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1.5 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                        onClick={(e) => { e.stopPropagation(); onUndoFix(index); }}
                      >
                        <Undo2 className="w-3 h-3" />
                        Undo Fix
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1.5"
                        onClick={(e) => { e.stopPropagation(); onApplyFix(index); }}
                      >
                        <Wand2 className="w-3 h-3" />
                        Apply Fix
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1.5"
                      onClick={(e) => { e.stopPropagation(); onCopyFix(issue.afterCode!); }}
                    >
                      <Copy className="w-3 h-3" />
                      Copy Fixed Code
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CodeReviewPanel = ({ isOpen, onClose, files }: CodeReviewPanelProps) => {
  const { reviews, isReviewing, reviewFile } = useCodeReview();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Map<string, Set<number>>>(new Map());

  const codeFiles = files.filter((f) => !f.path.endsWith(".json") && !f.path.endsWith(".md") && !f.path.endsWith(".yaml"));
  const currentReview = selectedFile ? reviews.get(selectedFile) : null;
  const currentApplied = selectedFile ? (appliedFixes.get(selectedFile) || new Set()) : new Set<number>();

  const filteredIssues = currentReview?.issues.filter(
    (i) => !filterCategory || i.category === filterCategory
  ) || [];

  const fixableCount = currentReview?.issues.filter((i) => i.beforeCode && i.afterCode).length || 0;
  const appliedCount = currentApplied.size;

  const handleReview = async (path: string) => {
    setSelectedFile(path);
    if (!reviews.has(path)) {
      const file = files.find((f) => f.path === path);
      if (file) await reviewFile(path, file.content);
    }
  };

  const handleReviewAll = async () => {
    for (const file of codeFiles.slice(0, 10)) {
      if (!reviews.has(file.path)) {
        await reviewFile(file.path, file.content);
      }
    }
  };

  const handleApplyFix = useCallback((issueIndex: number) => {
    if (!selectedFile) return;
    setAppliedFixes((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(selectedFile) || []);
      set.add(issueIndex);
      next.set(selectedFile, set);
      return next;
    });
    toast.success("Fix applied (preview only)");
  }, [selectedFile]);

  const handleUndoFix = useCallback((issueIndex: number) => {
    if (!selectedFile) return;
    setAppliedFixes((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(selectedFile) || []);
      set.delete(issueIndex);
      next.set(selectedFile, set);
      return next;
    });
    toast.info("Fix undone");
  }, [selectedFile]);

  const handleCopyFix = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Fixed code copied to clipboard");
  }, []);

  const handleApplyAll = useCallback(() => {
    if (!selectedFile || !currentReview) return;
    const fixableIndices = currentReview.issues
      .map((issue, idx) => (issue.beforeCode && issue.afterCode ? idx : -1))
      .filter((idx) => idx !== -1);
    setAppliedFixes((prev) => {
      const next = new Map(prev);
      next.set(selectedFile, new Set(fixableIndices));
      return next;
    });
    toast.success(`${fixableIndices.length} fixes applied (preview only)`);
  }, [selectedFile, currentReview]);

  const handleExportPatch = useCallback(() => {
    const totalApplied = Array.from(appliedFixes.entries()).reduce((sum, [, s]) => sum + s.size, 0);
    if (totalApplied === 0) {
      toast.error("No fixes applied to export");
      return;
    }

    let patch = "";
    for (const [filePath, fixIndices] of appliedFixes.entries()) {
      if (fixIndices.size === 0) continue;
      const review = reviews.get(filePath);
      if (!review) continue;

      patch += `--- a/${filePath}\n+++ b/${filePath}\n`;
      for (const idx of Array.from(fixIndices).sort((a, b) => a - b)) {
        const issue = review.issues[idx];
        if (!issue?.beforeCode || !issue?.afterCode) continue;

        const beforeLines = issue.beforeCode.split("\n");
        const afterLines = issue.afterCode.split("\n");
        const startLine = issue.line || 1;

        patch += `@@ -${startLine},${beforeLines.length} +${startLine},${afterLines.length} @@ ${issue.title}\n`;
        beforeLines.forEach((l) => (patch += `-${l}\n`));
        afterLines.forEach((l) => (patch += `+${l}\n`));
      }
      patch += "\n";
    }

    const blob = new Blob([patch], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code-review-fixes.patch";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${totalApplied} fix(es) as patch file`);
  }, [appliedFixes, reviews]);

  const totalAppliedCount = Array.from(appliedFixes.values()).reduce((sum, s) => sum + s.size, 0);

  const allIssues = Array.from(reviews.values()).flatMap((r) => r.issues);
  const avgScore = reviews.size > 0
    ? Math.round(Array.from(reviews.values()).reduce((s, r) => s + r.score, 0) / reviews.size)
    : 0;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Code Review</h2>
              <p className="text-xs text-muted-foreground">{reviews.size} files reviewed • {allIssues.length} issues found</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalAppliedCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPatch}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Patch ({totalAppliedCount})
              </Button>
            )}
            {codeFiles.length > 0 && (
              <Button
                size="sm"
                onClick={handleReviewAll}
                disabled={!!isReviewing}
                className="gap-1.5"
              >
                {isReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Review All
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* File List */}
          <div className="w-64 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Files</p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                {codeFiles.map((file) => {
                  const review = reviews.get(file.path);
                  const isActive = selectedFile === file.path;
                  const isLoading = isReviewing === file.path;
                  const fileApplied = appliedFixes.get(file.path)?.size || 0;

                  return (
                    <button
                      key={file.path}
                      onClick={() => handleReview(file.path)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-left transition-colors text-sm",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <FileCode className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate flex-1 text-xs">{file.path.split("/").pop()}</span>
                      {isLoading && <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />}
                      {review && !isLoading && (
                        <div className="flex items-center gap-1 shrink-0">
                          {fileApplied > 0 && (
                            <span className="text-[9px] text-green-400 font-mono">{fileApplied}✓</span>
                          )}
                          <span className={cn(
                            "text-[10px] font-bold",
                            review.score >= 80 ? "text-green-400" : review.score >= 60 ? "text-yellow-400" : "text-red-400"
                          )}>
                            {review.score}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Review Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {currentReview ? (
              <>
                {/* Score + Summary */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-start gap-6">
                    <ScoreGauge score={currentReview.score} />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">{selectedFile}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{currentReview.summary}</p>

                      {/* Fix stats banner */}
                      {fixableCount > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/15"
                        >
                          <Wand2 className="w-4 h-4 text-primary" />
                          <div className="flex-1">
                            <span className="text-xs font-medium text-foreground">
                              {fixableCount} auto-fixable issue{fixableCount > 1 ? "s" : ""}
                            </span>
                            {appliedCount > 0 && (
                              <span className="text-xs text-green-400 ml-2">({appliedCount} applied)</span>
                            )}
                          </div>
                          {appliedCount < fixableCount && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleApplyAll}>
                              <Wand2 className="w-3 h-3" />
                              Apply All Fixes
                            </Button>
                          )}
                        </motion.div>
                      )}

                      <div className="flex gap-2 mt-3 flex-wrap">
                        <button
                          onClick={() => setFilterCategory(null)}
                          className={cn(
                            "text-[10px] px-2 py-1 rounded-full border transition-colors",
                            !filterCategory ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                          )}
                        >
                          All ({currentReview.issues.length})
                        </button>
                        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((cat) => {
                          const count = currentReview.issues.filter((i) => i.category === cat).length;
                          if (count === 0) return null;
                          const cfg = categoryConfig[cat];
                          return (
                            <button
                              key={cat}
                              onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                              className={cn(
                                "text-[10px] px-2 py-1 rounded-full border transition-colors",
                                filterCategory === cat ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "border-border text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {cfg.label} ({count})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issues */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-2">
                    {filteredIssues.map((issue, idx) => {
                      const globalIdx = currentReview.issues.indexOf(issue);
                      return (
                        <IssueCard
                          key={idx}
                          issue={issue}
                          index={idx}
                          appliedFixes={currentApplied}
                          onApplyFix={() => handleApplyFix(globalIdx)}
                          onUndoFix={() => handleUndoFix(globalIdx)}
                          onCopyFix={handleCopyFix}
                        />
                      );
                    })}
                    {filteredIssues.length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle2 className="w-10 h-10 mx-auto text-green-400 mb-3" />
                        <p className="text-sm text-muted-foreground">No issues found in this category</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            ) : reviews.size > 0 ? (
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="text-center mb-6">
                  <ScoreGauge score={avgScore} />
                  <p className="text-sm text-muted-foreground mt-3">Average across {reviews.size} files</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((cat) => {
                    const count = allIssues.filter((i) => i.category === cat).length;
                    const cfg = categoryConfig[cat];
                    const Icon = cfg.icon;
                    return (
                      <div key={cat} className={cn("rounded-lg border p-3 text-center", cfg.border, cfg.bg)}>
                        <Icon className={cn("w-5 h-5 mx-auto mb-1", cfg.color)} />
                        <p className="text-lg font-bold text-foreground">{count}</p>
                        <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 mx-auto text-primary/30 mb-4" />
                  <p className="text-foreground font-medium">Select a file to review</p>
                  <p className="text-sm text-muted-foreground mt-1">Or click "Review All" to analyze the entire codebase</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CodeReviewPanel;
