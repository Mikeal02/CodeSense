import { Keyboard, X } from "lucide-react";
import { Button } from "./ui/button";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: "Navigation", items: [
    { keys: ["Ctrl", "K"], description: "Command palette" },
    { keys: ["Ctrl", "Shift", "F"], description: "Search in files" },
    { keys: ["Ctrl", "B"], description: "Toggle bookmarks" },
    { keys: ["Ctrl", "\\"], description: "Toggle split view" },
  ]},
  { category: "Editor", items: [
    { keys: ["Ctrl", "E"], description: "Export report" },
    { keys: ["Ctrl", "Tab"], description: "Switch tabs (split view)" },
    { keys: ["Ctrl", "W"], description: "Close tab (split view)" },
  ]},
  { category: "View", items: [
    { keys: ["Ctrl", "J"], description: "Toggle chat (split view)" },
    { keys: ["F11"], description: "Toggle fullscreen" },
  ]},
  { category: "General", items: [
    { keys: ["Esc"], description: "Close modal / Exit mode" },
    { keys: ["Ctrl", "/"], description: "Show shortcuts" },
  ]},
];

const KeyboardShortcutsModal = ({ isOpen, onClose }: KeyboardShortcutsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Keyboard Shortcuts</h3>
              <p className="text-xs text-muted-foreground">Speed up your workflow</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {shortcuts.map(category => (
            <div key={category.category}>
              <h4 className="text-sm font-semibold text-primary mb-3">{category.category}</h4>
              <div className="space-y-2">
                {category.items.map(item => (
                  <div 
                    key={item.description}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono text-foreground">
                            {key}
                          </kbd>
                          {i < item.keys.length - 1 && (
                            <span className="text-muted-foreground mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
