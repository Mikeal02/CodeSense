import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Shield, Bug, Zap, Lightbulb, AlertTriangle, ChevronDown, ChevronRight,
  Loader2, FileCode, CheckCircle2, XCircle, AlertCircle, Info, Sparkles
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { CodeReviewResult, CodeReviewIssue, useCodeReview } from "@/hooks/useCodeReview";
import { ScrollArea } from "./ui/scroll-area";

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
  const color = score >= 80 ? "hsl(var(--success))" : score >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
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

const IssueCard = ({ issue, index }: { issue: CodeReviewIssue; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const cat = categoryConfig[issue.category];
  const sev = severityConfig[issue.severity];
  const CatIcon = cat.icon;
  const SevIcon = sev.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn("border rounded-lg overflow-hidden", cat.border)}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn("w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors")}
      >
        <CatIcon className={cn("w-4 h-4 shrink-0", cat.color)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">{issue.title}</span>
            {issue.line && (
              <span className="text-xs text-muted-foreground font-mono shrink-0">L{issue.line}</span>
            )}
          </div>
        </div>
        <span className={cn("text-[10px] font-medium uppercase px-1.5 py-0.5 rounded", sev.bg, sev.color)}>
          {issue.severity}
        </span>
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
              <p className="text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
              {issue.suggestion && (
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-[10px] font-medium text-primary mb-1">💡 Suggestion</p>
                  <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono">{issue.suggestion}</pre>
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

  const codeFiles = files.filter((f) => !f.path.endsWith(".json") && !f.path.endsWith(".md") && !f.path.endsWith(".yaml"));
  const currentReview = selectedFile ? reviews.get(selectedFile) : null;

  const filteredIssues = currentReview?.issues.filter(
    (i) => !filterCategory || i.category === filterCategory
  ) || [];

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
                        <span className={cn(
                          "text-[10px] font-bold shrink-0",
                          review.score >= 80 ? "text-green-400" : review.score >= 60 ? "text-yellow-400" : "text-red-400"
                        )}>
                          {review.score}
                        </span>
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
                    {filteredIssues.map((issue, idx) => (
                      <IssueCard key={idx} issue={issue} index={idx} />
                    ))}
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
              /* Aggregate view */
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
