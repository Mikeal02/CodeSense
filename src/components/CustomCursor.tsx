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
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden lg:block mix-blend-difference"
      style={{ x: springX, y: springY }}
      aria-hidden="true"
    >
      <motion.div
        className="rounded-full bg-foreground"
        animate={{
          width: isClicking ? 12 : isHovering ? 40 : 8,
          height: isClicking ? 12 : isHovering ? 40 : 8,
          x: isClicking ? -6 : isHovering ? -20 : -4,
          y: isClicking ? -6 : isHovering ? -20 : -4,
          opacity: isHovering ? 0.5 : 0.8,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
    </motion.div>
  );
};

export default CustomCursor;
