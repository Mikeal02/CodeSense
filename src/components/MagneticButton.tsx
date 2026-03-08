import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from "framer-motion";
import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Wraps any child element with a magnetic pull-toward-cursor effect on hover.
 */
const MagneticButton = ({ children, strength = 0.3, className, ...props }: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  }, [strength]);

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, []);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={cn("inline-flex", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MagneticButton;
