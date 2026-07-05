import { useState, useCallback, useEffect } from "react";
import { 
  PanelLeftClose, PanelLeftOpen, X, Columns2, 
  Keyboard, ChevronLeft, ChevronRight, FileCode, Terminal, 
  Sparkles, Send, Loader2, Code, Copy, Check, Search, GitBranch
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import FileTreeView from "./FileTreeView";
import FileContentPreview from "./FileContentPreview";
import FileDrilldownPanel from "./FileDrilldownPanel";
import { Message } from "./ChatInterface";
import ReactMarkdown from "react-markdown";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface SplitViewModeProps {
  isOpen: boolean;
  onClose: () => void;
  files: { path: string; content: string }[];
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  repoName?: string;
}

const getTabColor = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ts: "#3178c6", tsx: "#3178c6", js: "#f7df1e", jsx: "#f7df1e",
    py: "#3572A5", css: "#663399", html: "#e34c26", json: "#6c7086",
    md: "#083fa1", rs: "#dea584", go: "#00ADD8",
  };
  return map[ext] || "#6c7086";
};

const SplitViewMode = ({ 
  isOpen, onClose, files, messages, onSendMessage, isLoading, repoName 
}: SplitViewModeProps) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showFileTree, setShowFileTree] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showDrilldown, setShowDrilldown] = useState(true);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const activeFile = selectedFiles[activeFileIndex];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); setShowFileTree(p => !p); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') { e.preventDefault(); setShowChat(p => !p); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); setShowDrilldown(p => !p); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') { e.preventDefault(); if (selectedFiles.length > 0) closeTab(activeFileIndex); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') { e.preventDefault(); if (selectedFiles.length > 1) setActiveFileIndex(p => (p + 1) % selectedFiles.length); }
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); setShowShortcuts(p => !p); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedFiles, activeFileIndex]);

  const handleFileSelect = useCallback((path: string) => {
    if (!selectedFiles.includes(path)) {
      setSelectedFiles(prev => [...prev, path]);
      setActiveFileIndex(selectedFiles.length);
    } else {
      setActiveFileIndex(selectedFiles.indexOf(path));
    }
  }, [selectedFiles]);

  const closeTab = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (activeFileIndex >= newFiles.length) setActiveFileIndex(Math.max(0, newFiles.length - 1));
    else if (index < activeFileIndex) setActiveFileIndex(activeFileIndex - 1);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) { onSendMessage(input.trim()); setInput(""); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1e2e] flex flex-col">
      {/* ═══ Activity Bar (top) ═══ */}
      <div className="h-10 border-b border-[#313244]/60 flex items-center justify-between px-2 bg-[#181825]">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon"
            onClick={() => setShowFileTree(!showFileTree)}
            className={cn("h-8 w-8 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]", showFileTree && "text-[#cdd6f4] bg-[#313244]/50")}
            title="Toggle Explorer (⌘B)"
          >
            {showFileTree ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>
          <div className="h-4 w-px bg-[#313244]/40 mx-1" />
          <div className="flex items-center gap-2 px-2">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-medium text-[#cdd6f4]">CodeSense</span>
            {repoName && (
              <>
                <span className="text-[#45475a]">/</span>
                <span className="text-[12px] text-[#a6adc8]">{repoName}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="h-8 w-8 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            onClick={() => setShowDrilldown(!showDrilldown)}
            className={cn("h-8 w-8 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]", showDrilldown && "text-[#cdd6f4] bg-[#313244]/50")}
            title="Toggle Drilldown (⌘I)"
          >
            <GitBranch className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            onClick={() => setShowChat(!showChat)}
            className={cn("h-8 w-8 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]", showChat && "text-[#cdd6f4] bg-[#313244]/50")}
            title="Toggle Chat (⌘J)"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </Button>
          <div className="h-4 w-px bg-[#313244]/40 mx-1" />
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-[#6c7086] hover:text-[#f38ba8] hover:bg-[#f38ba8]/10">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Shortcuts Dropdown */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-12 right-16 z-50 bg-[#1e1e2e] border border-[#313244] rounded-lg p-4 shadow-2xl w-64"
          >
            <h3 className="font-medium text-sm text-[#cdd6f4] mb-3 flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5 text-primary" />
              Shortcuts
            </h3>
            <div className="space-y-2">
              {[
              ["⌘B", "Explorer"], ["⌘I", "Drilldown"], ["⌘J", "Chat"], ["⌘W", "Close tab"],
                ["⌘Tab", "Next tab"], ["⌘/", "Shortcuts"], ["Esc", "Exit"],
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between text-[12px]">
                  <span className="text-[#a6adc8]">{desc}</span>
                  <kbd className="px-1.5 py-0.5 bg-[#313244] rounded text-[10px] font-mono text-[#6c7086]">{key}</kbd>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Main Layout ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Sidebar ── */}
        <AnimatePresence>
          {showFileTree && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="border-r border-[#313244]/40 bg-[#181825] flex-shrink-0 overflow-hidden"
            >
              <div className="h-8 flex items-center px-3 text-[11px] uppercase tracking-wider text-[#6c7086] font-medium border-b border-[#313244]/30">
                Explorer
              </div>
              <div className="h-[calc(100%-2rem)]">
                <FileTreeView 
                  files={files} 
                  onFileSelect={handleFileSelect}
                  selectedFile={activeFile}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Editor Area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          {selectedFiles.length > 0 && (
            <div className="flex items-center h-[35px] bg-[#181825] border-b border-[#313244]/40 overflow-x-auto scrollbar-none">
              {selectedFiles.map((file, index) => {
                const name = file.split('/').pop() || file;
                const isActive = index === activeFileIndex;
                const color = getTabColor(name);

                return (
                  <div
                    key={file}
                    className={cn(
                      "flex items-center gap-2 px-3 h-full cursor-pointer group relative transition-colors min-w-0",
                      isActive 
                        ? "bg-[#1e1e2e] text-[#cdd6f4]" 
                        : "text-[#6c7086] hover:text-[#a6adc8] hover:bg-[#1e1e2e]/40"
                    )}
                    onClick={() => setActiveFileIndex(index)}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-b" style={{ backgroundColor: color }} />
                    )}
                    <FileCode className="w-3 h-3 flex-shrink-0" style={{ color }} />
                    <span className="text-[12px] truncate max-w-[140px]">{name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); closeTab(index); }}
                      className={cn(
                        "rounded p-0.5 transition-all",
                        isActive ? "opacity-60 hover:opacity-100 hover:bg-[#313244]" : "opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-[#313244]"
                      )}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* File Content */}
          {activeFile ? (
            <div className="flex-1 overflow-hidden">
              <FileContentPreview
                filePath={activeFile}
                content={files.find(f => f.path === activeFile)?.content || ""}
                onClose={() => closeTab(activeFileIndex)}
                hideHeader
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#313244]/30 flex items-center justify-center mx-auto">
                  <Code className="w-8 h-8 text-[#45475a]" />
                </div>
                <div>
                  <p className="text-[15px] text-[#6c7086] font-medium">No file open</p>
                  <p className="text-[12px] text-[#45475a] mt-1">Select a file from the explorer to start viewing</p>
                </div>
                <div className="flex items-center justify-center gap-4 text-[11px] text-[#45475a]">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-[#313244]/50 rounded text-[10px] font-mono">⌘B</kbd>
                    Explorer
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-[#313244]/50 rounded text-[10px] font-mono">⌘P</kbd>
                    Quick Open
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Chat Panel ── */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="border-l border-[#313244]/40 bg-[#181825] flex flex-col flex-shrink-0 overflow-hidden"
            >
              <div className="h-8 flex items-center justify-between px-3 border-b border-[#313244]/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[11px] uppercase tracking-wider text-[#6c7086] font-medium">Assistant</span>
                </div>
                {isLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-8 h-8 text-[#45475a] mx-auto mb-3" />
                    <p className="text-[12px] text-[#6c7086]">Ask questions about your code</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={cn("flex gap-2.5", message.role === "user" && "flex-row-reverse")}>
                      <div className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5",
                        message.role === "assistant" ? "bg-primary/15" : "bg-[#313244]"
                      )}>
                        {message.role === "assistant" ? (
                          <Sparkles className="w-3 h-3 text-primary" />
                        ) : (
                          <Code className="w-3 h-3 text-[#6c7086]" />
                        )}
                      </div>
                      
                      <div className={cn("max-w-[85%]", message.role === "user" && "text-right")}>
                        <div className={cn(
                          "inline-block px-3 py-2 rounded-lg text-[12px]",
                          message.role === "assistant" 
                            ? "bg-[#1e1e2e] text-[#cdd6f4] text-left border border-[#313244]/30" 
                            : "bg-primary text-primary-foreground"
                        )}>
                          {message.role === "assistant" ? (
                            <div className="prose prose-invert prose-xs max-w-none">
                              <ReactMarkdown
                                components={{
                                  code({ node, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const isInline = !match;
                                    if (isInline) {
                                      return <code className="bg-[#313244] px-1 py-0.5 rounded text-primary font-mono text-[11px]" {...props}>{children}</code>;
                                    }
                                    return (
                                      <div className="bg-[#11111b] rounded-md overflow-hidden my-2 border border-[#313244]/30">
                                        <div className="flex items-center justify-between px-3 py-1 border-b border-[#313244]/30">
                                          <span className="text-[10px] text-[#6c7086] font-mono">{match[1]}</span>
                                          <button onClick={() => handleCopy(String(children), message.id + match[1])} className="text-[#6c7086] hover:text-[#cdd6f4]">
                                            {copiedId === message.id + match[1] ? <Check className="w-3 h-3 text-[#a6e3a1]" /> : <Copy className="w-3 h-3" />}
                                          </button>
                                        </div>
                                        <pre className="p-3 text-[11px] font-mono overflow-x-auto"><code {...props}>{children}</code></pre>
                                      </div>
                                    );
                                  },
                                  p: ({ children }) => <p className="mb-2 text-[#bac2de] leading-relaxed">{children}</p>,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <span>{message.content}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-3 border-t border-[#313244]/30">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about this code..."
                    className="flex-1 h-8 text-[12px] bg-[#1e1e2e] border-[#313244]/50 text-[#cdd6f4] placeholder:text-[#45475a]"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" size="icon"
                    className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Status Bar ═══ */}
      <div className="h-[22px] bg-primary/90 flex items-center justify-between px-3 text-[11px] text-primary-foreground/90 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3" />
            CodeSense
          </span>
          <span>{files.length} files</span>
          <span>{selectedFiles.length} open</span>
        </div>
        <div className="flex items-center gap-3">
          {activeFile && <span className="opacity-80">{activeFile}</span>}
        </div>
      </div>
    </div>
  );
};

export default SplitViewMode;
