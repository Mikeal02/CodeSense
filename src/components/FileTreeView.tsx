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
  ts: "#3178c6", tsx: "#3178c6", js: "#f7df1e", jsx: "#f7df1e",
  py: "#3572A5", json: "#6c7086", css: "#663399", scss: "#c6538c",
  html: "#e34c26", md: "#083fa1", yaml: "#cb171e", yml: "#cb171e",
  rs: "#dea584", go: "#00ADD8", java: "#b07219", sql: "#e38c00",
  sh: "#89e051", bash: "#89e051", xml: "#f26b00", svg: "#ffb13b",
  png: "#a6adc8", jpg: "#a6adc8", toml: "#9c4121", env: "#f7df1e",
  rb: "#701516", php: "#4F5D95", swift: "#F05138", kt: "#A97BFF",
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || "";
  const color = fileIconColors[ext] || "#6c7086";
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'go', 'rs', 'c', 'cpp', 'rb', 'php', 'swift'].includes(ext))
    return <FileCode className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />;
  if (['json', 'yaml', 'yml', 'toml', 'xml', 'graphql'].includes(ext))
    return <FileJson className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />;
  if (['md', 'txt', 'html', 'css', 'scss'].includes(ext))
    return <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />;
  return <File className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />;
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
          name: part, path: parts.slice(0, index + 1).join('/'),
          type: isFile ? 'file' : 'folder', children: isFile ? undefined : [],
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
    }).map(node => ({ ...node, children: node.children ? sortNodes(node.children) : undefined }));

  return sortNodes(root);
};

const countChildren = (node: FileNode): number => {
  if (node.type === 'file') return 1;
  return node.children?.reduce((sum, c) => sum + countChildren(c), 0) || 0;
};

interface FlatRow { node: FileNode; depth: number; isOpen: boolean; childCount: number; }

function flattenTree(nodes: FileNode[], openPaths: Set<string>, depth = 0): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const node of nodes) {
    const isOpen = node.type === 'folder' && openPaths.has(node.path);
    rows.push({ node, depth, isOpen, childCount: node.type === 'folder' ? countChildren(node) : 0 });
    if (isOpen && node.children) rows.push(...flattenTree(node.children, openPaths, depth + 1));
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
    estimateSize: () => 28,
    overscan: 15,
  });

  const toggleFolder = useCallback((path: string) => {
    setOpenPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  }, []);

  const langStats = useMemo(() => {
    const map = new Map<string, number>();
    files.forEach(f => {
      const ext = f.path.split('.').pop()?.toLowerCase() || 'other';
      map.set(ext, (map.get(ext) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [files]);

  if (files.length === 0) {
    return (
      <div className="p-6 text-center">
        <File className="w-8 h-8 mx-auto mb-2 text-[#45475a]" />
        <p className="text-[12px] text-[#6c7086]">No files loaded</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-[#cdd6f4]">
      {/* Search */}
      <div className="px-2 pt-2 pb-1.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#45475a]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter files..."
            className="h-7 pl-7 pr-7 text-[11px] bg-[#1e1e2e] border-[#313244]/50 text-[#cdd6f4] placeholder:text-[#45475a] rounded-md"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#45475a] hover:text-[#cdd6f4]">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Language distribution */}
      <div className="px-2 pb-1">
        <div className="flex h-[3px] rounded-full overflow-hidden bg-[#313244]/30">
          {langStats.map(([ext, count]) => (
            <div
              key={ext}
              className="h-full transition-all"
              style={{
                width: `${(count / files.length) * 100}%`,
                backgroundColor: fileIconColors[ext] || '#6c7086',
              }}
              title={`.${ext}: ${count} files`}
            />
          ))}
        </div>
      </div>

      {/* File count */}
      <div className="px-3 py-1 flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#45475a] uppercase tracking-wider">
          {filteredFiles.length}{searchQuery ? ` / ${files.length}` : ""} files
        </span>
        <Button
          variant="ghost" size="icon"
          onClick={() => setShowHidden(!showHidden)}
          className={cn("h-5 w-5 text-[#45475a] hover:text-[#cdd6f4] hover:bg-[#313244]", !showHidden && "text-primary")}
          title="Toggle hidden files"
        >
          <Eye className="w-2.5 h-2.5" />
        </Button>
      </div>

      {/* Virtualized Tree */}
      <div ref={parentRef} className="flex-1 overflow-y-auto px-1" style={{ minHeight: 0 }}>
        {filteredFiles.length === 0 ? (
          <div className="p-4 text-center text-[#45475a] text-[11px]">No files match "{searchQuery}"</div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
            {virtualizer.getVirtualItems().map(virtualRow => {
              const { node, depth, isOpen, childCount } = flatRows[virtualRow.index];
              const isSelected = selectedFile === node.path;

              return (
                <div
                  key={node.path}
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '100%',
                    height: virtualRow.size, transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <button
                    onClick={() => {
                      if (node.type === 'folder') toggleFolder(node.path);
                      else onFileSelect?.(node.path);
                    }}
                    className={cn(
                      "w-full flex items-center gap-1.5 h-[28px] px-2 text-[12px] rounded-md transition-all duration-100 text-left group relative",
                      isSelected && "bg-primary/15 text-[#cdd6f4]",
                      !isSelected && "text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/40"
                    )}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                  >
                    {/* Indent guides */}
                    {depth > 0 && Array.from({ length: depth }).map((_, d) => (
                      <div
                        key={d}
                        className="absolute top-0 bottom-0 w-px bg-[#313244]/25"
                        style={{ left: `${d * 12 + 14}px` }}
                      />
                    ))}

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r bg-primary" />
                    )}

                    {node.type === 'folder' ? (
                      <>
                        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.12 }}>
                          <ChevronRight className="w-3 h-3 flex-shrink-0 text-[#45475a]" />
                        </motion.div>
                        {isOpen
                          ? <FolderOpen className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          : <Folder className="w-3.5 h-3.5 text-[#6c7086] flex-shrink-0" />
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
                      <span className="text-[9px] text-[#45475a] ml-auto tabular-nums flex-shrink-0">
                        {childCount}
                      </span>
                    )}
                    {node.type === 'file' && node.lines && (
                      <span className="text-[9px] text-[#45475a] ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
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
