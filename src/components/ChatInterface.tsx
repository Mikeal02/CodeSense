import { useState, useRef, useEffect } from "react";
import { 
  Send, Sparkles, Code, FileCode, Copy, Check, Loader2, 
  Maximize2, Minimize2, X, FolderTree, Columns2, BarChart3,
  Search, Bookmark, Download, Keyboard
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
import { useBookmarks } from "@/hooks/useBookmarks";

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
  "Give me a project overview",
  "What's the folder structure?",
  "Prepare me for interviews",
  "Find complex code areas",
  "How does the main flow work?",
  "Generate resume bullets"
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
}

const ChatInterface = ({ 
  isActive, 
  messages, 
  onSendMessage, 
  isLoading, 
  repoName, 
  files = [],
  selectedFileFromPalette,
  onClearSelectedFile,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    updateBookmark,
    clearAllBookmarks,
  } = useBookmarks();

  // Handle file selection from command palette
  useEffect(() => {
    if (selectedFileFromPalette) {
      setSelectedFile(selectedFileFromPalette);
      setShowFileTree(true);
      onClearSelectedFile?.();
    }
  }, [selectedFileFromPalette, onClearSelectedFile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+F: Code search
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setShowCodeSearch(true);
      }
      // Ctrl+B: Bookmarks
      if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !e.shiftKey) {
        e.preventDefault();
        setShowBookmarks(true);
      }
      // Ctrl+E: Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowExport(true);
      }
      // Ctrl+/: Shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      // Ctrl+\: Split view
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setShowSplitView(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Only scroll when user sends a message, not during streaming
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isActive) return null;

  // When a file is selected, show only file tree and file content (no chat)
  const isFileViewMode = !!selectedFile;

  const chatContent = (
    <div data-onboarding="chat-interface" className={cn(
      "glass rounded-2xl border border-border/50 overflow-hidden flex flex-col sm:flex-row",
      isFullscreen && "h-full rounded-none border-0"
    )}>
      {/* File Tree Sidebar - Always show in file view mode */}
      {(showFileTree || isFileViewMode) && (
        <div className={cn(
          "border-b sm:border-b-0 sm:border-r border-border/50 bg-secondary/30 flex-shrink-0 flex flex-col",
          isFileViewMode ? "w-full sm:w-64 lg:w-72 max-h-48 sm:max-h-none" : "w-full sm:w-56 lg:w-64 max-h-48 sm:max-h-none"
        )}>
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">File Tree</span>
            </div>
            {!isFileViewMode && (
              <button 
                onClick={() => setShowFileTree(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <FileTreeView 
              files={files} 
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />
          </div>
        </div>
      )}

      {/* File Content Preview - Takes up remaining space when in file view mode */}
      {selectedFile && (
        <div className={cn(
          "flex-shrink-0",
          isFileViewMode ? "flex-1 min-w-0" : "w-full sm:w-80 lg:w-96"
        )}>
          <FileContentPreview
            filePath={selectedFile}
            content={files.find(f => f.path === selectedFile)?.content || ""}
            onClose={() => setSelectedFile(undefined)}
          />
        </div>
      )}

      {/* Chat Section - Hidden when file is selected */}
      {!isFileViewMode && (
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-border/50 flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">CodeSense Assistant</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Analyzing: {repoName || "No repository"}
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
            {isLoading && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Thinking...</span>
              </div>
            )}
            {files.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCodeSearch(true)}
                  className="text-muted-foreground hover:text-foreground"
                  title="Code search (Ctrl+Shift+F)"
                >
                  <Search className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBookmarks(true)}
                  className={cn("text-muted-foreground hover:text-foreground", bookmarks.length > 0 && "text-primary")}
                  title="Bookmarks (Ctrl+B)"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowExport(true)}
                  className="text-muted-foreground hover:text-foreground"
                  title="Export report (Ctrl+E)"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSplitView(true)}
                  className="text-muted-foreground hover:text-foreground"
                  title="Split view mode (Ctrl+\)"
                >
                  <Columns2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setShowStats(!showStats); setShowGraph(false); }}
                  className={cn("text-muted-foreground hover:text-foreground", showStats && "bg-primary/10 text-primary")}
                  title="File statistics"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFileTree(!showFileTree)}
                  className={cn("text-muted-foreground hover:text-foreground", showFileTree && "bg-primary/10 text-primary")}
                  title="Toggle file tree"
                >
                  <FolderTree className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcuts(true)}
              className="text-muted-foreground hover:text-foreground"
              title="Keyboard shortcuts (Ctrl+/)"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-muted-foreground hover:text-foreground"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className={cn(
            "overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1",
            isFullscreen ? "h-[calc(100vh-180px)]" : "h-[350px] sm:h-[450px] lg:h-[500px]"
          )}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="w-12 h-12 text-primary/50 mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">Ready to Analyze</h4>
              <p className="text-muted-foreground text-sm max-w-md">
                Select a mode above or ask a question to start exploring your codebase.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-4",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  message.role === "assistant" 
                    ? "bg-gradient-to-br from-primary to-accent" 
                    : "bg-secondary"
                )}>
                  {message.role === "assistant" ? (
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Code className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className={cn(
                  "max-w-[85%] space-y-3",
                  message.role === "user" && "text-right"
                )}>
                  <div className={cn(
                    "inline-block px-4 py-3 rounded-xl text-sm leading-relaxed",
                    message.role === "assistant" 
                      ? "bg-secondary/50 text-foreground text-left" 
                      : "bg-primary text-primary-foreground"
                  )}>
                    {message.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            code({ node, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match;
                              
                              if (isInline) {
                                return (
                                  <code className="bg-secondary px-1.5 py-0.5 rounded text-primary font-mono text-xs" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                              
                              return (
                                <div className="bg-secondary/80 rounded-xl overflow-hidden my-3">
                                  <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                                    <div className="flex items-center gap-2">
                                      <FileCode className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {match[1]}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleCopy(String(children), message.id + match[1])}
                                      className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      {copiedId === message.id + match[1] ? (
                                        <Check className="w-4 h-4 text-primary" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                  <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto">
                                    <code {...props}>{children}</code>
                                  </pre>
                                </div>
                              );
                            },
                            h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mt-4 mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-4 mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-3 mb-1">{children}</h3>,
                            p: ({ children }) => <p className="mb-2 text-foreground/90">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-foreground/90">{children}</li>,
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
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Suggested questions */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-border/50 flex gap-2 overflow-x-auto scrollbar-none">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              onClick={() => handleSuggestionClick(question)}
              disabled={isLoading}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
        
        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-border/50">
          <div className="flex gap-2 sm:gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your codebase..."
              className="flex-1 bg-secondary/50 border-border/50"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        {chatContent}
      </div>
    );
  }

  return (
    <>
      <SplitViewMode
        isOpen={showSplitView}
        onClose={() => setShowSplitView(false)}
        files={files}
        messages={messages}
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        repoName={repoName}
      />
      
      <CodeSearchModal
        isOpen={showCodeSearch}
        onClose={() => setShowCodeSearch(false)}
        files={files}
        onFileSelect={(path, lineNumber) => {
          setSelectedFile(path);
          setShowFileTree(true);
        }}
      />
      
      <BookmarksPanel
        isOpen={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={removeBookmark}
        onUpdateBookmark={updateBookmark}
        onClearAll={clearAllBookmarks}
        onNavigate={(path, lineNumber) => {
          setSelectedFile(path);
          setShowFileTree(true);
          setShowBookmarks(false);
        }}
      />
      
      <ExportReportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        repoName={repoName}
        files={files}
        messages={messages}
      />
      
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      
      <section className="py-8 sm:py-12 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
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
