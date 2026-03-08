import { useState, useRef, useEffect } from "react";
import { 
  Send, Sparkles, Code, FileCode, Copy, Check, Loader2, 
  Maximize2, Minimize2, X, FolderTree, Columns2, BarChart3,
  Search, Bookmark, Download, Keyboard, Share2, ArrowDown, Bot, User
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

const suggestedQuestions = [
  { label: "Project overview", icon: "🔍" },
  { label: "Folder structure", icon: "📁" },
  { label: "Interview prep", icon: "💼" },
  { label: "Complex areas", icon: "⚠️" },
  { label: "Execution flow", icon: "▶️" },
  { label: "Resume bullets", icon: "📝" },
];

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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [showSplitView, setShowSplitView] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showCodeSearch, setShowCodeSearch] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { bookmarks, addBookmark, removeBookmark, updateBookmark, clearAllBookmarks } = useBookmarks();

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

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldAutoScroll(false);
    }
  }, [shouldAutoScroll]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setShouldAutoScroll(true);
      onSendMessage(input.trim());
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
          <div className="flex-1 overflow-hidden">
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
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
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
        
        {/* Quick suggestions (shown when messages exist) */}
        {messages.length > 0 && (
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
              onBlur={() => setIsFocused(false)}
              placeholder="Ask anything about your codebase..."
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
          <p className="text-[10px] text-muted-foreground/30 mt-1.5 text-center">Press Enter to send · Shift+Enter for new line</p>
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
