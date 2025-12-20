import { X, Copy, Check, FileCode } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface FileContentPreviewProps {
  filePath: string;
  content: string;
  onClose: () => void;
  hideHeader?: boolean;
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

// Simple syntax highlighting component
const SyntaxHighlightedLine = ({ line, language }: { line: string; language: string }) => {
  if (!line.trim()) return <span>{' '}</span>;
  
  // Catppuccin Mocha colors
  const colors = {
    keyword: "#cba6f7",     // Mauve
    string: "#a6e3a1",      // Green
    comment: "#6c7086",     // Overlay0
    number: "#fab387",      // Peach
    function: "#89b4fa",    // Blue
    variable: "#f5e0dc",    // Rosewater
    operator: "#89dceb",    // Sky
    property: "#f9e2af",    // Yellow
    tag: "#f38ba8",         // Red
    attribute: "#fab387",   // Peach
    type: "#f9e2af",        // Yellow
  };

  // Simple patterns for syntax highlighting
  const patterns: { regex: RegExp; color: string }[] = [
    // Comments
    { regex: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, color: colors.comment },
    // Strings
    { regex: /("[^"]*"|'[^']*'|`[^`]*`)/g, color: colors.string },
    // Keywords
    { regex: /\b(const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|new|this|async|await|try|catch|throw|typeof|instanceof|in|of|switch|case|break|continue|do|static|public|private|protected|interface|type|enum|implements|abstract|readonly|as|is|keyof|infer|never|void|null|undefined|true|false)\b/g, color: colors.keyword },
    // Types (TypeScript)
    { regex: /\b(string|number|boolean|object|any|unknown|Array|Promise|Record|Partial|Required|Pick|Omit|Exclude|Extract|NonNullable|ReturnType|Parameters|InstanceType|React|FC|ReactNode|JSX|Element)\b/g, color: colors.type },
    // Functions
    { regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, color: colors.function },
    // Numbers
    { regex: /\b(\d+\.?\d*|0x[0-9a-fA-F]+)\b/g, color: colors.number },
    // Operators
    { regex: /(=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|^~?:])/g, color: colors.operator },
    // JSX/HTML tags
    { regex: /(<\/?[a-zA-Z][a-zA-Z0-9]*)/g, color: colors.tag },
    // Object properties
    { regex: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, color: colors.property },
  ];

  // Build highlighted segments
  let result = line;
  const segments: { start: number; end: number; color: string; text: string }[] = [];
  
  patterns.forEach(({ regex, color }) => {
    let match;
    const re = new RegExp(regex.source, regex.flags);
    while ((match = re.exec(line)) !== null) {
      const text = match[1] || match[0];
      const start = match.index + (match[0].indexOf(text));
      segments.push({
        start,
        end: start + text.length,
        color,
        text,
      });
    }
  });

  // Sort by start position and remove overlapping
  segments.sort((a, b) => a.start - b.start);
  const nonOverlapping: typeof segments = [];
  let lastEnd = 0;
  segments.forEach(seg => {
    if (seg.start >= lastEnd) {
      nonOverlapping.push(seg);
      lastEnd = seg.end;
    }
  });

  // Build the final JSX
  const parts: JSX.Element[] = [];
  let currentPos = 0;
  
  nonOverlapping.forEach((seg, i) => {
    if (seg.start > currentPos) {
      parts.push(<span key={`text-${i}`}>{line.slice(currentPos, seg.start)}</span>);
    }
    parts.push(<span key={`hl-${i}`} style={{ color: seg.color }}>{seg.text}</span>);
    currentPos = seg.end;
  });
  
  if (currentPos < line.length) {
    parts.push(<span key="end">{line.slice(currentPos)}</span>);
  }

  return <>{parts.length > 0 ? parts : line}</>;
};

const FileContentPreview = ({ filePath, content, onClose, hideHeader = false }: FileContentPreviewProps) => {
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
      {!hideHeader && (
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
      )}

      {/* Code Content with Syntax Theme */}
      <div className="flex-1 overflow-auto bg-[#1e1e2e]">
        <div className="flex text-sm font-mono">
          {/* Line Numbers */}
          <div className="flex-shrink-0 text-right pr-4 pl-4 py-4 text-[#6c7086] select-none border-r border-[#313244] bg-[#181825]">
            {lines.map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>
          
          {/* Code with Catppuccin-inspired theme */}
          <pre className="flex-1 p-4 overflow-x-auto">
            <code className="text-[#cdd6f4]">
              {lines.map((line, i) => (
                <div key={i} className="leading-6 whitespace-pre">
                  <SyntaxHighlightedLine line={line} language={language} />
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
