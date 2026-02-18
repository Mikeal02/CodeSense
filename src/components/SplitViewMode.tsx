import { useState, useCallback, useEffect } from "react";
import { 
  PanelLeftClose, PanelLeftOpen, X, Columns2, 
  Keyboard, Search, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import FileTreeView from "./FileTreeView";
import FileContentPreview from "./FileContentPreview";
import { Message } from "./ChatInterface";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send, Loader2, Code, FileCode, Copy, Check } from "lucide-react";
import { Input } from "./ui/input";

interface SplitViewModeProps {
  isOpen: boolean;
  onClose: () => void;
  files: { path: string; content: string }[];
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  repoName?: string;
}

const SplitViewMode = ({ 
  isOpen, 
  onClose, 
  files, 
  messages, 
  onSendMessage, 
  isLoading, 
  repoName 
}: SplitViewModeProps) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showFileTree, setShowFileTree] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const activeFile = selectedFiles[activeFileIndex];

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B: Toggle file tree
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowFileTree(prev => !prev);
      }
      // Ctrl/Cmd + J: Toggle chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setShowChat(prev => !prev);
      }
      // Ctrl/Cmd + W: Close active tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (selectedFiles.length > 0) {
          closeTab(activeFileIndex);
        }
      }
      // Ctrl/Cmd + Tab: Next tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        if (selectedFiles.length > 1) {
          setActiveFileIndex(prev => (prev + 1) % selectedFiles.length);
        }
      }
      // Escape: Close split view
      if (e.key === 'Escape') {
        onClose();
      }
      // Ctrl/Cmd + /: Show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
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
    if (activeFileIndex >= newFiles.length) {
      setActiveFileIndex(Math.max(0, newFiles.length - 1));
    } else if (index < activeFileIndex) {
      setActiveFileIndex(activeFileIndex - 1);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top Bar */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFileTree(!showFileTree)}
            className={cn("h-8 w-8", showFileTree && "bg-primary/10 text-primary")}
            title="Toggle file tree (Ctrl+B)"
          >
            {showFileTree ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <Columns2 className="w-4 h-4 text-primary" />
            <span className="font-medium">Split View</span>
            <span className="text-muted-foreground">• {repoName || "No repo"}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="h-8 gap-1.5 text-xs"
          >
            <Keyboard className="w-3.5 h-3.5" />
            Shortcuts
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className={cn("h-8 w-8", showChat && "bg-primary/10 text-primary")}
            title="Toggle chat (Ctrl+J)"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            title="Exit split view (Esc)"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="absolute top-14 right-4 z-50 bg-card border border-border rounded-lg p-4 shadow-xl w-72">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-primary" />
            Keyboard Shortcuts
          </h3>
          <div className="space-y-2 text-sm">
            {[
              ["Ctrl/⌘ + B", "Toggle file tree"],
              ["Ctrl/⌘ + J", "Toggle chat panel"],
              ["Ctrl/⌘ + W", "Close active tab"],
              ["Ctrl/⌘ + Tab", "Switch tabs"],
              ["Ctrl/⌘ + /", "Show shortcuts"],
              ["Esc", "Exit split view"],
            ].map(([key, desc]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground">{desc}</span>
                <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">{key}</kbd>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree */}
        {showFileTree && (
          <div className="w-full sm:w-56 lg:w-64 border-r border-border bg-card/50 flex-shrink-0">
            <FileTreeView 
              files={files} 
              onFileSelect={handleFileSelect}
              selectedFile={activeFile}
            />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e2e]">
          {/* Tabs */}
          {selectedFiles.length > 0 && (
            <div className="flex items-center border-b border-[#313244] bg-[#181825] overflow-x-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={file}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 border-r border-[#313244] cursor-pointer group min-w-0",
                    index === activeFileIndex 
                      ? "bg-[#1e1e2e] text-[#cdd6f4]" 
                      : "text-[#6c7086] hover:bg-[#1e1e2e]/50"
                  )}
                  onClick={() => setActiveFileIndex(index)}
                >
                  <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-sm truncate max-w-32">{file.split('/').pop()}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:bg-[#313244] rounded p-0.5 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
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
            <div className="flex-1 flex items-center justify-center text-[#6c7086]">
              <div className="text-center">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a file to view</p>
                <p className="text-sm mt-1">Use the file tree on the left or Ctrl+P to search</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-full sm:w-80 lg:w-96 border-l border-border bg-card/50 flex flex-col flex-shrink-0">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Assistant</span>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary ml-auto" />}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Ask questions about your code
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" && "flex-row-reverse"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
                      message.role === "assistant" 
                        ? "bg-primary/20" 
                        : "bg-secondary"
                    )}>
                      {message.role === "assistant" ? (
                        <Sparkles className="w-3 h-3 text-primary" />
                      ) : (
                        <Code className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className={cn(
                      "max-w-[85%]",
                      message.role === "user" && "text-right"
                    )}>
                      <div className={cn(
                        "inline-block px-3 py-2 rounded-lg text-sm",
                        message.role === "assistant" 
                          ? "bg-secondary/50 text-foreground text-left" 
                          : "bg-primary text-primary-foreground"
                      )}>
                        {message.role === "assistant" ? (
                          <div className="prose prose-invert prose-sm max-w-none text-xs">
                            <ReactMarkdown
                              components={{
                                code({ node, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const isInline = !match;
                                  
                                  if (isInline) {
                                    return (
                                      <code className="bg-secondary px-1 py-0.5 rounded text-primary font-mono text-xs" {...props}>
                                        {children}
                                      </code>
                                    );
                                  }
                                  
                                  return (
                                    <div className="bg-secondary/80 rounded-lg overflow-hidden my-2">
                                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50">
                                        <span className="text-xs text-muted-foreground font-mono">
                                          {match[1]}
                                        </span>
                                        <button
                                          onClick={() => handleCopy(String(children), message.id + match[1])}
                                          className="text-muted-foreground hover:text-foreground"
                                        >
                                          {copiedId === message.id + match[1] ? (
                                            <Check className="w-3 h-3 text-primary" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                      </div>
                                      <pre className="p-3 text-xs font-mono overflow-x-auto">
                                        <code {...props}>{children}</code>
                                      </pre>
                                    </div>
                                  );
                                },
                                p: ({ children }) => <p className="mb-2 text-foreground/90">{children}</p>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <span className="text-xs">{message.content}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your code..."
                  className="flex-1 h-9 text-sm bg-secondary/50 border-border/50"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90"
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

      {/* Bottom Status Bar */}
      <div className="h-6 border-t border-border bg-card/80 flex items-center px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{files.length} files</span>
          <span>•</span>
          <span>{selectedFiles.length} tabs open</span>
          {activeFile && (
            <>
              <span>•</span>
              <span className="text-foreground">{activeFile}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitViewMode;
