import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShimmerSkeleton from "./ui/shimmer-skeleton";

const CinematicLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"logo" | "skeleton" | "exit">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("skeleton"), 1400);
    const t2 = setTimeout(() => setPhase("exit"), 2600);
    const t3 = setTimeout(onComplete, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? null : null}
      <motion.div
        className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background"
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        key="loader"
      >
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, hsl(var(--accent) / 0.04) 40%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Logo morph phase */}
        <AnimatePresence mode="wait">
          {phase === "logo" && (
            <motion.div
              key="logo-phase"
              className="relative flex flex-col items-center gap-6"
              exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
              transition={{ duration: 0.4 }}
            >
              {/* Morphing logo mark */}
              <motion.div className="relative">
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
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
                >
                  <motion.svg
                    viewBox="0 0 24 24"
                    className="w-10 h-10 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
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

                {/* Pulse rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-2xl border border-primary/30"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                    transition={{
                      duration: 1.5,
                      delay: 0.6 + i * 0.3,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </motion.div>

              {/* Text reveal */}
              <motion.div className="flex items-center gap-0.5 overflow-hidden">
                {"CodeSense".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl font-bold font-display text-foreground"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.3 + i * 0.05,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>

              {/* Tagline */}
              <motion.p
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                Initializing codebase intelligence…
              </motion.p>
            </motion.div>
          )}

          {phase === "skeleton" && (
            <motion.div
              key="skeleton-phase"
              className="w-full max-w-4xl px-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
              transition={{ duration: 0.4 }}
            >
              {/* Fake header skeleton */}
              <motion.div
                className="flex items-center justify-between mb-8 px-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <ShimmerSkeleton variant="circle" width={32} height={32} className="rounded-lg" />
                  <ShimmerSkeleton height={16} width={120} />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                    >
                      <ShimmerSkeleton variant="circle" width={28} height={28} className="rounded-md" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Fake hero skeleton */}
              <motion.div
                className="text-center space-y-4 mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <ShimmerSkeleton height={12} width={160} className="mx-auto rounded-full" />
                <ShimmerSkeleton height={40} width="70%" className="mx-auto rounded-lg" />
                <ShimmerSkeleton height={28} width="50%" className="mx-auto rounded-lg" />
                <ShimmerSkeleton height={14} width="40%" className="mx-auto" />
              </motion.div>

              {/* Fake cards skeleton */}
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.1 }}
                  >
                    <ShimmerSkeleton variant="card" />
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <motion.div className="mt-8 mx-auto max-w-xs">
                <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-info"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default CinematicLoader;
