import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitCompare, ArrowLeftRight, FileCode, Search, RotateCcw, Copy, Check, ChevronDown, ChevronUp, Columns2, AlignJustify } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

interface FileDiffViewProps {
  isOpen: boolean;
  onClose: () => void;
  files: { path: string; content: string }[];
}

const FileDiffView = ({ isOpen, onClose, files }: FileDiffViewProps) => {
  const [leftFile, setLeftFile] = useState<string | null>(null);
  const [rightFile, setRightFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnchanged, setShowUnchanged] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "inline">("split");

  const leftContent = useMemo(() => files.find(f => f.path === leftFile)?.content || "", [files, leftFile]);
  const rightContent = useMemo(() => files.find(f => f.path === rightFile)?.content || "", [files, rightFile]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter(f => f.path.toLowerCase().includes(q));
  }, [files, searchQuery]);

  const diffLines = useMemo(() => {
    if (!leftContent || !rightContent) return [];
    const left = leftContent.split('\n');
    const right = rightContent.split('\n');
    const maxLen = Math.max(left.length, right.length);
    return Array.from({ length: maxLen }, (_, i) => ({
      lineNum: i + 1,
      left: left[i] || '',
      right: right[i] || '',
      status: left[i] === right[i] ? 'same' as const
        : !left[i] ? 'added' as const
        : !right[i] ? 'removed' as const
        : 'modified' as const,
    }));
  }, [leftContent, rightContent]);

  const displayLines = useMemo(() => {
    if (showUnchanged) return diffLines;
    return diffLines.filter(l => l.status !== 'same');
  }, [diffLines, showUnchanged]);

  const stats = useMemo(() => {
    const added = diffLines.filter(l => l.status === 'added').length;
    const removed = diffLines.filter(l => l.status === 'removed').length;
    const modified = diffLines.filter(l => l.status === 'modified').length;
    const same = diffLines.filter(l => l.status === 'same').length;
    const similarity = diffLines.length > 0 ? Math.round((same / diffLines.length) * 100) : 0;
    return { added, removed, modified, same, similarity };
  }, [diffLines]);

  const handleCopyDiff = () => {
    const text = diffLines
      .filter(l => l.status !== 'same')
      .map(l => `${l.status === 'removed' ? '-' : l.status === 'added' ? '+' : '~'} ${l.left || l.right}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setLeftFile(null);
    setRightFile(null);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col"
    >
      {/* Header */}
      <div className="h-12 border-b border-border/30 flex items-center justify-between px-4 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <GitCompare className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">File Diff</span>
          {leftFile && rightFile && (
            <div className="flex items-center gap-2 ml-3">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/10 text-success font-mono">+{stats.added}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-mono">-{stats.removed}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning font-mono">~{stats.modified}</span>
              <span className="text-[10px] text-muted-foreground/50 ml-1">{stats.similarity}% similar</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {leftFile && rightFile && (
            <>
              <div className="flex items-center bg-secondary/40 rounded-md p-0.5 mr-1 ring-1 ring-border/30">
                <button
                  onClick={() => setViewMode("split")}
                  className={cn(
                    "h-6 px-2 rounded-[5px] text-[10px] flex items-center gap-1 transition-all",
                    viewMode === "split" ? "bg-primary/20 text-primary" : "text-muted-foreground/60 hover:text-foreground"
                  )}
                  title="Side-by-side diff"
                >
                  <Columns2 className="w-3 h-3" /> Split
                </button>
                <button
                  onClick={() => setViewMode("inline")}
                  className={cn(
                    "h-6 px-2 rounded-[5px] text-[10px] flex items-center gap-1 transition-all",
                    viewMode === "inline" ? "bg-primary/20 text-primary" : "text-muted-foreground/60 hover:text-foreground"
                  )}
                  title="Unified inline diff"
                >
                  <AlignJustify className="w-3 h-3" /> Inline
                </button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowUnchanged(!showUnchanged)} className="h-7 text-[10px] gap-1">
                {showUnchanged ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showUnchanged ? "Hide" : "Show"} unchanged
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCopyDiff} className="h-7 w-7">
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleReset} className="h-7 w-7" title="Reset">
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File selector */}
        <div className="w-56 border-r border-border/30 bg-card/30 flex flex-col">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter files..."
                className="h-7 pl-7 text-[11px] bg-secondary/30 border-border/30"
              />
            </div>
          </div>
          <div className="px-2 py-1 text-[9px] text-muted-foreground/40 uppercase tracking-wider">
            {!leftFile ? "Select left file" : !rightFile ? "Select right file" : "Files"}
          </div>
          <ScrollArea className="flex-1">
            <div className="px-1 space-y-0.5 pb-2">
              {filteredFiles.map(f => {
                const isLeft = f.path === leftFile;
                const isRight = f.path === rightFile;
                return (
                  <button
                    key={f.path}
                    onClick={() => {
                      if (!leftFile || (leftFile && rightFile)) {
                        setLeftFile(f.path);
                        setRightFile(null);
                      } else {
                        setRightFile(f.path);
                      }
                    }}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded-md text-[11px] transition-all flex items-center gap-2",
                      isLeft ? "bg-info/10 text-info ring-1 ring-info/20" :
                      isRight ? "bg-accent/10 text-accent ring-1 ring-accent/20" :
                      "hover:bg-secondary/40 text-muted-foreground/70"
                    )}
                  >
                    <FileCode className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{f.path}</span>
                    {isLeft && <span className="ml-auto text-[8px] font-bold px-1 py-0.5 rounded bg-info/20">L</span>}
                    {isRight && <span className="ml-auto text-[8px] font-bold px-1 py-0.5 rounded bg-accent/20">R</span>}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Diff view */}
        <div className="flex-1 flex flex-col bg-[#1e1e2e]">
          {!leftFile || !rightFile ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground/40">
              <div className="text-center">
                <ArrowLeftRight className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select two files to compare</p>
                <p className="text-xs mt-1 text-muted-foreground/30">Click first for left, then another for right</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex border-b border-[#313244]/50">
                <div className="flex-1 px-3 py-1.5 text-[11px] text-info font-mono border-r border-[#313244]/50 bg-info/5 truncate">
                  {leftFile}
                </div>
                <div className="flex-1 px-3 py-1.5 text-[11px] text-accent font-mono bg-accent/5 truncate">
                  {rightFile}
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="font-mono text-[11px]">
                  {viewMode === "split" && displayLines.map((line, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex",
                        line.status === 'added' && "bg-success/5",
                        line.status === 'removed' && "bg-destructive/5",
                        line.status === 'modified' && "bg-warning/5",
                      )}
                    >
                      <div className="w-8 text-right pr-1.5 py-px text-[#6c7086]/50 select-none border-r border-[#313244]/30 bg-[#181825]/50 text-[10px]">
                        {line.lineNum}
                      </div>
                      <div className={cn(
                        "flex-1 px-2 py-px border-r border-[#313244]/30 whitespace-pre overflow-hidden",
                        line.status === 'removed' && "bg-destructive/8 text-destructive/70",
                        line.status === 'modified' && "bg-warning/8",
                        line.status === 'same' && "text-[#cdd6f4]/60",
                      )}>
                        {line.left}
                      </div>
                      <div className="w-8 text-right pr-1.5 py-px text-[#6c7086]/50 select-none border-r border-[#313244]/30 bg-[#181825]/50 text-[10px]">
                        {line.lineNum}
                      </div>
                      <div className={cn(
                        "flex-1 px-2 py-px whitespace-pre overflow-hidden",
                        line.status === 'added' && "bg-success/8 text-success/70",
                        line.status === 'modified' && "bg-warning/8",
                        line.status === 'same' && "text-[#cdd6f4]/60",
                      )}>
                        {line.right}
                      </div>
                    </div>
                  ))}
                  {viewMode === "inline" && displayLines.flatMap((line, i) => {
                    const rows: JSX.Element[] = [];
                    if (line.status === 'same') {
                      rows.push(
                        <div key={`s-${i}`} className="flex text-[#cdd6f4]/60">
                          <div className="w-10 text-right pr-1.5 py-px text-[#6c7086]/50 select-none border-r border-[#313244]/30 bg-[#181825]/50 text-[10px]">{line.lineNum}</div>
                          <div className="w-4 text-center text-[#6c7086]/40 select-none"> </div>
                          <div className="flex-1 px-2 py-px whitespace-pre overflow-hidden">{line.left}</div>
                        </div>
                      );
                    } else {
                      if (line.left) {
                        rows.push(
                          <div key={`r-${i}`} className="flex bg-destructive/8 text-destructive/80">
                            <div className="w-10 text-right pr-1.5 py-px text-destructive/40 select-none border-r border-[#313244]/30 bg-[#181825]/50 text-[10px]">{line.lineNum}</div>
                            <div className="w-4 text-center text-destructive/60 select-none">-</div>
                            <div className="flex-1 px-2 py-px whitespace-pre overflow-hidden">{line.left}</div>
                          </div>
                        );
                      }
                      if (line.right) {
                        rows.push(
                          <div key={`a-${i}`} className="flex bg-success/8 text-success/80">
                            <div className="w-10 text-right pr-1.5 py-px text-success/40 select-none border-r border-[#313244]/30 bg-[#181825]/50 text-[10px]">{line.lineNum}</div>
                            <div className="w-4 text-center text-success/60 select-none">+</div>
                            <div className="flex-1 px-2 py-px whitespace-pre overflow-hidden">{line.right}</div>
                          </div>
                        );
                      }
                    }
                    return rows;
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="h-6 border-t border-border/20 bg-card/40 flex items-center px-4 text-[10px] text-muted-foreground/40">
        <span>{files.length} files available</span>
        {leftFile && rightFile && (
          <>
            <span className="mx-2">•</span>
            <span>{displayLines.length} lines shown</span>
            <span className="mx-2">•</span>
            <span>{stats.similarity}% similarity</span>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default FileDiffView;
