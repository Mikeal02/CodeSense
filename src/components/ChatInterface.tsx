import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Code, FileCode, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

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
}

const ChatInterface = ({ isActive, messages, onSendMessage, isLoading, repoName }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleSuggestionClick = (question: string) => {
    if (!isLoading) {
      onSendMessage(question);
    }
  };

  if (!isActive) return null;

  return (
    <section className="py-12 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl border border-border/50 overflow-hidden">
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">CodeSense Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  Analyzing: {repoName || "No repository"}
                </p>
              </div>
              {isLoading && (
                <div className="ml-auto flex items-center gap-2 text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              )}
            </div>
            
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-6">
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
            <div className="px-6 py-3 border-t border-border/50 flex gap-2 overflow-x-auto">
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
            <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
              <div className="flex gap-3">
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
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;
