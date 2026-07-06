import { useState, useRef, useEffect } from "react";
import { 
  Send, Sparkles, Code, FileCode, Copy, Check, Loader2, 
  Maximize2, Minimize2, X, FolderTree, Columns2, BarChart3,
  Search, Bookmark, Download, Keyboard, Share2, ArrowDown, Bot, User,
  Zap, Command
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import FileTreeView from "./FileTreeView";
import FileContentPreview from "./FileContentPreview";
import SplitViewMode from "./SplitViewMode";
import DependencyGraph from "./DependencyGraph";
import FileStats from "./FileStats";
import CodeSearchModal from "./CodeSearchModal";
import BookmarksPanel from "./BookmarksPanel";
import ExportReportModal from "./ExportReportModal";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import EmptyState from "./EmptyState";
import TypingWave from "./TypingWave";
import { useBookmarks } from "@/hooks/useBookmarks";
import { motion, AnimatePresence } from "framer-motion";
import { parseRef, resolveRefPath } from "@/lib/fileReferences";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeBlock?: {
    language: string;
    code: string;
    filename?: string;
  };
}

// Slash command catalog — turns the composer into a command palette.
const SLASH_COMMANDS: { cmd: string; label: string; hint: string }[] = [
  { cmd: "/overview", label: "Project overview", hint: "Architecture, stack, entry points" },
  { cmd: "/map", label: "Project map", hint: "Directory tree, critical files, patterns" },
  { cmd: "/flow", label: "Execution flow", hint: "Cold start, key interactions, effects" },
  { cmd: "/teach", label: "Teach me this codebase", hint: "As if I built it — interview mode" },
  { cmd: "/interview", label: "Interview questions", hint: "5-7 leveled questions with answers" },
  { cmd: "/complexity", label: "Complexity & risk", hint: "Hotspots, fragility, tech debt" },
  { cmd: "/coupling", label: "Coupling analysis", hint: "Tightly/loosely coupled clusters" },
  { cmd: "/impact", label: "Change impact", hint: "Blast radius + verification plan" },
  { cmd: "/resume", label: "Resume bullets", hint: "Portfolio-ready summary" },
];

const suggestedQuestions = [
  { label: "Project overview", icon: "🔍" },
  { label: "Folder structure", icon: "📁" },
  { label: "Interview prep", icon: "💼" },
  { label: "Complex areas", icon: "⚠️" },
  { label: "Execution flow", icon: "▶️" },
  { label: "Resume bullets", icon: "📝" },
];

// Context-aware follow-up suggestions based on last assistant message
const getFollowUpSuggestions = (lastMessage: string): { label: string; icon: string }[] => {
  const lower = lastMessage.toLowerCase();
  if (lower.includes("overview") || lower.includes("tech stack")) {
    return [
      { label: "Explain the architecture in detail", icon: "🏗️" },
      { label: "What are the main entry points?", icon: "🚪" },
      { label: "List all third-party dependencies", icon: "📦" },
    ];
  }
  if (lower.includes("interview") || lower.includes("question")) {
    return [
      { label: "Give me harder questions", icon: "🔥" },
      { label: "Explain like I built this myself", icon: "🧠" },
      { label: "What would a senior engineer ask?", icon: "👨‍💻" },
    ];
  }
  if (lower.includes("complexity") || lower.includes("risk") || lower.includes("coupling")) {
    return [
      { label: "How can I refactor the riskiest file?", icon: "🛠️" },
      { label: "Show me the dependency chain", icon: "🔗" },
      { label: "What tests should I write first?", icon: "✅" },
    ];
  }
  if (lower.includes("flow") || lower.includes("execution") || lower.includes("step")) {
    return [
      { label: "What happens on initial page load?", icon: "⚡" },
      { label: "Trace the authentication flow", icon: "🔐" },
      { label: "How does data flow between components?", icon: "🔄" },
    ];
  }
  return [
    { label: "Tell me more about this", icon: "💬" },
    { label: "Give me interview questions on this", icon: "💼" },
    { label: "What are the risks here?", icon: "⚠️" },
  ];
};

interface ChatInterfaceProps {
  isActive: boolean;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  repoName?: string;
  files?: { path: string; content: string }[];
  selectedFileFromPalette?: string;
  onClearSelectedFile?: () => void;
  onShareReport?: () => void;
  isSharing?: boolean;
}

const ChatInterface = ({ 
  isActive, messages, onSendMessage, isLoading, repoName, files = [],
  selectedFileFromPalette, onClearSelectedFile, onShareReport, isSharing,
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFileTree, setShowFileTree] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showSplitView, setShowSplitView] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showCodeSearch, setShowCodeSearch] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Track when each assistant message started + finished so we can show elapsed time.
  const timings = useRef<Map<string, { start: number; end?: number }>>(new Map());
  const [, forceTimingsRender] = useState(0);
  
  const { bookmarks, addBookmark, removeBookmark, updateBookmark, clearAllBookmarks } = useBookmarks();

  // Slash command filter based on current input
  const slashMatches = input.startsWith("/")
    ? SLASH_COMMANDS.filter(c => c.cmd.startsWith(input.split(/\s/)[0].toLowerCase()))
    : [];

  // Handle a resolved file reference click from inside markdown.
  const openFileRef = (path: string) => {
    const resolved = resolveRefPath(path, files) ?? path;
    if (files.some(f => f.path === resolved)) {
      setSelectedFile(resolved);
      setShowFileTree(true);
    }
  };

  // Register timing for the currently streaming assistant message.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    const entry = timings.current.get(last.id);
    if (!entry) {
      timings.current.set(last.id, { start: Date.now() });
    } else if (!isLoading && !entry.end) {
      entry.end = Date.now();
      forceTimingsRender(x => x + 1);
    }
  }, [messages, isLoading]);

  const formatElapsed = (id: string) => {
    const t = timings.current.get(id);
    if (!t || !t.end) return null;
    const ms = t.end - t.start;
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  useEffect(() => {
    if (selectedFileFromPalette) {
      setSelectedFile(selectedFileFromPalette);
      setShowFileTree(true);
      onClearSelectedFile?.();
    }
  }, [selectedFileFromPalette, onClearSelectedFile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') { e.preventDefault(); setShowCodeSearch(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !e.shiftKey) { e.preventDefault(); setShowBookmarks(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') { e.preventDefault(); setShowExport(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); setShowShortcuts(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') { e.preventDefault(); setShowSplitView(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll on new messages and during streaming
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldAutoScroll(false);
    }
  }, [shouldAutoScroll]);

  // Keep scrolled to bottom during streaming — trigger on content changes
  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant" && isLoading) {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }
    }
  }, [isLoading, messages, messages.length > 0 ? messages[messages.length - 1]?.content?.length : 0]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setShouldAutoScroll(true);
      // Expand slash commands to their prompt equivalents.
      const trimmed = input.trim();
      const first = trimmed.split(/\s+/)[0].toLowerCase();
      const match = SLASH_COMMANDS.find(c => c.cmd === first);
      const rest = trimmed.slice(first.length).trim();
      const finalMessage = match
        ? (rest ? `${match.label}: ${rest}` : match.label)
        : trimmed;
      onSendMessage(finalMessage);
      setInput("");
    }
  };

  const handleSuggestionClick = (question: string) => {
    if (!isLoading) {
      setShouldAutoScroll(true);
      onSendMessage(question);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isActive) return null;

  const isFileViewMode = !!selectedFile;

  const chatContent = (
    <div data-onboarding="chat-interface" className={cn(
      "rounded-2xl border border-border/35 overflow-hidden flex flex-col sm:flex-row bg-card/45 backdrop-blur-2xl card-glow",
      isFullscreen && "h-full rounded-none border-0"
    )}>
      {/* File Tree Sidebar */}
      {(showFileTree || isFileViewMode) && (
        <div className={cn(
          "border-b sm:border-b-0 sm:border-r border-border/30 bg-card/30 flex-shrink-0 flex flex-col",
          isFileViewMode ? "w-full sm:w-64 lg:w-72 max-h-48 sm:max-h-none" : "w-full sm:w-56 lg:w-64 max-h-48 sm:max-h-none"
        )}>
          <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Explorer</span>
              <span className="text-[10px] text-muted-foreground/50 font-mono">{files.length}</span>
            </div>
            {!isFileViewMode && (
              <button onClick={() => setShowFileTree(false)} className="text-muted-foreground/50 hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <FileTreeView files={files} onFileSelect={setSelectedFile} selectedFile={selectedFile} />
          </div>
        </div>
      )}

      {/* File Content Preview */}
      {selectedFile && (
        <div className={cn("flex-shrink-0", isFileViewMode ? "flex-1 min-w-0" : "w-full sm:w-80 lg:w-96")}>
          <FileContentPreview
            filePath={selectedFile}
            content={files.find(f => f.path === selectedFile)?.content || ""}
            onClose={() => setSelectedFile(undefined)}
          />
        </div>
      )}

      {/* Chat Section */}
      {!isFileViewMode && (
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-4 sm:px-5 py-3 border-b border-border/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/15">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">CodeSense AI</h3>
            <div className="flex items-center gap-1.5">
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] text-primary font-medium">Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-[10px] text-muted-foreground">{repoName || "Ready"}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {files.length > 0 && (
              <>
                {[
                  { icon: Search, onClick: () => setShowCodeSearch(true), title: "Search", active: false },
                  { icon: Bookmark, onClick: () => setShowBookmarks(true), title: "Bookmarks", active: bookmarks.length > 0 },
                  { icon: Download, onClick: () => setShowExport(true), title: "Export", active: false },
                ].map(btn => (
                  <Button key={btn.title} variant="ghost" size="icon" onClick={btn.onClick}
                    className={cn("h-7 w-7 rounded-lg", btn.active ? "text-primary" : "text-muted-foreground/60 hover:text-foreground")} title={btn.title}>
                    <btn.icon className="w-3.5 h-3.5" />
                  </Button>
                ))}
                {onShareReport && messages.length > 0 && (
                  <Button variant="ghost" size="icon" onClick={onShareReport} disabled={isSharing}
                    className="h-7 w-7 rounded-lg text-muted-foreground/60 hover:text-primary" title="Share">
                    {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                  </Button>
                )}
                <div className="w-px h-4 bg-border/30 mx-0.5" />
                {[
                  { icon: Columns2, onClick: () => setShowSplitView(true), title: "Split", active: false },
                  { icon: BarChart3, onClick: () => { setShowStats(!showStats); setShowGraph(false); }, title: "Stats", active: showStats },
                  { icon: FolderTree, onClick: () => setShowFileTree(!showFileTree), title: "Files", active: showFileTree },
                ].map(btn => (
                  <Button key={btn.title} variant="ghost" size="icon" onClick={btn.onClick}
                    className={cn("h-7 w-7 rounded-lg", btn.active ? "bg-primary/10 text-primary" : "text-muted-foreground/60 hover:text-foreground")} title={btn.title}>
                    <btn.icon className="w-3.5 h-3.5" />
                  </Button>
                ))}
              </>
            )}
            <Button variant="ghost" size="icon" onClick={() => setShowShortcuts(true)}
              className="h-7 w-7 rounded-lg text-muted-foreground/60 hover:text-foreground" title="Shortcuts">
              <Keyboard className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-7 w-7 rounded-lg text-muted-foreground/60 hover:text-foreground">
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
        
        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className={cn(
            "overflow-y-auto p-4 sm:p-6 space-y-5 flex-1 bg-gradient-to-b from-secondary/10 to-transparent",
            isFullscreen ? "h-[calc(100vh-200px)]" : "h-[380px] sm:h-[480px] lg:h-[520px]"
          )}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <EmptyState
                type="empty-chat"
                title="Ready to Analyze"
                description="Select a mode above or ask a question to start exploring your codebase."
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md mx-auto mt-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => handleSuggestionClick(q.label)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs bg-secondary/30 border border-border/20 text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:border-primary/20 transition-all disabled:opacity-50 text-left"
                  >
                    <span>{q.icon}</span>
                    <span>{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={idx === messages.length - 1 ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  message.role === "assistant" 
                    ? "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/10" 
                    : "bg-secondary/60 border border-border/30"
                )}>
                  {message.role === "assistant" ? (
                    <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                
                <div className={cn("max-w-[82%] space-y-2", message.role === "user" && "text-right")}>
                  <div className={cn(
                    "inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    message.role === "assistant" 
                      ? "bg-secondary/30 border border-border/20 text-foreground text-left rounded-tl-md" 
                      : "bg-primary text-primary-foreground rounded-tr-md"
                  )}>
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-themed">
                        <ReactMarkdown
                          components={{
                            code({ node, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match;
                              if (isInline) {
                                const raw = String(children);
                                const ref = parseRef(raw);
                                const resolved = ref ? resolveRefPath(ref.path, files) : null;
                                if (ref && resolved) {
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => openFileRef(resolved)}
                                      className="inline-flex items-center gap-1 bg-primary/[0.08] hover:bg-primary/15 border border-primary/20 hover:border-primary/40 px-1.5 py-0.5 rounded-md text-primary font-mono text-xs transition-colors"
                                      title={`Open ${resolved}${ref.line ? ` at line ${ref.line}` : ''}`}
                                    >
                                      <FileCode className="w-3 h-3 opacity-70" />
                                      {raw}
                                    </button>
                                  );
                                }
                                return <code className="bg-secondary/60 px-1.5 py-0.5 rounded-md text-primary font-mono text-xs" {...props}>{children}</code>;
                              }
                              return (
                                <div className="bg-card/60 rounded-xl overflow-hidden my-3 border border-border/20">
                                  <div className="flex items-center justify-between px-4 py-2 border-b border-border/20 bg-secondary/20">
                                    <div className="flex items-center gap-2">
                                      <FileCode className="w-3.5 h-3.5 text-muted-foreground/60" />
                                      <span className="text-[10px] text-muted-foreground font-mono">{match[1]}</span>
                                    </div>
                                    <button onClick={() => handleCopy(String(children), message.id + match[1])}
                                      className="text-muted-foreground/50 hover:text-foreground transition-colors">
                                      {copiedId === message.id + match[1] ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                  <pre className="p-4 text-[13px] font-mono text-foreground/90 overflow-x-auto"><code {...props}>{children}</code></pre>
                                </div>
                              );
                            },
                            h1: ({ children }) => <h1 className="text-lg font-bold text-foreground mt-4 mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold text-foreground mt-4 mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">{children}</h3>,
                            p: ({ children }) => <p className="mb-2 text-foreground/85 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-foreground/85">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        {/* Streaming caret: show on last assistant message while loading */}
                        {isLoading && idx === messages.length - 1 && message.content.length > 0 && (
                          <span className="inline-block w-[2px] h-[1em] bg-primary align-middle ml-0.5 animate-caret-blink" />
                        )}
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                  {/* Copy button for assistant messages */}
                  {message.role === "assistant" && message.content.length > 0 && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 mt-1.5"
                    >
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                      >
                        {copiedId === message.id ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                        {copiedId === message.id ? "Copied" : "Copy"}
                      </button>
                      <button
                        onClick={() => setFeedback(f => ({ ...f, [message.id]: f[message.id] === "up" ? undefined as any : "up" }))}
                        className={cn("text-[10px] transition-colors", feedback[message.id] === "up" ? "text-success" : "text-muted-foreground/40 hover:text-muted-foreground")}
                        title="Helpful"
                      >👍</button>
                      <button
                        onClick={() => setFeedback(f => ({ ...f, [message.id]: f[message.id] === "down" ? undefined as any : "down" }))}
                        className={cn("text-[10px] transition-colors", feedback[message.id] === "down" ? "text-destructive" : "text-muted-foreground/40 hover:text-muted-foreground")}
                        title="Not helpful"
                      >👎</button>
                      {formatElapsed(message.id) && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40 ml-auto tabular-nums">
                          <Zap className="w-2.5 h-2.5" />
                          {formatElapsed(message.id)}
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))
          )}
          {/* Typing indicator */}
          {isLoading && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TypingWave />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Context-aware follow-up suggestions */}
        {messages.length > 0 && !isLoading && (
          <div className="px-4 sm:px-5 py-2 border-t border-border/15">
            <p className="text-[9px] text-muted-foreground/40 mb-1.5 font-medium uppercase tracking-wider">Follow up</p>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {(() => {
                const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
                const suggestions = lastAssistant ? getFollowUpSuggestions(lastAssistant.content) : suggestedQuestions.slice(0, 3);
                return suggestions.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => handleSuggestionClick(q.label)}
                    disabled={isLoading}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] bg-primary/[0.05] border border-primary/15 text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all disabled:opacity-50"
                  >
                    {q.icon} {q.label}
                  </button>
                ));
              })()}
            </div>
          </div>
        )}
        {/* Static quick suggestions (when loading or first messages) */}
        {messages.length > 0 && isLoading && (
          <div className="px-4 sm:px-5 py-2 border-t border-border/15 flex gap-1.5 overflow-x-auto scrollbar-none">
            {suggestedQuestions.map((q) => (
              <button
                key={q.label}
                onClick={() => handleSuggestionClick(q.label)}
                disabled={isLoading}
                className="flex-shrink-0 px-3 py-1 rounded-lg text-[10px] bg-secondary/20 border border-border/15 text-muted-foreground/60 hover:text-foreground hover:bg-secondary/40 hover:border-primary/20 transition-all disabled:opacity-50"
              >
                {q.icon} {q.label}
              </button>
            ))}
          </div>
        )}
        
        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-border/15">
          {/* Slash command popover */}
          <AnimatePresence>
            {slashMatches.length > 0 && isFocused && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.12 }}
                className="mb-2 rounded-xl border border-border/30 bg-card/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40"
              >
                <div className="px-3 py-1.5 border-b border-border/20 flex items-center gap-1.5">
                  <Command className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Commands</span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {slashMatches.map(c => (
                    <button
                      key={c.cmd}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); setInput(c.cmd + " "); inputRef.current?.focus(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary/10 transition-colors text-left"
                    >
                      <span className="font-mono text-xs text-primary min-w-[80px]">{c.cmd}</span>
                      <span className="text-xs text-foreground/90">{c.label}</span>
                      <span className="text-[10px] text-muted-foreground/60 ml-auto truncate">{c.hint}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className={cn(
            "flex gap-2 items-end p-1.5 rounded-xl border transition-all duration-200",
            isFocused ? "border-primary/30 bg-card/60 shadow-lg shadow-primary/5" : "border-border/20 bg-secondary/20"
          )}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 100)}
              placeholder="Ask anything, or type / for commands…"
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/40 px-2 py-1.5 min-h-[36px] max-h-[120px]"
              disabled={isLoading}
              rows={1}
            />
            <Button 
              type="submit" 
              size="icon" 
              className={cn(
                "h-8 w-8 rounded-lg transition-all shrink-0",
                input.trim() 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" 
                  : "bg-secondary/40 text-muted-foreground/30"
              )}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/30 mt-1.5 text-center">Enter to send · Shift+Enter newline · / for commands</p>
        </form>
      </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl">
        {chatContent}
      </div>
    );
  }

  return (
    <>
      <SplitViewMode isOpen={showSplitView} onClose={() => setShowSplitView(false)} files={files} messages={messages} onSendMessage={onSendMessage} isLoading={isLoading} repoName={repoName} />
      <CodeSearchModal isOpen={showCodeSearch} onClose={() => setShowCodeSearch(false)} files={files} onFileSelect={(path) => { setSelectedFile(path); setShowFileTree(true); }} />
      <BookmarksPanel isOpen={showBookmarks} onClose={() => setShowBookmarks(false)} bookmarks={bookmarks} onRemoveBookmark={removeBookmark} onUpdateBookmark={updateBookmark} onClearAll={clearAllBookmarks} onNavigate={(path) => { setSelectedFile(path); setShowFileTree(true); setShowBookmarks(false); }} />
      <ExportReportModal isOpen={showExport} onClose={() => setShowExport(false)} repoName={repoName} files={files} messages={messages} />
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      
      <section className="py-6 sm:py-10 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5">
            {showStats && <FileStats files={files} />}
            {showGraph && <DependencyGraph files={files} className="h-[500px]" />}
            {chatContent}
          </div>
        </div>
      </section>
    </>
  );
};

export default ChatInterface;
