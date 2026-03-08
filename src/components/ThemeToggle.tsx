import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: "sm" | "md";
  className?: string;
}

const ThemeToggle = ({ isDarkMode, onToggle, size = "sm", className }: ThemeToggleProps) => {
  const dim = size === "md" ? "w-14 h-7" : "w-11 h-6";
  const dot = size === "md" ? "w-5 h-5" : "w-4 h-4";
  const translate = size === "md" ? 26 : 20;

  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative rounded-full p-[3px] transition-colors duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDarkMode
          ? "bg-gradient-to-r from-[hsl(var(--primary)/0.4)] to-[hsl(var(--accent)/0.4)]"
          : "bg-gradient-to-r from-[hsl(38,92%,60%)] to-[hsl(38,92%,50%)]",
        dim,
        className
      )}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {/* Track background */}
      <div className={cn(
        "absolute inset-[1px] rounded-full transition-colors duration-500",
        isDarkMode ? "bg-secondary" : "bg-[hsl(45,100%,96%)]"
      )} />

      {/* Sliding dot with icon morph */}
      <motion.div
        className={cn(
          "relative rounded-full flex items-center justify-center",
          dot,
          isDarkMode
            ? "bg-gradient-to-br from-primary to-accent shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
            : "bg-gradient-to-br from-[hsl(38,92%,55%)] to-[hsl(38,92%,45%)] shadow-[0_0_8px_hsl(38,92%,50%/0.5)]"
        )}
        animate={{ x: isDarkMode ? 0 : translate }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDarkMode ? (
            <motion.svg
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25 }}
              className="w-2.5 h-2.5 text-primary-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25 }}
              className="w-2.5 h-2.5 text-[hsl(45,100%,96%)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stars (dark mode only) */}
      <AnimatePresence>
        {isDarkMode && (
          <>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.7, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-1 right-2 w-0.5 h-0.5 rounded-full bg-foreground/60"
            />
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.5, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute bottom-1.5 right-3 w-[3px] h-[3px] rounded-full bg-foreground/40"
            />
          </>
        )}
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
