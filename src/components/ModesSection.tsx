import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Eye, Map, PlayCircle, GraduationCap, MessageSquare, 
  Briefcase, Brain, AlertTriangle, GitBranch, FileText, Lock, Link2
} from "lucide-react";
import ModeCard from "./ModeCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ModesSectionProps {
  activeMode: string;
  onSelectMode: (mode: string) => void;
  isConnected: boolean;
}

const modes = [
  { id: "overview", icon: Eye, title: "Project Overview", description: "Get a bird's-eye view of what the project does, its tech stack, and main responsibilities.", hotkey: "1" },
  { id: "map", icon: Map, title: "Project Map", description: "Explore folder structure, critical files, and how different parts connect together.", hotkey: "2" },
  { id: "flow", icon: PlayCircle, title: "Execution Flow", description: "Trace what happens step-by-step when code runs or users interact.", hotkey: "3" },
  { id: "teach", icon: GraduationCap, title: "Teach-Me Mode", description: "Learn as if you built it yourself, with interview-ready explanations.", hotkey: "4" },
  { id: "ask", icon: MessageSquare, title: "Ask Anything", description: "Get answers to any question about your codebase, grounded in actual code.", hotkey: "5" },
  { id: "interview", icon: Briefcase, title: "Interview Prep", description: "Generate project-specific questions and strong sample answers.", hotkey: "6" },
  { id: "forgot", icon: Brain, title: "Forgot Everything", description: "Quick refresher on purpose, architecture, and key decisions.", hotkey: "7" },
  { id: "complexity", icon: AlertTriangle, title: "Complexity Detection", description: "Identify risky areas, tight coupling, and files doing too much.", hotkey: "8" },
  { id: "impact", icon: GitBranch, title: "Change Impact", description: "Predict what breaks when you modify a file and what to test.", hotkey: "9" },
  { id: "resume", icon: FileText, title: "Resume Summary", description: "Generate resume bullets and tech stack summaries for your portfolio.", hotkey: "0" },
  { id: "coupling", icon: Link2, title: "Coupling Analysis", description: "Identify tightly and loosely coupled files to understand dependencies.", hotkey: "" },
];

const ModesSection = ({ activeMode, onSelectMode, isConnected }: ModesSectionProps) => {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isConnected) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const mode = modes.find(m => m.hotkey === e.key);
    if (mode) onSelectMode(mode.id);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConnected]);

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 relative" data-onboarding="modes-section">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-4">Analysis Modes</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 tracking-tight">Choose Your Mode</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isConnected
              ? "Select a mode to analyze your codebase with AI — or press a number key"
              : "Connect a repository first, then select how you want to explore it"
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3"
        >
          {modes.map((mode) => (
            <div key={mode.id} className="relative">
              {!isConnected && (
                <div className="absolute top-2 right-2 z-10">
                  <Lock className="w-3 h-3 text-muted-foreground/40" />
                </div>
              )}
              {isConnected && mode.hotkey && (
                <div className="absolute top-2 left-2 z-10">
                  <kbd className="text-[8px] px-1 py-0.5 rounded bg-secondary border border-border font-mono text-muted-foreground/40">
                    {mode.hotkey}
                  </kbd>
                </div>
              )}
              <ModeCard
                icon={mode.icon}
                title={mode.title}
                description={mode.description}
                isActive={activeMode === mode.id}
                onClick={() => onSelectMode(mode.id)}
                disabled={!isConnected}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ModesSection;
