import { toast } from "sonner";

interface UndoableOptions {
  message: string;
  description?: string;
  duration?: number;
  onUndo: () => void;
  onConfirm?: () => void;
}

/**
 * Show a toast with an undo button. Executes `onConfirm` after timeout unless undo is clicked.
 */
export function undoableToast({
  message,
  description,
  duration = 5000,
  onUndo,
  onConfirm,
}: UndoableOptions) {
  let undone = false;

  toast(message, {
    description,
    duration,
    action: {
      label: "Undo",
      onClick: () => {
        undone = true;
        onUndo();
        toast.success("Action undone");
      },
    },
    onDismiss: () => {
      if (!undone) onConfirm?.();
    },
    onAutoClose: () => {
      if (!undone) onConfirm?.();
    },
  });
}
