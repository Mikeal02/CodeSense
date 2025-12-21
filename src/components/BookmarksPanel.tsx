import { useState } from "react";
import { 
  Bookmark, BookmarkX, FileCode, Trash2, 
  Edit2, Check, X, ChevronRight, Tag
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { Bookmark as BookmarkType } from "@/hooks/useBookmarks";

interface BookmarksPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkType[];
  onRemoveBookmark: (id: string) => void;
  onUpdateBookmark: (id: string, updates: Partial<BookmarkType>) => void;
  onClearAll: () => void;
  onNavigate: (path: string, lineNumber?: number) => void;
}

const colorOptions: BookmarkType["color"][] = ["blue", "green", "yellow", "red", "purple"];

const colorClasses: Record<BookmarkType["color"], string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

const BookmarksPanel = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onUpdateBookmark,
  onClearAll,
  onNavigate,
}: BookmarksPanelProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const startEditing = (bookmark: BookmarkType) => {
    setEditingId(bookmark.id);
    setEditLabel(bookmark.label || "");
  };

  const saveEdit = (id: string) => {
    onUpdateBookmark(id, { label: editLabel.trim() || undefined });
    setEditingId(null);
    setEditLabel("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
  };

  const groupedBookmarks = bookmarks.reduce((acc, bookmark) => {
    if (!acc[bookmark.path]) {
      acc[bookmark.path] = [];
    }
    acc[bookmark.path].push(bookmark);
    return acc;
  }, {} as Record<string, BookmarkType[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Bookmarks</h3>
              <p className="text-xs text-muted-foreground">{bookmarks.length} saved locations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bookmarks.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearAll}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {bookmarks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <BookmarkX className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No bookmarks yet</p>
              <p className="text-sm mt-1">Click the bookmark icon on any file to save it here</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {Object.entries(groupedBookmarks).map(([path, fileBookmarks]) => (
                <div key={path}>
                  <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                    <FileCode className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground truncate">{path}</span>
                  </div>
                  
                  <div className="mt-1 space-y-1">
                    {fileBookmarks.map(bookmark => (
                      <div
                        key={bookmark.id}
                        className={cn(
                          "group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                          "hover:bg-secondary/50"
                        )}
                      >
                        {/* Color indicator */}
                        <div className="relative">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            colorClasses[bookmark.color]
                          )} />
                          
                          {/* Color picker dropdown */}
                          <div className="absolute left-0 top-full mt-1 hidden group-hover:flex bg-card border border-border rounded-lg p-1 gap-1 z-10 shadow-lg">
                            {colorOptions.map(color => (
                              <button
                                key={color}
                                onClick={() => onUpdateBookmark(bookmark.id, { color })}
                                className={cn(
                                  "w-4 h-4 rounded-full transition-transform hover:scale-125",
                                  colorClasses[color],
                                  bookmark.color === color && "ring-2 ring-white ring-offset-1 ring-offset-background"
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Label / Line number */}
                        <div className="flex-1 min-w-0">
                          {editingId === bookmark.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                placeholder="Add label..."
                                className="h-7 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit(bookmark.id);
                                  if (e.key === "Escape") cancelEdit();
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => saveEdit(bookmark.id)}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={cancelEdit}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onNavigate(bookmark.path, bookmark.lineNumber)}
                              className="flex items-center gap-2 text-left w-full"
                            >
                              {bookmark.label ? (
                                <span className="text-sm font-medium truncate">{bookmark.label}</span>
                              ) : bookmark.lineNumber ? (
                                <span className="text-sm text-muted-foreground">Line {bookmark.lineNumber}</span>
                              ) : (
                                <span className="text-sm text-muted-foreground italic">File bookmark</span>
                              )}
                              <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                            </button>
                          )}
                        </div>

                        {/* Actions */}
                        {editingId !== bookmark.id && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => startEditing(bookmark)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => onRemoveBookmark(bookmark.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            <span>Tip: Click the color dot to change bookmark colors</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarksPanel;
