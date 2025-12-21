import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, X, FileCode, ChevronRight, Regex, CaseSensitive, WholeWord } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

interface SearchResult {
  path: string;
  lineNumber: number;
  line: string;
  matchStart: number;
  matchEnd: number;
}

interface CodeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: { path: string; content: string }[];
  onFileSelect?: (path: string, lineNumber: number) => void;
}

const CodeSearchModal = ({ isOpen, onClose, files, onFileSelect }: CodeSearchModalProps) => {
  const [query, setQuery] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo((): SearchResult[] => {
    if (!query.trim() || query.length < 2) return [];

    const searchResults: SearchResult[] = [];
    
    try {
      let searchPattern: RegExp;
      
      if (useRegex) {
        searchPattern = new RegExp(query, caseSensitive ? 'g' : 'gi');
      } else {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
        searchPattern = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
      }

      for (const file of files) {
        const lines = file.content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const matches = Array.from(line.matchAll(searchPattern));
          
          for (const match of matches) {
            if (match.index !== undefined) {
              searchResults.push({
                path: file.path,
                lineNumber: i + 1,
                line: line.trim(),
                matchStart: match.index,
                matchEnd: match.index + match[0].length,
              });
            }
            
            if (searchResults.length >= 200) break;
          }
          if (searchResults.length >= 200) break;
        }
        if (searchResults.length >= 200) break;
      }
    } catch (e) {
      // Invalid regex
    }

    return searchResults;
  }, [query, files, useRegex, caseSensitive, wholeWord]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const result of results) {
      if (!groups[result.path]) {
        groups[result.path] = [];
      }
      groups[result.path].push(result);
    }
    return groups;
  }, [results]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        const result = results[selectedIndex];
        onFileSelect?.(result.path, result.lineNumber);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onFileSelect]);

  const highlightMatch = useCallback((line: string, matchStart: number, matchEnd: number) => {
    const trimOffset = line.length - line.trimStart().length;
    const adjustedStart = Math.max(0, matchStart - trimOffset);
    const adjustedEnd = Math.max(0, matchEnd - trimOffset);
    const trimmedLine = line.trim();
    
    return (
      <span className="font-mono text-xs">
        {trimmedLine.slice(0, adjustedStart)}
        <span className="bg-primary/30 text-primary font-semibold px-0.5 rounded">
          {trimmedLine.slice(adjustedStart, adjustedEnd)}
        </span>
        {trimmedLine.slice(adjustedEnd)}
      </span>
    );
  }, []);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all files..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-lg"
            />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search Options */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant={useRegex ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setUseRegex(!useRegex)}
              className="h-7 text-xs gap-1.5"
            >
              <Regex className="w-3.5 h-3.5" />
              Regex
            </Button>
            <Button
              variant={caseSensitive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCaseSensitive(!caseSensitive)}
              className="h-7 text-xs gap-1.5"
            >
              <CaseSensitive className="w-3.5 h-3.5" />
              Case
            </Button>
            <Button
              variant={wholeWord ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setWholeWord(!wholeWord)}
              className="h-7 text-xs gap-1.5"
            >
              <WholeWord className="w-3.5 h-3.5" />
              Word
            </Button>
            <span className="text-xs text-muted-foreground ml-auto">
              {results.length} {results.length === 200 ? "+" : ""} results
            </span>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[50vh]">
          {query.length < 2 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Type at least 2 characters to search</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedResults).map(([path, fileResults]) => (
                <div key={path} className="mb-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground sticky top-0 bg-background">
                    <FileCode className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">{path}</span>
                    <span className="text-xs">({fileResults.length})</span>
                  </div>
                  
                  {fileResults.map((result, i) => {
                    flatIndex++;
                    const currentIndex = flatIndex;
                    
                    return (
                      <button
                        key={`${result.path}-${result.lineNumber}-${i}`}
                        onClick={() => {
                          onFileSelect?.(result.path, result.lineNumber);
                          onClose();
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg flex items-start gap-3 transition-colors",
                          currentIndex === selectedIndex 
                            ? "bg-primary/10 text-foreground" 
                            : "hover:bg-secondary/50"
                        )}
                      >
                        <span className="text-xs text-muted-foreground w-8 text-right flex-shrink-0 pt-0.5">
                          {result.lineNumber}
                        </span>
                        <div className="flex-1 overflow-hidden">
                          {highlightMatch(result.line, result.matchStart, result.matchEnd)}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex items-center gap-4">
          <span>↑↓ Navigate</span>
          <span>↵ Open file</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
};

export default CodeSearchModal;
