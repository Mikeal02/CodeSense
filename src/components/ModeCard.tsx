import { LucideIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const ModeCard = ({ icon: Icon, title, description, isActive, onClick, disabled }: ModeCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full p-3 sm:p-4 rounded-xl text-left transition-all duration-200 group relative",
        "border",
        isActive
          ? "border-primary/40 bg-primary/[0.06]"
          : "border-border/40 bg-card/40 hover:border-border hover:bg-card/60",
        disabled && "opacity-35 cursor-not-allowed hover:border-border/40 hover:bg-card/40"
      )}
    >
      {/* Active check */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10"
          >
            <Check className="w-3 h-3 text-primary-foreground" />
          </motion.span>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2 sm:mb-3 transition-colors",
          isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground group-hover:text-foreground",
          disabled && "group-hover:text-muted-foreground"
        )}
      >
        <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
      </div>

      <h3
        className={cn(
          "font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 transition-colors leading-tight",
          isActive ? "text-primary" : "text-foreground"
        )}
      >
        {title}
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Bottom accent */}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
          layoutId="mode-active-bar"
        />
      )}
    </button>
  );
};

export default ModeCard;
