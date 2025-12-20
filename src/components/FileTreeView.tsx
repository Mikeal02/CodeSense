import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, FileJson, FileText, File, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
}

interface FileTreeViewProps {
  files: { path: string; content: string }[];
  onFileSelect?: (path: string) => void;
  selectedFile?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'py':
    case 'java':
    case 'go':
    case 'rs':
      return <FileCode className="w-4 h-4 text-primary" />;
    case 'json':
    case 'yaml':
    case 'yml':
    case 'toml':
      return <FileJson className="w-4 h-4 text-accent" />;
    case 'md':
    case 'txt':
    case 'html':
      return <FileText className="w-4 h-4 text-muted-foreground" />;
    default:
      return <File className="w-4 h-4 text-muted-foreground" />;
  }
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
        };
        current.push(node);
      }
      
      if (!isFile && node.children) {
        current = node.children;
      }
    });
  });
  
  // Sort: folders first, then files alphabetically
  const sortNodes = (nodes: FileNode[]): FileNode[] => {
    return nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    }).map(node => ({
      ...node,
      children: node.children ? sortNodes(node.children) : undefined,
    }));
  };
  
  return sortNodes(root);
};

const TreeNode = ({ 
  node, 
  depth = 0, 
  onFileSelect, 
  selectedFile 
}: { 
  node: FileNode; 
  depth?: number;
  onFileSelect?: (path: string) => void;
  selectedFile?: string;
}) => {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isSelected = selectedFile === node.path;
  
  const handleClick = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onFileSelect?.(node.path);
    }
  };
  
  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-1.5 py-1 px-2 text-sm rounded hover:bg-secondary/50 transition-colors text-left",
          isSelected && "bg-primary/20 text-primary",
          !isSelected && "text-muted-foreground hover:text-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.type === 'folder' ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-primary flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>
      
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTreeView = ({ files, onFileSelect, selectedFile }: FileTreeViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const query = searchQuery.toLowerCase();
    return files.filter(f => 
      f.path.toLowerCase().includes(query) || 
      f.content.toLowerCase().includes(query)
    );
  }, [files, searchQuery]);
  
  const tree = buildTree(filteredFiles);
  
  if (files.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No files loaded
      </div>
    );
  }
  
  return (
    <div className="py-2 flex flex-col h-full">
      {/* Search Input */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="h-8 pl-8 pr-8 text-xs bg-secondary/50 border-border/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Files ({filteredFiles.length}{searchQuery ? ` / ${files.length}` : ""})
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No files match "{searchQuery}"
          </div>
        ) : (
          tree.map(node => (
            <TreeNode
              key={node.path}
              node={node}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FileTreeView;
