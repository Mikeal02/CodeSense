import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X } from "lucide-react";

interface TerminalBannerProps {
  isLoading: boolean;
  repoName?: string;
  fileCount?: number;
  isConnected: boolean;
}

const TerminalBanner = ({ isLoading, repoName, fileCount, isConnected }: TerminalBannerProps) => {
  const [lines, setLines] = useState<{ text: string; type: "cmd" | "out" | "success" | "error" | "info" }[]>([]);
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setMinimized(false);
      setLines([
        { text: "$ codesense connect --repo " + (repoName || "..."), type: "cmd" },
      ]);

      const steps: { text: string; type: "cmd" | "out" | "success" | "error" | "info"; delay: number }[] = [
        { text: "  → Authenticating with GitHub API...", type: "info", delay: 600 },
        { text: "  → Fetching repository tree...", type: "info", delay: 1200 },
        { text: "  → Filtering source files...", type: "info", delay: 1800 },
        { text: "  → Downloading file contents...", type: "out", delay: 2400 },
        { text: "  → Tokenizing codebase...", type: "out", delay: 3000 },
        { text: "  → Initializing AI analysis engine...", type: "out", delay: 3600 },
      ];

      const timers = steps.map(({ text, type, delay }) =>
        setTimeout(() => {
          setLines((prev) => [...prev, { text, type }]);
        }, delay)
      );

      return () => timers.forEach(clearTimeout);
    }

    if (isConnected && repoName && !isLoading) {
      setLines((prev) => [
        ...prev,
        { text: `  ✓ Loaded ${fileCount || 0} files from ${repoName}`, type: "success" },
        { text: "  ✓ AI engine ready — select a mode to begin", type: "success" },
        { text: "$ _", type: "cmd" },
      ]);
      setTimeout(() => setMinimized(true), 3500);
    }
  }, [isLoading, isConnected, repoName, fileCount]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-8 right-4 sm:right-6 z-50 w-[320px] sm:w-[400px]"
      >
        <div className="rounded-xl border border-border/20 overflow-hidden shadow-2xl shadow-background/60 bg-card/80 backdrop-blur-2xl">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 border-b border-border/20">
            <div className="flex gap-1.5">
              <button onClick={() => setVisible(false)} className="w-3 h-3 rounded-full bg-destructive/60 hover:bg-destructive transition-colors" />
              <button onClick={() => setMinimized(!minimized)} className="w-3 h-3 rounded-full bg-warning/60 hover:bg-warning transition-colors" />
              <div className="w-3 h-3 rounded-full bg-success/30" />
            </div>
            <div className="flex items-center gap-1.5 flex-1 justify-center">
              <Terminal className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 font-mono">codesense — terminal</span>
            </div>
            <button onClick={() => setVisible(false)}>
              <X className="w-3 h-3 text-muted-foreground/30 hover:text-foreground transition-colors" />
            </button>
          </div>

          {/* Content */}
          <AnimatePresence>
            {!minimized && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-3 font-mono text-[11px] space-y-0.5 max-h-44 overflow-y-auto scrollbar-none bg-background/50">
                  {lines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={
                        line.type === "cmd" ? "text-primary" :
                        line.type === "success" ? "text-success" :
                        line.type === "error" ? "text-destructive" :
                        line.type === "info" ? "text-info" :
                        "text-muted-foreground/70"
                      }
                    >
                      {line.text}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-primary">▋</motion.div>
                  )}
                  <div ref={endRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TerminalBanner;
