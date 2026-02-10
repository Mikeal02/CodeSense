import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, GitCompare, ArrowLeftRight, FileCode } from "lucide-react";
import { Button } from "./ui/button";
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

  const leftContent = useMemo(() => files.find(f => f.path === leftFile)?.content || "", [files, leftFile]);
  const rightContent = useMemo(() => files.find(f => f.path === rightFile)?.content || "", [files, rightFile]);

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

  const stats = useMemo(() => {
    const added = diffLines.filter(l => l.status === 'added').length;
    const removed = diffLines.filter(l => l.status === 'removed').length;
    const modified = diffLines.filter(l => l.status === 'modified').length;
    return { added, removed, modified, same: diffLines.length - added - removed - modified };
  }, [diffLines]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col"
    >
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/80">
        <div className="flex items-center gap-3">
          <GitCompare className="w-5 h-5 text-primary" />
          <span className="font-semibold">File Comparison</span>
          {leftFile && rightFile && (
            <div className="flex items-center gap-2 ml-4 text-xs">
              <span className="text-success">+{stats.added}</span>
              <span className="text-destructive">-{stats.removed}</span>
              <span className="text-warning">~{stats.modified}</span>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File selectors */}
        <div className="w-64 border-r border-border bg-card/50 flex flex-col">
          <div className="p-3 border-b border-border">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Select Files</h4>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {files.map(f => {
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
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                      isLeft ? "bg-info/10 text-info" :
                      isRight ? "bg-accent/10 text-accent" :
                      "hover:bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{f.path}</span>
                    {isLeft && <span className="ml-auto text-[10px] font-medium">LEFT</span>}
                    {isRight && <span className="ml-auto text-[10px] font-medium">RIGHT</span>}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Diff view */}
        <div className="flex-1 flex flex-col bg-[#1e1e2e]">
          {!leftFile || !rightFile ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Select two files to compare</p>
                <p className="text-sm mt-1">Click a file for left, then another for right</p>
              </div>
            </div>
          ) : (
            <>
              {/* File names */}
              <div className="flex border-b border-[#313244]">
                <div className="flex-1 px-4 py-2 text-sm text-info font-mono border-r border-[#313244] bg-info/5">
                  {leftFile}
                </div>
                <div className="flex-1 px-4 py-2 text-sm text-accent font-mono bg-accent/5">
                  {rightFile}
                </div>
              </div>

              {/* Diff content */}
              <ScrollArea className="flex-1">
                <div className="font-mono text-xs">
                  {diffLines.map((line, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex",
                        line.status === 'added' && "bg-success/5",
                        line.status === 'removed' && "bg-destructive/5",
                        line.status === 'modified' && "bg-warning/5",
                      )}
                    >
                      <div className="w-10 text-right pr-2 py-0.5 text-[#6c7086] select-none border-r border-[#313244] bg-[#181825]/50">
                        {line.lineNum}
                      </div>
                      <div className={cn(
                        "flex-1 px-3 py-0.5 border-r border-[#313244] whitespace-pre",
                        line.status === 'removed' && "bg-destructive/10 text-destructive/80",
                        line.status === 'modified' && "bg-warning/10",
                      )}>
                        {line.left}
                      </div>
                      <div className="w-10 text-right pr-2 py-0.5 text-[#6c7086] select-none border-r border-[#313244] bg-[#181825]/50">
                        {line.lineNum}
                      </div>
                      <div className={cn(
                        "flex-1 px-3 py-0.5 whitespace-pre",
                        line.status === 'added' && "bg-success/10 text-success/80",
                        line.status === 'modified' && "bg-warning/10",
                      )}>
                        {line.right}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FileDiffView;
