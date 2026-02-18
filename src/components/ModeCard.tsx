import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03, y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "w-full p-3 sm:p-4 lg:p-5 rounded-xl text-left transition-all duration-300 group",
        "border border-border/50 hover:border-primary/50",
        "bg-secondary/30 hover:bg-secondary/50",
        isActive && "border-primary bg-primary/10 shadow-lg shadow-primary/10 gradient-border",
        disabled && "opacity-50 cursor-not-allowed hover:border-border/50 hover:bg-secondary/30"
      )}
    >
      <div className={cn(
        "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 transition-colors",
        isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground group-hover:text-foreground",
        disabled && "group-hover:text-muted-foreground"
      )}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <h3 className={cn(
        "font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 transition-colors leading-tight",
        isActive ? "text-primary" : "text-foreground"
      )}>
        {title}
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {description}
      </p>
    </motion.button>
  );
};

export default ModeCard;
