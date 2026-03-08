import { X, Copy, Check, FileCode, Hash, Braces, WrapText, Eye, EyeOff, ZoomIn, ZoomOut, Download, Minimize2, Maximize2, Search, ArrowUp, ArrowDown, Columns2 } from "lucide-react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FileContentPreviewProps {
  filePath: string;
  content: string;
  onClose: () => void;
  hideHeader?: boolean;
}

const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
    py: "python", java: "java", go: "go", rs: "rust", css: "css", scss: "scss",
    html: "html", json: "json", md: "markdown", yaml: "yaml", yml: "yaml",
    toml: "toml", sql: "sql", sh: "shell", bash: "shell", rb: "ruby",
    php: "php", swift: "swift", kt: "kotlin", c: "c", cpp: "cpp", h: "c",
    vue: "vue", svelte: "svelte", xml: "xml", graphql: "graphql",
  };
  return langMap[ext || ""] || "plaintext";
};

const getLanguageColor = (lang: string): string => {
  const colors: Record<string, string> = {
    typescript: "hsl(var(--info))", javascript: "hsl(var(--warning))",
    python: "hsl(142 71% 45%)", rust: "hsl(20 70% 65%)",
    go: "hsl(190 80% 50%)", java: "hsl(20 60% 50%)",
    css: "hsl(265 83% 67%)", html: "hsl(0 84% 60%)",
    json: "hsl(var(--muted-foreground))", markdown: "hsl(var(--info))",
    shell: "hsl(var(--success))", ruby: "hsl(0 65% 50%)",
  };
  return colors[lang] || "hsl(var(--primary))";
};

// Catppuccin Mocha colors
const colors = {
  keyword: "#cba6f7", string: "#a6e3a1", comment: "#6c7086",
  number: "#fab387", function: "#89b4fa", variable: "#f5e0dc",
  operator: "#89dceb", property: "#f9e2af", tag: "#f38ba8",
  attribute: "#fab387", type: "#f9e2af", decorator: "#f5c2e7",
};

const patterns: { regex: RegExp; color: string }[] = [
  { regex: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, color: colors.comment },
  { regex: /("[^"]*"|'[^']*'|`[^`]*`)/g, color: colors.string },
  { regex: /\b(const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|new|this|async|await|try|catch|throw|typeof|instanceof|in|of|switch|case|break|continue|do|static|public|private|protected|interface|type|enum|implements|abstract|readonly|as|is|keyof|infer|never|void|null|undefined|true|false|yield|super|finally|with|debugger|delete)\b/g, color: colors.keyword },
  { regex: /\b(string|number|boolean|object|any|unknown|Array|Promise|Record|Partial|Required|Pick|Omit|Exclude|Extract|NonNullable|ReturnType|Parameters|InstanceType|React|FC|ReactNode|JSX|Element|Map|Set|WeakMap|WeakSet|Symbol|BigInt)\b/g, color: colors.type },
  { regex: /@([a-zA-Z_$][a-zA-Z0-9_$]*)/g, color: colors.decorator },
  { regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, color: colors.function },
  { regex: /\b(\d+\.?\d*|0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+)\b/g, color: colors.number },
  { regex: /(=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|^~?:])/g, color: colors.operator },
  { regex: /(<\/?[a-zA-Z][a-zA-Z0-9]*)/g, color: colors.tag },
  { regex: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, color: colors.property },
];

const SyntaxHighlightedLine = ({ line }: { line: string }) => {
  if (!line.trim()) return <span>{' '}</span>;

  const segments: { start: number; end: number; color: string; text: string }[] = [];
  patterns.forEach(({ regex, color }) => {
    let match;
    const re = new RegExp(regex.source, regex.flags);
    while ((match = re.exec(line)) !== null) {
      const text = match[1] || match[0];
      const start = match.index + (match[0].indexOf(text));
      segments.push({ start, end: start + text.length, color, text });
    }
  });

  segments.sort((a, b) => a.start - b.start);
  const nonOverlapping: typeof segments = [];
  let lastEnd = 0;
  segments.forEach(seg => {
    if (seg.start >= lastEnd) {
      nonOverlapping.push(seg);
      lastEnd = seg.end;
    }
  });

  const parts: JSX.Element[] = [];
  let currentPos = 0;
  nonOverlapping.forEach((seg, i) => {
    if (seg.start > currentPos) parts.push(<span key={`t-${i}`}>{line.slice(currentPos, seg.start)}</span>);
    parts.push(<span key={`h-${i}`} style={{ color: seg.color }}>{seg.text}</span>);
    currentPos = seg.end;
  });
  if (currentPos < line.length) parts.push(<span key="end">{line.slice(currentPos)}</span>);

  return <>{parts.length > 0 ? parts : line}</>;
};

const FileContentPreview = ({ filePath, content, onClose, hideHeader = false }: FileContentPreviewProps) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [wordWrap, setWordWrap] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [showBreadcrumb, setShowBreadcrumb] = useState(true);
  const codeRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const language = getLanguageFromPath(filePath);
  const langColor = getLanguageColor(language);
  const lines = content.split('\n');
  const fileName = filePath.split('/').pop() || filePath;
  const pathParts = filePath.split('/');

  // Search matches
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const matches: number[] = [];
    const q = searchQuery.toLowerCase();
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes(q)) matches.push(i);
    });
    return matches;
  }, [searchQuery, lines]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
        setSearchQuery("");
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showSearch]);

  // Scroll to search result
  useEffect(() => {
    if (searchMatches.length > 0 && codeRef.current) {
      const lineEl = codeRef.current.querySelector(`[data-line="${searchMatches[searchIndex]}"]`);
      lineEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedLine(searchMatches[searchIndex]);
    }
  }, [searchIndex, searchMatches]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const nextMatch = () => setSearchIndex(prev => (prev + 1) % searchMatches.length);
  const prevMatch = () => setSearchIndex(prev => (prev - 1 + searchMatches.length) % searchMatches.length);

  // File stats
  const stats = useMemo(() => {
    const chars = content.length;
    const words = content.split(/\s+/).filter(Boolean).length;
    const blankLines = lines.filter(l => !l.trim()).length;
    const longestLine = Math.max(...lines.map(l => l.length));
    return { chars, words, blankLines, longestLine };
  }, [content, lines]);

  return (
    <div className="flex flex-col h-full border-l border-border/30 bg-background">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-secondary/20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${langColor}20` }}>
              <FileCode className="w-3 h-3" style={{ color: langColor }} />
            </div>
            <span className="text-sm font-medium truncate">{fileName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono border border-border/30" style={{ color: langColor, borderColor: `${langColor}30` }}>
              {language}
            </span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)} className="h-6 w-6" title="Find (Ctrl+F)">
              <Search className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6" title="Copy">
              {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload} className="h-6 w-6" title="Download">
              <Download className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6" title="Close">
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Breadcrumb path */}
      {showBreadcrumb && pathParts.length > 1 && (
        <div className="flex items-center gap-1 px-4 py-1.5 text-[10px] text-muted-foreground/60 border-b border-border/15 bg-secondary/10 overflow-x-auto scrollbar-none">
          {pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-1 flex-shrink-0">
              {i > 0 && <span className="text-muted-foreground/30">›</span>}
              <span className={cn(i === pathParts.length - 1 ? "text-foreground/70 font-medium" : "hover:text-foreground/50 cursor-default")}>
                {part}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-b border-border/20"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/20">
              <Search className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchIndex(0); }}
                placeholder="Find in file..."
                className="h-7 text-xs bg-background/50 border-border/30 flex-1"
                onKeyDown={e => { if (e.key === 'Enter') e.shiftKey ? prevMatch() : nextMatch(); }}
              />
              {searchMatches.length > 0 && (
                <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 tabular-nums">
                  {searchIndex + 1}/{searchMatches.length}
                </span>
              )}
              <Button variant="ghost" size="icon" onClick={prevMatch} className="h-6 w-6" disabled={!searchMatches.length}>
                <ArrowUp className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMatch} className="h-6 w-6" disabled={!searchMatches.length}>
                <ArrowDown className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="h-6 w-6">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-1 border-b border-border/15 bg-secondary/10">
        <Button variant="ghost" size="icon" onClick={() => setFontSize(s => Math.max(10, s - 1))} className="h-5 w-5" title="Zoom out">
          <ZoomOut className="w-2.5 h-2.5" />
        </Button>
        <span className="text-[9px] text-muted-foreground/50 w-7 text-center tabular-nums">{fontSize}px</span>
        <Button variant="ghost" size="icon" onClick={() => setFontSize(s => Math.min(20, s + 1))} className="h-5 w-5" title="Zoom in">
          <ZoomIn className="w-2.5 h-2.5" />
        </Button>
        <div className="w-px h-3 bg-border/20 mx-1" />
        <Button variant="ghost" size="icon" onClick={() => setWordWrap(!wordWrap)} className={cn("h-5 w-5", wordWrap && "text-primary")} title="Word wrap">
          <WrapText className="w-2.5 h-2.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowMinimap(!showMinimap)} className={cn("h-5 w-5", showMinimap && "text-primary")} title="Minimap">
          <Columns2 className="w-2.5 h-2.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowBreadcrumb(!showBreadcrumb)} className={cn("h-5 w-5", showBreadcrumb && "text-primary")} title="Breadcrumb">
          <Braces className="w-2.5 h-2.5" />
        </Button>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-hidden flex">
        <div ref={codeRef} className="flex-1 overflow-auto bg-[#1e1e2e]">
          <div className="flex font-mono" style={{ fontSize }}>
            {/* Line Numbers + Gutter */}
            <div className="flex-shrink-0 text-right pr-3 pl-3 py-3 text-[#6c7086] select-none border-r border-[#313244]/50 bg-[#181825] sticky left-0 z-10">
              {lines.map((_, i) => (
                <div
                  key={i}
                  data-line={i}
                  className={cn(
                    "leading-[1.6] px-1 cursor-pointer hover:text-[#cdd6f4] transition-colors",
                    highlightedLine === i && "bg-primary/10 text-primary rounded-sm",
                    searchMatches.includes(i) && highlightedLine !== i && "bg-warning/5"
                  )}
                  onClick={() => setHighlightedLine(highlightedLine === i ? null : i)}
                  style={{ fontSize: fontSize - 1 }}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code */}
            <pre className={cn("flex-1 p-3 overflow-x-auto", wordWrap && "whitespace-pre-wrap break-all")}>
              <code className="text-[#cdd6f4]">
                {lines.map((line, i) => (
                  <div
                    key={i}
                    data-line={i}
                    className={cn(
                      "leading-[1.6] px-1 rounded-sm transition-colors",
                      highlightedLine === i && "bg-primary/10 border-l-2 border-primary -ml-px pl-[calc(0.25rem-1px)]",
                      searchMatches.includes(i) && highlightedLine !== i && "bg-warning/8"
                    )}
                    style={wordWrap ? {} : { whiteSpace: 'pre' }}
                  >
                    <SyntaxHighlightedLine line={line} />
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>

        {/* Minimap */}
        {showMinimap && lines.length > 20 && (
          <div className="w-16 flex-shrink-0 bg-[#181825] border-l border-[#313244]/30 overflow-hidden relative">
            <div className="absolute inset-0 opacity-60" style={{ fontSize: 1.5, lineHeight: '2px', padding: 4 }}>
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "truncate",
                    highlightedLine === i && "bg-primary/30",
                    searchMatches.includes(i) && "bg-warning/30"
                  )}
                  style={{
                    height: 2,
                    backgroundColor: line.trim() ? `rgba(205, 214, 244, ${Math.min(0.3, line.trim().length / 80)})` : 'transparent'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-border/20 text-[10px] text-muted-foreground/50 bg-secondary/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Hash className="w-2.5 h-2.5" />
            {lines.length} lines
          </span>
          <span>{stats.chars.toLocaleString()} chars</span>
          <span>{stats.words.toLocaleString()} words</span>
          <span>{stats.blankLines} blank</span>
        </div>
        <div className="flex items-center gap-3">
          <span>longest: {stats.longestLine}</span>
          <span className="flex items-center gap-1" style={{ color: langColor }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor }} />
            {language}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileContentPreview;
