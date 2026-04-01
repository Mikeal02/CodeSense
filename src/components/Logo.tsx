import { motion } from "framer-motion";
import logoImg from "@/assets/codesense-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

const sizeMap = {
  sm: { img: "w-6 h-6", text: "text-sm", version: "text-[8px]" },
  md: { img: "w-8 h-8 sm:w-9 sm:h-9", text: "text-sm sm:text-base", version: "text-[9px] sm:text-[10px]" },
  lg: { img: "w-12 h-12", text: "text-xl", version: "text-xs" },
  xl: { img: "w-16 h-16", text: "text-2xl", version: "text-sm" },
};

const Logo = ({ size = "md", showText = true, className = "", animated = true }: LogoProps) => {
  const sizes = sizeMap[size];

  return (
    <motion.div 
      className={`flex items-center gap-2.5 sm:gap-3 ${className}`}
      whileHover={animated ? { x: 2 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <motion.div
        className="relative"
        whileHover={animated ? { scale: 1.08, rotate: 3 } : undefined}
        whileTap={animated ? { scale: 0.92 } : undefined}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        <motion.img 
          src={logoImg} 
          alt="CodeSense Logo"
          className={`${sizes.img} drop-shadow-2xl`}
          style={{ filter: "drop-shadow(0 0 20px hsl(172 66% 50% / 0.3))" }}
        />
        {animated && (
          <motion.div
            className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>
      {showText && (
        <div>
          <h1 className={`${sizes.text} font-bold font-display text-foreground leading-none tracking-tight`}>
            CodeSense
          </h1>
          <p className={`${sizes.version} text-muted-foreground/50 hidden sm:block font-mono tracking-wider`}>
            v2.0.0
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default Logo;
