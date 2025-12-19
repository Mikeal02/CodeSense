import { useState } from "react";
import { Send, Sparkles, Code, FileCode, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeBlock?: {
    language: string;
    code: string;
    filename?: string;
  };
}

const sampleMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "I've analyzed your repository. This is a **React-based e-commerce platform** built with TypeScript and Tailwind CSS. Let me walk you through the key components."
  },
  {
    id: "2",
    role: "user",
    content: "What happens when a user adds an item to the cart?"
  },
  {
    id: "3",
    role: "assistant",
    content: "Here's the execution flow when a user adds an item to the cart:",
    codeBlock: {
      language: "typescript",
      filename: "src/hooks/useCart.ts",
      code: `const addToCart = (product: Product) => {
  // 1. Validate product availability
  if (!product.inStock) return;
  
  // 2. Update local state
  setItems(prev => [...prev, product]);
  
  // 3. Persist to localStorage
  localStorage.setItem('cart', JSON.stringify(items));
  
  // 4. Trigger analytics event
  trackEvent('add_to_cart', product.id);
};`
    }
  }
];

const suggestedQuestions = [
  "Give me a project overview",
  "What's the folder structure?",
  "Prepare me for interviews",
  "Find complex code areas"
];

interface ChatInterfaceProps {
  isActive: boolean;
}

const ChatInterface = ({ isActive }: ChatInterfaceProps) => {
  const [messages] = useState<Message[]>(sampleMessages);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
                <p className="text-xs text-muted-foreground">Analyzing: react-ecommerce-app</p>
              </div>
            </div>
            
            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
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
                    "max-w-[80%] space-y-3",
                    message.role === "user" && "text-right"
                  )}>
                    <div className={cn(
                      "inline-block px-4 py-3 rounded-xl text-sm leading-relaxed",
                      message.role === "assistant" 
                        ? "bg-secondary/50 text-foreground" 
                        : "bg-primary text-primary-foreground"
                    )}>
                      {message.content}
                    </div>
                    
                    {message.codeBlock && (
                      <div className="bg-secondary/80 rounded-xl overflow-hidden text-left">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                          <div className="flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-mono">
                              {message.codeBlock.filename}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(message.codeBlock!.code, message.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto">
                          <code>{message.codeBlock.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Suggested questions */}
            <div className="px-6 py-3 border-t border-border/50 flex gap-2 overflow-x-auto">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => setInput(question)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your codebase..."
                  className="flex-1 bg-secondary/50 border-border/50"
                />
                <Button size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;
