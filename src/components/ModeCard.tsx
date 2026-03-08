import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { LucideIcon, Check } from "lucide-react";
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
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 350, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 350, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.button
      ref={cardRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { x.set(0); y.set(0); setHovered(false); }}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      style={{ rotateX: disabled ? 0 : rotateX, rotateY: disabled ? 0 : rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      className={cn(
        "w-full p-3 sm:p-4 rounded-xl text-left transition-all duration-300 group relative overflow-hidden",
        "border",
        isActive
          ? "border-primary/40 bg-primary/[0.06] shadow-lg shadow-primary/10"
          : "border-border/30 bg-card/30 hover:border-primary/25 hover:bg-card/50",
        disabled && "opacity-35 cursor-not-allowed hover:border-border/30 hover:bg-card/30"
      )}
    >
      {/* Animated shimmer sweep */}
      <AnimatePresence>
        {hovered && !disabled && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "200%", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.07), transparent)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Glow background on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          opacity: hovered && !disabled ? 1 : isActive ? 0.8 : 0,
          background: isActive
            ? "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--accent) / 0.04))"
            : "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.06), transparent 70%)",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Active indicator with spring animation */}
      <AnimatePresence>
        {isActive && (
          <motion.span 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 z-10"
          >
            <Check className="w-3 h-3 text-primary-foreground" />
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          scale: hovered && !disabled ? 1.05 : 1,
          backgroundColor: isActive ? "hsl(var(--primary))" : hovered && !disabled ? "hsl(var(--primary) / 0.12)" : "hsl(var(--secondary) / 0.5)",
        }}
        transition={{ duration: 0.25 }}
        className={cn(
          "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2 sm:mb-3 relative z-10",
          isActive ? "text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground",
          disabled && "group-hover:text-muted-foreground"
        )}
      >
        <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
      </motion.div>

      <h3
        className={cn(
          "font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 transition-colors leading-tight relative z-10",
          isActive ? "text-primary" : "text-foreground group-hover:text-primary/90"
        )}
      >
        {title}
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 relative z-10">
        {description}
      </p>

      {/* Bottom accent line on active */}
      <motion.div
        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
        initial={false}
        animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 0.6 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.button>
  );
};

export default ModeCard;
