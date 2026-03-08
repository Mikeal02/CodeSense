import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CursorGlow = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springX = useSpring(mouseX, { damping: 25, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 200 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[9998] hidden lg:block"
      aria-hidden="true"
    >
      <motion.div
        className="absolute w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          x: springX,
          y: springY,
          background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, hsl(var(--accent) / 0.04) 35%, transparent 65%)",
          filter: "blur(2px)",
        }}
      />
    </motion.div>
  );
};

export default CursorGlow;
