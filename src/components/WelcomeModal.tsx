import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Brain, GitBranch, MessageSquare, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";


interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectRepo?: () => void;
}

const steps = [
  {
    icon: Sparkles,
    title: "Welcome to CodeSense",
    description: "Your AI-powered codebase intelligence platform. Understand any project, prepare for interviews, and map complex architectures — all in seconds.",
    visual: "logo",
  },
  {
    icon: Brain,
    title: "11 Analysis Modes",
    description: "From Project Overview to Interview Prep, Execution Flow, Dependency Graphs, and more — each mode gives you a different lens into your codebase.",
    visual: "modes",
  },
  {
    icon: MessageSquare,
    title: "Start Analyzing",
    description: "Paste a GitHub URL, upload a folder, or try our demo project. Ask anything about your code with AI-powered chat.",
    visual: "cta",
  },
];

const modesList = [
  { name: "Overview", color: "primary" },
  { name: "Execution Flow", color: "info" },
  { name: "Interview Prep", color: "warning" },
  { name: "Teach Me", color: "accent" },
  { name: "Architecture", color: "success" },
];

const StepVisual = ({ visual, step }: { visual: string; step: number }) => {
  if (visual === "logo") {
    return (
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <motion.img
  src="/favicon.png"
  alt="CodeSense Logo"
  className="w-24 h-24 object-contain"
  initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
  animate={{ scale: 1, opacity: 1, rotate: 0 }}
  transition={{
    delay: 0.2,
    type: "spring",
    stiffness: 200,
  }}
/>
        <motion.div
          className="flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-8 rounded-full bg-primary/30"
              animate={{ height: [8, 20, 8], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </motion.div>
    );
  }

  if (visual === "modes") {
    return (
      <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
        {modesList.map((mode, i) => (
          <motion.div
            key={mode.name}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 300 }}
            className="px-3 py-1.5 rounded-lg border border-border/30 bg-secondary/30 text-xs font-medium text-muted-foreground"
          >
            <span className={`text-${mode.color} mr-1`}>●</span>
            {mode.name}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <GitBranch className="w-6 h-6 text-primary" />
        </motion.div>
        <motion.div
          className="flex gap-1"
          initial={{ width: 0 }}
          animate={{ width: "auto" }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.8, repeat: Infinity }}
            />
          ))}
        </motion.div>
        <motion.div
          className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
        >
          <Brain className="w-6 h-6 text-accent" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const WelcomeModal = ({ isOpen, onClose, onConnectRepo }: WelcomeModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      onConnectRepo?.();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md rounded-3xl border border-border/30 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Top gradient */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="relative px-8 pt-10 pb-8">
              {/* Step dots */}
              <div className="flex justify-center gap-2 mb-8">
                {steps.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? "w-6 bg-primary" : i < currentStep ? "w-1.5 bg-primary/50" : "w-1.5 bg-border/50"
                    }`}
                    layoutId={`dot-${i}`}
                  />
                ))}
              </div>

              {/* Visual */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8 flex justify-center min-h-[80px]"
                >
                  <StepVisual visual={step.visual} step={currentStep} />
                </motion.div>
              </AnimatePresence>

              {/* Text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center gap-2 mb-3">
                    <step.icon className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Step {currentStep + 1} of {steps.length}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2 tracking-tight">{step.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="flex-1 rounded-xl"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="flex-1 rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLast ? "Get Started" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Skip */}
              {!isLast && (
                <button
                  onClick={onClose}
                  className="w-full mt-3 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Skip tour
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
