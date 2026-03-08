import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springX = useSpring(mouseX, { damping: 20, stiffness: 300 });
  const springY = useSpring(mouseY, { damping: 20, stiffness: 300 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, input, textarea, select, [role='button'], [data-cursor='pointer']");
      setIsHovering(!!interactive);
    };

    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden lg:block"
      style={{ x: springX, y: springY }}
      aria-hidden="true"
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute rounded-full border-2 border-primary/60"
        animate={{
          width: isClicking ? 16 : isHovering ? 48 : 24,
          height: isClicking ? 16 : isHovering ? 48 : 24,
          x: isClicking ? -8 : isHovering ? -24 : -12,
          y: isClicking ? -8 : isHovering ? -24 : -12,
          opacity: isHovering ? 0.8 : 0.4,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
      {/* Inner dot */}
      <motion.div
        className="absolute rounded-full bg-primary"
        animate={{
          width: isClicking ? 6 : 8,
          height: isClicking ? 6 : 8,
          x: isClicking ? -3 : -4,
          y: isClicking ? -3 : -4,
          opacity: 0.9,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
    </motion.div>
  );
};

export default CustomCursor;
