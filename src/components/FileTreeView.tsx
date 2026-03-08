import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ChevronRight, Folder, FolderOpen, FileCode, FileJson,
  FileText, File, Search, X, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { useVirtualizer } from "@tanstack/react-virtual";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  size?: number;
  lines?: number;
  depth: number;
}

interface FileTreeViewProps {
  files: { path: string; content: string }[];
  onFileSelect?: (path: string) => void;
  selectedFile?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const fileIconColors: Record<string, string> = {
  ts: "text-info", tsx: "text-info", js: "text-warning", jsx: "text-warning",
  py: "text-success", json: "text-muted-foreground", css: "text-accent",
  scss: "text-accent", html: "text-destructive", md: "text-info",
  yaml: "text-destructive", yml: "text-destructive", rs: "text-warning",
  go: "text-info", java: "text-warning", sql: "text-info",
  sh: "text-success", bash: "text-success", xml: "text-warning",
  svg: "text-accent", png: "text-accent", jpg: "text-accent",
  toml: "text-muted-foreground", env: "text-warning",
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || "";
  const colorClass = fileIconColors[ext] || "text-muted-foreground";
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'go', 'rs', 'c', 'cpp', 'rb', 'php', 'swift'].includes(ext))
    return <FileCode className={cn("w-3.5 h-3.5", colorClass)} />;
  if (['json', 'yaml', 'yml', 'toml', 'xml', 'graphql'].includes(ext))
    return <FileJson className={cn("w-3.5 h-3.5", colorClass)} />;
  if (['md', 'txt', 'html', 'css', 'scss'].includes(ext))
    return <FileText className={cn("w-3.5 h-3.5", colorClass)} />;
  return <File className={cn("w-3.5 h-3.5", colorClass)} />;
};

const getExtBadge = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  const colorClass = fileIconColors[ext];
  return (
    <span className={cn("text-[8px] font-mono opacity-40 ml-auto flex-shrink-0", colorClass)}>
      .{ext}
    </span>
  );
};

const buildTree = (files: { path: string; content: string }[]): FileNode[] => {
  const root: FileNode[] = [];
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let node = current.find(n => n.name === part);
      if (!node) {
        node = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
          size: isFile ? file.content.length : undefined,
          lines: isFile ? file.content.split('\n').length : undefined,
          depth: index,
        };
        current.push(node);
      }
      if (!isFile && node.children) current = node.children;
    });
  });

  const sortNodes = (nodes: FileNode[]): FileNode[] =>
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    }).map(node => ({
      ...node,
      children: node.children ? sortNodes(node.children) : undefined,
    }));

  return sortNodes(root);
};

const countChildren = (node: FileNode): number => {
  if (node.type === 'file') return 1;
  return node.children?.reduce((sum, c) => sum + countChildren(c), 0) || 0;
};

// Flatten tree into visible rows for virtualization
interface FlatRow {
  node: FileNode;
  depth: number;
  isOpen: boolean;
  childCount: number;
}

function flattenTree(
  nodes: FileNode[],
  openPaths: Set<string>,
  depth: number = 0
): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const node of nodes) {
    const isOpen = node.type === 'folder' && openPaths.has(node.path);
    rows.push({ node, depth, isOpen, childCount: node.type === 'folder' ? countChildren(node) : 0 });
    if (isOpen && node.children) {
      rows.push(...flattenTree(node.children, openPaths, depth + 1));
    }
  }
  return rows;
}

const FileTreeView = ({ files, onFileSelect, selectedFile }: FileTreeViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showHidden, setShowHidden] = useState(true);
  const [openPaths, setOpenPaths] = useState<Set<string>>(() => new Set());
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredFiles = useMemo(() => {
    let result = files;
    if (!showHidden) result = result.filter(f => !f.path.split('/').some(p => p.startsWith('.')));
    if (!searchQuery.trim()) return result;
    const query = searchQuery.toLowerCase();
    return result.filter(f => f.path.toLowerCase().includes(query));
  }, [files, searchQuery, showHidden]);

  const tree = useMemo(() => buildTree(filteredFiles), [filteredFiles]);

  // Auto-open root-level folders on first load
  useEffect(() => {
    if (!hasAutoOpened && tree.length > 0) {
      const initial = new Set<string>();
      tree.forEach(n => { if (n.type === 'folder') initial.add(n.path); });
      setOpenPaths(initial);
      setHasAutoOpened(true);
    }
  }, [tree, hasAutoOpened]);

  const flatRows = useMemo(() => flattenTree(tree, openPaths), [tree, openPaths]);

  const virtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 26,
    overscan: 15,
  });

  const toggleFolder = useCallback((path: string) => {
    setOpenPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  // Language stats mini-bar
  const langStats = useMemo(() => {
    const map = new Map<string, number>();
    files.forEach(f => {
      const ext = f.path.split('.').pop()?.toLowerCase() || 'other';
      map.set(ext, (map.get(ext) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [files]);

  if (files.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        <File className="w-8 h-8 mx-auto mb-2 opacity-20" />
        <p className="text-xs">No files loaded</p>
      </div>
    );
  }

  return (
    <div className="py-1 flex flex-col h-full">
      {/* Search */}
      <div className="px-2 pb-1.5 pt-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter files..."
            className="h-7 pl-7 pr-7 text-[11px] bg-secondary/30 border-border/30 rounded-lg"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Mini stats bar */}
      <div className="px-2 pb-1.5 flex items-center gap-1 overflow-hidden">
        <div className="flex-1 flex h-1 rounded-full overflow-hidden bg-secondary/30">
          {langStats.map(([ext, count]) => (
            <div
              key={ext}
              className="h-full transition-all"
              style={{
                width: `${(count / files.length) * 100}%`,
                backgroundColor: `hsl(${ext.charCodeAt(0) * 7 % 360} 60% 55%)`,
              }}
              title={`.${ext}: ${count} files`}
            />
          ))}
        </div>
      </div>

      {/* File count & controls */}
      <div className="px-2 py-1 flex items-center justify-between">
        <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-wider">
          {filteredFiles.length}{searchQuery ? ` / ${files.length}` : ""} files
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost" size="icon"
            onClick={() => setShowHidden(!showHidden)}
            className={cn("h-5 w-5", !showHidden && "text-primary")}
            title="Toggle hidden files"
          >
            <Eye className="w-2.5 h-2.5" />
          </Button>
        </div>
      </div>

      {/* Virtualized Tree */}
      <div ref={parentRef} className="flex-1 overflow-y-auto px-1">
        {filteredFiles.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground/40 text-[11px]">
            No files match "{searchQuery}"
          </div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
            {virtualizer.getVirtualItems().map(virtualRow => {
              const { node, depth, isOpen, childCount } = flatRows[virtualRow.index];
              const isSelected = selectedFile === node.path;

              return (
                <div
                  key={node.path}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <button
                    onClick={() => {
                      if (node.type === 'folder') toggleFolder(node.path);
                      else onFileSelect?.(node.path);
                    }}
                    className={cn(
                      "w-full flex items-center gap-1.5 py-[3px] px-2 text-[12px] rounded-md transition-all duration-150 text-left group",
                      isSelected && "bg-primary/15 text-primary ring-1 ring-primary/20",
                      !isSelected && "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    )}
                    style={{ paddingLeft: `${depth * 14 + 8}px` }}
                  >
                    {node.type === 'folder' ? (
                      <>
                        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
                          <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-50" />
                        </motion.div>
                        {isOpen
                          ? <FolderOpen className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          : <Folder className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
                        }
                      </>
                    ) : (
                      <>
                        <span className="w-3 flex-shrink-0" />
                        {getFileIcon(node.name)}
                      </>
                    )}
                    <span className="truncate">{node.name}</span>
                    {node.type === 'folder' && (
                      <span className="text-[9px] text-muted-foreground/30 ml-auto tabular-nums flex-shrink-0">
                        {childCount}
                      </span>
                    )}
                    {node.type === 'file' && getExtBadge(node.name)}
                    {node.type === 'file' && node.lines && (
                      <span className="text-[8px] text-muted-foreground/25 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                        {node.lines}L
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTreeView;
