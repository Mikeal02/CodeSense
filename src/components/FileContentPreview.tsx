import { X, Copy, Check, FileCode, Hash, WrapText, ZoomIn, ZoomOut, Download, Search, ArrowUp, ArrowDown, Columns2, Terminal, Braces, GitBranch } from "lucide-react";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useShikiHighlighter } from "@/hooks/useShikiHighlighter";

interface FileContentPreviewProps {
  filePath: string;
  content: string;
  onClose: () => void;
  hideHeader?: boolean;
}

const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "TypeScript", tsx: "TypeScript React", js: "JavaScript", jsx: "JavaScript React",
    py: "Python", java: "Java", go: "Go", rs: "Rust", css: "CSS", scss: "SCSS",
    html: "HTML", json: "JSON", md: "Markdown", yaml: "YAML", yml: "YAML",
    toml: "TOML", sql: "SQL", sh: "Shell", bash: "Shell", rb: "Ruby",
    php: "PHP", swift: "Swift", kt: "Kotlin", c: "C", cpp: "C++", h: "C",
    vue: "Vue", svelte: "Svelte", xml: "XML", graphql: "GraphQL",
  };
  return langMap[ext || ""] || "Plain Text";
};

const getLanguageColor = (lang: string): string => {
  const colors: Record<string, string> = {
    "TypeScript": "#3178c6", "TypeScript React": "#3178c6", "JavaScript": "#f7df1e", "JavaScript React": "#f7df1e",
    "Python": "#3572A5", "Rust": "#dea584", "Go": "#00ADD8", "Java": "#b07219",
    "CSS": "#663399", "SCSS": "#c6538c", "HTML": "#e34c26", "JSON": "#6c7086",
    "Markdown": "#083fa1", "Shell": "#89e051", "Ruby": "#701516",
    "Swift": "#F05138", "Kotlin": "#A97BFF", "C": "#555555", "C++": "#f34b7d",
  };
  return colors[lang] || "hsl(var(--primary))";
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
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);

  const { html: shikiHtml, isReady: shikiReady } = useShikiHighlighter(content, filePath);

  const language = getLanguageFromPath(filePath);
  const langColor = getLanguageColor(language);
  const lines = content.split('\n');
  const fileName = filePath.split('/').pop() || filePath;
  const pathParts = filePath.split('/');

  // Track scroll position for minimap viewport indicator
  const handleScroll = useCallback(() => {
    if (codeRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = codeRef.current;
      setScrollPercent(scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0);
    }
  }, []);

  useEffect(() => {
    const el = codeRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

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
    const sizeKB = new Blob([content]).size;
    return { chars, words, blankLines, sizeKB };
  }, [content, lines]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Minimap viewport height ratio
  const viewportRatio = useMemo(() => {
    if (!codeRef.current) return 0.1;
    return Math.min(1, 30 / lines.length); // rough estimate
  }, [lines.length]);

  const renderLineNumber = (i: number) => {
    const isActive = highlightedLine === i;
    const isHovered = hoveredLine === i;
    const isSearchHit = searchMatches.includes(i);

    return (
      <div
        key={i}
        data-line={i}
        className={cn(
          "leading-[1.65] px-2 cursor-pointer transition-colors duration-75 text-right select-none relative",
          isActive && "text-[#cdd6f4] font-medium",
          isHovered && !isActive && "text-[#a6adc8]",
          !isActive && !isHovered && "text-[#45475a]",
        )}
        onClick={() => setHighlightedLine(highlightedLine === i ? null : i)}
        onMouseEnter={() => setHoveredLine(i)}
        onMouseLeave={() => setHoveredLine(null)}
        style={{ fontSize: fontSize - 1 }}
      >
        {/* Active line gutter indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />
        )}
        {/* Search match gutter dot */}
        {isSearchHit && !isActive && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-warning" />
        )}
        {i + 1}
      </div>
    );
  };

  const renderCodeLine = (line: string, i: number) => {
    const isActive = highlightedLine === i;
    const isHovered = hoveredLine === i;
    const isSearchHit = searchMatches.includes(i) && !isActive;

    return (
      <div
        key={i}
        data-line={i}
        className={cn(
          "leading-[1.65] px-3 rounded-none transition-colors duration-75 relative",
          isActive && "bg-[#313244]/60 border-l-0",
          isHovered && !isActive && "bg-[#313244]/25",
          isSearchHit && "bg-[#f9e2af]/[0.06]"
        )}
        onMouseEnter={() => setHoveredLine(i)}
        onMouseLeave={() => setHoveredLine(null)}
        style={wordWrap ? {} : { whiteSpace: 'pre' }}
      >
        {line || ' '}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1e1e2e] via-[#1e1e2e] to-[#181825]">
      {/* ── Header Tab Bar ── */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-1 h-9 border-b border-[#313244]/60 bg-gradient-to-b from-[#1a1a28] to-[#181825] shadow-[0_1px_0_0_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-0 min-w-0">
            {/* Active tab */}
            <div className="flex items-center gap-2 px-3 h-9 bg-[#1e1e2e] border-r border-[#313244]/40 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-b shadow-[0_0_8px_currentColor]" style={{ backgroundColor: langColor, color: langColor }} />
              <FileCode className="w-3.5 h-3.5 flex-shrink-0" style={{ color: langColor }} />
              <span className="text-[12px] font-medium text-[#cdd6f4] truncate max-w-48">{fileName}</span>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-5 w-5 opacity-50 hover:opacity-100 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-0.5 pr-2">
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)} className="h-7 w-7 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]" title="Find (Ctrl+F)">
              <Search className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]" title="Copy all">
              {copied ? <Check className="w-3.5 h-3.5 text-[#a6e3a1]" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload} className="h-7 w-7 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]" title="Download">
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      {pathParts.length > 1 && (
        <div className="flex items-center gap-0 px-4 h-6 text-[11px] border-b border-[#313244]/30 bg-[#181825]/50 overflow-x-auto scrollbar-none">
          {pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-0 flex-shrink-0">
              {i > 0 && <span className="text-[#45475a] mx-1">/</span>}
              <span className={cn(
                "hover:text-[#cdd6f4] transition-colors cursor-default",
                i === pathParts.length - 1 ? "text-[#cdd6f4]" : "text-[#6c7086]"
              )}>
                {part}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* ── Search Bar ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-[#181825] border-b border-[#313244]/40">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6c7086]" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSearchIndex(0); }}
                  placeholder="Find..."
                  className="h-7 pl-8 pr-3 text-xs bg-[#313244]/60 border-[#45475a]/50 text-[#cdd6f4] placeholder:text-[#6c7086] rounded-md focus-visible:ring-1 focus-visible:ring-primary/50"
                  onKeyDown={e => { if (e.key === 'Enter') e.shiftKey ? prevMatch() : nextMatch(); }}
                />
              </div>
              {searchMatches.length > 0 && (
                <span className="text-[11px] text-[#a6adc8] tabular-nums whitespace-nowrap">
                  {searchIndex + 1} of {searchMatches.length}
                </span>
              )}
              {searchQuery && searchMatches.length === 0 && (
                <span className="text-[11px] text-[#f38ba8] whitespace-nowrap">No results</span>
              )}
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" onClick={prevMatch} className="h-6 w-6 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]" disabled={!searchMatches.length}>
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextMatch} className="h-6 w-6 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]" disabled={!searchMatches.length}>
                  <ArrowDown className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="h-6 w-6 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Code Content ── */}
      <div className="flex-1 overflow-hidden flex relative">
        <div ref={codeRef} className="flex-1 overflow-auto" onScroll={handleScroll}>
          {shikiReady ? (
            <div className="flex font-mono" style={{ fontSize }}>
              {/* Gutter */}
              <div className="flex-shrink-0 text-right pr-2 pl-4 py-3 select-none border-r border-[#313244]/40 bg-gradient-to-r from-[#181825] to-[#181825]/70 sticky left-0 z-10 min-w-[3.5rem] backdrop-blur-sm">
                {lines.map((_, i) => renderLineNumber(i))}
              </div>
              {/* Code */}
              <div
                className={cn("flex-1 py-3 overflow-x-auto shiki-container", wordWrap && "[&_pre]:whitespace-pre-wrap [&_pre]:break-all")}
                dangerouslySetInnerHTML={{ __html: shikiHtml }}
                style={{ fontSize }}
              />
            </div>
          ) : (
            <div className="flex font-mono" style={{ fontSize }}>
              <div className="flex-shrink-0 text-right pr-2 pl-4 py-3 select-none border-r border-[#313244]/30 bg-[#181825]/60 sticky left-0 z-10 min-w-[3.5rem]">
                {lines.map((_, i) => renderLineNumber(i))}
              </div>
              <pre className={cn("flex-1 py-3 overflow-x-auto", wordWrap && "whitespace-pre-wrap break-all")}>
                <code className="text-[#cdd6f4]">
                  {lines.map((line, i) => renderCodeLine(line, i))}
                </code>
              </pre>
            </div>
          )}
        </div>

        {/* ── Minimap ── */}
        {showMinimap && lines.length > 30 && (
          <div
            ref={minimapRef}
            className="w-[60px] flex-shrink-0 bg-[#11111b] border-l border-[#313244]/20 overflow-hidden relative cursor-pointer"
            onClick={(e) => {
              if (codeRef.current && minimapRef.current) {
                const rect = minimapRef.current.getBoundingClientRect();
                const clickPercent = (e.clientY - rect.top) / rect.height;
                const { scrollHeight, clientHeight } = codeRef.current;
                codeRef.current.scrollTo({ top: clickPercent * (scrollHeight - clientHeight), behavior: 'smooth' });
              }
            }}
          >
            {/* Viewport indicator */}
            <div
              className="absolute left-0 right-0 bg-[#cdd6f4]/[0.06] border-y border-[#cdd6f4]/[0.08] transition-transform duration-100 pointer-events-none"
              style={{
                height: `${Math.max(viewportRatio * 100, 8)}%`,
                transform: `translateY(${scrollPercent * (100 - viewportRatio * 100)}%)`,
                top: 0,
              }}
            />
            {/* Minimap lines */}
            <div className="p-1.5" style={{ fontSize: 1.2, lineHeight: '1.8px' }}>
              {lines.map((line, i) => {
                const isActive = highlightedLine === i;
                const isSearchHit = searchMatches.includes(i);
                const trimmed = line.trim();
                const indent = line.length - line.trimStart().length;
                
                return (
                  <div
                    key={i}
                    className="relative"
                    style={{ height: 1.8 }}
                  >
                    <div
                      className={cn(
                        "absolute top-0 h-[1.4px] rounded-[0.3px]",
                        isActive && "!bg-primary/60",
                        isSearchHit && "!bg-[#f9e2af]/50"
                      )}
                      style={{
                        left: Math.min(indent * 0.4, 12),
                        width: trimmed ? `${Math.min(trimmed.length * 0.35, 48)}px` : 0,
                        backgroundColor: trimmed ? `rgba(205, 214, 244, ${Math.min(0.25, 0.08 + trimmed.length / 200)})` : 'transparent'
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Status Bar ── */}
      <div className="h-[22px] border-t border-[#313244]/40 bg-gradient-to-b from-[#181825] to-[#11111b] flex items-center justify-between px-3 text-[11px] select-none">
        <div className="flex items-center gap-3 text-[#6c7086]">
          {highlightedLine !== null && (
            <span className="text-[#cdd6f4]">
              Ln {highlightedLine + 1}, Col 1
            </span>
          )}
          <span>{lines.length} lines</span>
          <span>{formatSize(stats.sizeKB)}</span>
          <span className="hidden sm:inline">{stats.words.toLocaleString()} words</span>
        </div>
        <div className="flex items-center gap-3 text-[#6c7086]">
          <button onClick={() => setWordWrap(!wordWrap)} className={cn("hover:text-[#cdd6f4] transition-colors", wordWrap && "text-[#cdd6f4]")}>
            {wordWrap ? "Word Wrap: On" : "Word Wrap: Off"}
          </button>
          <button onClick={() => setShowMinimap(!showMinimap)} className={cn("hover:text-[#cdd6f4] transition-colors", showMinimap && "text-[#cdd6f4]")}>
            Minimap
          </button>
          <span>UTF-8</span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: langColor, color: langColor }} />
            <span className="text-[#cdd6f4]">{language}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileContentPreview;
