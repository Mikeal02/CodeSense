import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  /** Split by "word" or "char" */
  by?: "word" | "char";
}

/**
 * Reveals text word-by-word or character-by-character when scrolled into view.
 */
const TextReveal = ({ children, className, delay = 0, by = "word" }: TextRevealProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  const units = by === "word" ? children.split(" ") : children.split("");

  return (
    <span ref={ref} className={className} style={{ display: "inline" }}>
      {units.map((unit, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{
            delay: delay + i * (by === "word" ? 0.04 : 0.02),
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {unit}{by === "word" ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
};

export default TextReveal;
