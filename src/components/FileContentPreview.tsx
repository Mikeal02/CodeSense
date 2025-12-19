import { X, Copy, Check, FileCode } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface FileContentPreviewProps {
  filePath: string;
  content: string;
  onClose: () => void;
}

const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    java: "java",
    go: "go",
    rs: "rust",
    css: "css",
    scss: "scss",
    html: "html",
    json: "json",
    md: "markdown",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    sql: "sql",
  };
  return langMap[ext || ""] || "plaintext";
};

const FileContentPreview = ({ filePath, content, onClose }: FileContentPreviewProps) => {
  const [copied, setCopied] = useState(false);
  const language = getLanguageFromPath(filePath);
  const lines = content.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full border-l border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium truncate">{filePath}</span>
          <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground flex-shrink-0">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-7 w-7"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex text-sm font-mono">
          {/* Line Numbers */}
          <div className="flex-shrink-0 text-right pr-4 pl-4 py-4 text-muted-foreground/50 select-none border-r border-border/50 bg-secondary/20">
            {lines.map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>
          
          {/* Code */}
          <pre className="flex-1 p-4 overflow-x-auto">
            <code className={cn("text-foreground/90")}>
              {lines.map((line, i) => (
                <div key={i} className="leading-6 whitespace-pre">
                  {line || ' '}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground bg-secondary/30">
        {lines.length} lines • {content.length} characters
      </div>
    </div>
  );
};

export default FileContentPreview;
