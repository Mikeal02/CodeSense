import { useState, useEffect, useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  FileCode,
  FolderTree,
  Search,
  Bookmark,
  Download,
  Keyboard,
  Columns2,
  BarChart3,
  MessageSquare,
  Settings,
  Moon,
  Sun,
  History,
  Zap,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: { path: string; content: string }[];
  onSelectFile: (path: string) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  onOpenSplitView: () => void;
  onOpenStats: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
}

const CommandPalette = ({
  isOpen,
  onClose,
  files,
  onSelectFile,
  onOpenSearch,
  onOpenBookmarks,
  onOpenExport,
  onOpenShortcuts,
  onOpenSplitView,
  onOpenStats,
  onToggleTheme,
  isDarkMode,
}: CommandPaletteProps) => {
  const [search, setSearch] = useState("");

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const filteredFiles = useMemo(() => {
    if (!search) return files.slice(0, 10);
    const lower = search.toLowerCase();
    return files
      .filter(f => f.path.toLowerCase().includes(lower))
      .slice(0, 15);
  }, [files, search]);

  const handleSelect = (callback: () => void) => {
    callback();
    onClose();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput 
        placeholder="Search files or type a command..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Quick Actions */}
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => handleSelect(onOpenSearch)}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search in Files</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>⇧F
            </kbd>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(onOpenSplitView)}>
            <Columns2 className="mr-2 h-4 w-4" />
            <span>Open Split View</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>\
            </kbd>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(onOpenBookmarks)}>
            <Bookmark className="mr-2 h-4 w-4" />
            <span>View Bookmarks</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>B
            </kbd>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(onOpenStats)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>View Statistics</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(onOpenExport)}>
            <Download className="mr-2 h-4 w-4" />
            <span>Export Report</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>E
            </kbd>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Settings */}
        <CommandGroup heading="Settings">
          {onToggleTheme && (
            <CommandItem onSelect={() => handleSelect(onToggleTheme)}>
              {isDarkMode ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>{isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
            </CommandItem>
          )}
          <CommandItem onSelect={() => handleSelect(onOpenShortcuts)}>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard Shortcuts</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>/
            </kbd>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Files */}
        {filteredFiles.length > 0 && (
          <CommandGroup heading="Files">
            {filteredFiles.map((file) => (
              <CommandItem
                key={file.path}
                onSelect={() => handleSelect(() => onSelectFile(file.path))}
              >
                <FileCode className="mr-2 h-4 w-4" />
                <span className="truncate">{file.path}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
