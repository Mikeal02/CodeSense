import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, SkipForward } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/hooks/useOnboarding";

interface OnboardingOverlayProps {
  isActive: boolean;
  step: OnboardingStep | null;
  currentStep: number;
  totalSteps: number;
  progress: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const OnboardingOverlay = ({
  isActive,
  step,
  currentStep,
  totalSteps,
  progress,
  onNext,
  onPrev,
  onSkip,
}: OnboardingOverlayProps) => {
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !step) return;

    const updatePosition = () => {
      const el = document.querySelector(step.target);
      if (!el) {
        // If target not found, center the tooltip
        setSpotlightRect(null);
        setTooltipPos({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 180,
        });
        return;
      }

      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);

      const tooltipW = 360;
      const tooltipH = 220;
      const pad = 16;
      let top = 0;
      let left = 0;

      switch (step.placement) {
        case "bottom":
          top = rect.bottom + pad;
          left = rect.left + rect.width / 2 - tooltipW / 2;
          break;
        case "top":
          top = rect.top - tooltipH - pad;
          left = rect.left + rect.width / 2 - tooltipW / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipH / 2;
          left = rect.left - tooltipW - pad;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipH / 2;
          left = rect.right + pad;
          break;
      }

      // Keep within viewport
      left = Math.max(12, Math.min(left, window.innerWidth - tooltipW - 12));
      top = Math.max(12, Math.min(top, window.innerHeight - tooltipH - 12));

      setTooltipPos({ top, left });
    };

    updatePosition();
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isActive, step, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
      if (e.key === "ArrowRight" || e.key === "Enter") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, onNext, onPrev, onSkip]);

  if (!isActive || !step) return null;

  const spotPad = 8;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-auto">
        {/* Darkened overlay with spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {spotlightRect && (
                <rect
                  x={spotlightRect.left - spotPad}
                  y={spotlightRect.top - spotPad}
                  width={spotlightRect.width + spotPad * 2}
                  height={spotlightRect.height + spotPad * 2}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="hsl(220 20% 4% / 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Spotlight ring */}
        {spotlightRect && (
          <motion.div
            key={`ring-${currentStep}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute border-2 border-primary/60 rounded-xl pointer-events-none"
            style={{
              top: spotlightRect.top - spotPad,
              left: spotlightRect.left - spotPad,
              width: spotlightRect.width + spotPad * 2,
              height: spotlightRect.height + spotPad * 2,
              boxShadow: "0 0 0 4px hsl(var(--primary) / 0.15), 0 0 30px hsl(var(--primary) / 0.2)",
            }}
          />
        )}

        {/* Pulsing glow on spotlight */}
        {spotlightRect && (
          <motion.div
            key={`pulse-${currentStep}`}
            className="absolute rounded-xl pointer-events-none"
            style={{
              top: spotlightRect.top - spotPad - 4,
              left: spotlightRect.left - spotPad - 4,
              width: spotlightRect.width + spotPad * 2 + 8,
              height: spotlightRect.height + spotPad * 2 + 8,
            }}
            animate={{
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0.3)",
                "0 0 0 8px hsl(var(--primary) / 0)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Click-to-dismiss backdrop (except on spotlight area) */}
        <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

        {/* Tooltip */}
        <motion.div
          ref={tooltipRef}
          key={`tooltip-${currentStep}`}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute z-10 w-[360px]"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          <div className="rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-secondary">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="p-5">
              {/* Step counter */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">
                    Step {currentStep + 1} of {totalSteps}
                  </span>
                </div>
                <button
                  onClick={onSkip}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {step.description}
              </p>

              {/* Step dots */}
              <div className="flex items-center gap-1.5 mb-4">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentStep
                        ? "w-6 bg-primary"
                        : i < currentStep
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-muted"
                    )}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <Button variant="ghost" size="sm" onClick={onPrev} className="gap-1 text-xs">
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={onSkip} className="gap-1 text-xs text-muted-foreground">
                    <SkipForward className="w-3.5 h-3.5" />
                    Skip tour
                  </Button>
                  <Button size="sm" onClick={onNext} className="gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                    {currentStep === totalSteps - 1 ? "Finish" : "Next"}
                    {currentStep < totalSteps - 1 && <ChevronRight className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingOverlay;
