import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShimmerSkeleton from "./ui/shimmer-skeleton";

const CinematicLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"logo" | "skeleton" | "done">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("skeleton"), 1400);
    const t2 = setTimeout(() => setPhase("done"), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Call onComplete after exit animation finishes
  useEffect(() => {
    if (phase === "done") {
      const t = setTimeout(onComplete, 650);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(12px)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          key="loader"
        >
          {/* Ambient background orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, hsl(var(--accent) / 0.04) 40%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(var(--accent) / 0.06) 0%, transparent 60%)",
              }}
              animate={{ scale: [1.1, 0.9, 1.1], x: [0, 30, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Noise texture */}
          <div className="absolute inset-0 noise-overlay pointer-events-none" />

          <AnimatePresence mode="wait">
            {phase === "logo" && (
              <motion.div
                key="logo-phase"
                className="relative flex flex-col items-center gap-6"
                exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
                transition={{ duration: 0.35 }}
              >
                {/* Morphing logo mark */}
                <motion.div className="relative">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl"
                    initial={{ scale: 0, rotate: -180, borderRadius: "50%" }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                      borderRadius: ["50%", "30%", "25%"],
                    }}
                    transition={{
                      scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                      rotate: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                      borderRadius: { duration: 1, delay: 0.3 },
                    }}
                    style={{
                      boxShadow: "0 0 60px hsl(var(--primary) / 0.3), 0 0 120px hsl(var(--accent) / 0.15)",
                    }}
                  >
                    <motion.svg
                      viewBox="0 0 24 24"
                      className="w-10 h-10 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <motion.polyline
                        points="16 18 22 12 16 6"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      />
                      <motion.polyline
                        points="8 6 2 12 8 18"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      />
                    </motion.svg>
                  </motion.div>

                  {/* Expanding rings */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-2xl border border-primary/20"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: [1, 2.8], opacity: [0.4, 0] }}
                      transition={{ duration: 1.8, delay: 0.5 + i * 0.25, ease: "easeOut" }}
                    />
                  ))}
                </motion.div>

                {/* Per-character text reveal */}
                <motion.div className="flex items-center gap-[1px] overflow-hidden">
                  {"CodeSense".split("").map((char, i) => (
                    <motion.span
                      key={i}
                      className="text-3xl font-extrabold font-display text-foreground tracking-tight"
                      initial={{ y: 50, opacity: 0, filter: "blur(6px)" }}
                      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                      transition={{
                        delay: 0.3 + i * 0.045,
                        duration: 0.45,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.div>

                {/* Tagline with typing dots */}
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-accent"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-info"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
                  />
                  <span className="text-sm text-muted-foreground ml-1">Initializing codebase intelligence</span>
                </motion.div>
              </motion.div>
            )}

            {phase === "skeleton" && (
              <motion.div
                key="skeleton-phase"
                className="w-full max-w-5xl px-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header skeleton */}
                <motion.div
                  className="flex items-center justify-between mb-8"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <ShimmerSkeleton variant="circle" width={36} height={36} className="rounded-xl" />
                    <div className="space-y-1.5">
                      <ShimmerSkeleton height={14} width={100} />
                      <ShimmerSkeleton height={8} width={50} className="opacity-50" />
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.08 + i * 0.06 }}
                      >
                        <ShimmerSkeleton variant="circle" width={32} height={32} className="rounded-lg" />
                      </motion.div>
                    ))}
                    <div className="w-px h-6 bg-border/30 mx-1" />
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                      <ShimmerSkeleton height={32} width={80} className="rounded-lg" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Hero skeleton */}
                <motion.div
                  className="text-center space-y-5 mb-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <ShimmerSkeleton height={10} width={180} className="mx-auto rounded-full" />
                  <ShimmerSkeleton height={48} width="65%" className="mx-auto rounded-xl" />
                  <ShimmerSkeleton height={32} width="45%" className="mx-auto rounded-xl" />
                  <ShimmerSkeleton height={14} width="35%" className="mx-auto" />
                  <div className="flex gap-3 justify-center mt-2">
                    <ShimmerSkeleton height={40} width={130} className="rounded-xl" />
                    <ShimmerSkeleton height={40} width={130} className="rounded-xl" />
                  </div>
                </motion.div>

                {/* Mode cards skeleton - staggered grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 24, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="rounded-xl border border-border/20 bg-card/20 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <ShimmerSkeleton variant="circle" width={24} height={24} className="rounded-md" />
                          <ShimmerSkeleton height={12} width={80} />
                        </div>
                        <ShimmerSkeleton height={10} width="90%" />
                        <ShimmerSkeleton height={10} width="60%" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Progress bar */}
                <motion.div className="mt-10 mx-auto max-w-xs">
                  <div className="h-[3px] rounded-full bg-muted/20 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--info)))",
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                  <motion.p
                    className="text-[10px] text-muted-foreground/50 text-center mt-2 font-mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Loading interface…
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CinematicLoader;
