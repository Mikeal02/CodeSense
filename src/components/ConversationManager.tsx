import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, X, Pin, PinOff, Trash2, Tag, Plus,
  Search, Clock, ChevronRight, Edit2, Check
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Conversation } from "@/hooks/useConversations";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface ConversationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onClearAll: () => void;
  onNew: () => void;
}

const ConversationManager = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelect,
  onDelete,
  onTogglePin,
  onRename,
  onAddTag,
  onRemoveTag,
  onClearAll,
  onNew,
}: ConversationManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [tagInput, setTagInput] = useState<string | null>(null);
  const [tagValue, setTagValue] = useState("");

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.repoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditName(conv.name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleAddTag = (id: string) => {
    if (tagValue.trim()) {
      onAddTag(id, tagValue.trim());
      setTagValue("");
    }
    setTagInput(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[75vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Conversations</h3>
                <p className="text-xs text-muted-foreground">{conversations.length} saved</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onNew} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                New
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* List */}
          <ScrollArea className="flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filtered.map((conv, i) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn(
                      "group p-3 rounded-lg transition-colors cursor-pointer",
                      conv.id === activeId ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/50",
                      conv.pinned && "border-l-2 border-l-warning"
                    )}
                    onClick={() => {
                      onSelect(conv.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {editingId === conv.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-7 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(conv.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={(e) => { e.stopPropagation(); saveEdit(conv.id); }}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {conv.pinned && <Pin className="w-3 h-3 text-warning flex-shrink-0" />}
                            <span className="text-sm font-medium truncate">{conv.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{conv.repoName}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{conv.messages.length} messages</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground/60">
                            {formatDistanceToNow(conv.updatedAt, { addSuffix: true })}
                          </span>
                        </div>
                        {/* Tags */}
                        {conv.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {conv.tags.map(tag => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[10px] h-5 gap-1 cursor-pointer hover:bg-destructive/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveTag(conv.id, tag);
                                }}
                              >
                                {tag}
                                <X className="w-2.5 h-2.5" />
                              </Badge>
                            ))}
                          </div>
                        )}
                        {tagInput === conv.id && (
                          <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={tagValue}
                              onChange={(e) => setTagValue(e.target.value)}
                              placeholder="Add tag..."
                              className="h-6 text-xs w-32"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddTag(conv.id);
                                if (e.key === "Escape") setTagInput(null);
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); startEdit(conv); }}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); setTagInput(tagInput === conv.id ? null : conv.id); }}>
                          <Tag className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); onTogglePin(conv.id); }}>
                          {conv.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>

          {conversations.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <Button variant="ghost" size="sm" onClick={onClearAll}
                className="w-full text-xs text-muted-foreground hover:text-destructive gap-1">
                <Trash2 className="w-3.5 h-3.5" />
                Delete all conversations
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConversationManager;
