import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
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
  const cardRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHovered(false);
  };

  return (
    <motion.button
      ref={cardRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      style={{ rotateX: disabled ? 0 : rotateX, rotateY: disabled ? 0 : rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      className={cn(
        "w-full p-3 sm:p-4 lg:p-5 rounded-xl text-left transition-all duration-300 group relative overflow-hidden",
        "border hover:border-primary/60",
        "bg-secondary/30 hover:bg-secondary/50",
        isActive
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/15"
          : "border-border/50",
        disabled && "opacity-40 cursor-not-allowed hover:border-border/50 hover:bg-secondary/30"
      )}
    >
      {/* Shimmer sweep on hover */}
      {hovered && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "200%", opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.08), transparent)",
          }}
        />
      )}

      {/* Active gradient border glow */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.08))",
          }}
        />
      )}

      {/* Active indicator dot */}
      {isActive && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
      )}

      <div
        className={cn(
          "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 transition-all duration-300",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
            : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
          disabled && "group-hover:text-muted-foreground group-hover:bg-secondary"
        )}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      <h3
        className={cn(
          "font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 transition-colors leading-tight",
          isActive ? "text-primary" : "text-foreground group-hover:text-primary/90"
        )}
      >
        {title}
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {description}
      </p>
    </motion.button>
  );
};

export default ModeCard;
