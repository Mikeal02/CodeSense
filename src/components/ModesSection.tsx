import { motion } from "framer-motion";
import { 
  Eye, Map, PlayCircle, GraduationCap, MessageSquare, 
  Briefcase, Brain, AlertTriangle, GitBranch, FileText, Lock, Link2, Sparkles
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" },
  visible: { 
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } 
  }
};

const ModesSection = ({ activeMode, onSelectMode, isConnected }: ModesSectionProps) => {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section ref={sectionRef} className="py-14 sm:py-20 lg:py-24 relative" data-onboarding="modes-section">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/[0.03] to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 sm:mb-14"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 bg-secondary/20 backdrop-blur-sm mb-5 text-xs text-muted-foreground"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Analysis Modes
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 tracking-tight">Choose Your Mode</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            {isConnected 
              ? "Select a mode to analyze your codebase with AI"
              : "Connect a repository first, then select how you want to explore it"
            }
          </p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-3.5"
        >
          {modes.map((mode) => (
            <motion.div key={mode.id} variants={itemVariants} className="relative">
              {!isConnected && (
                <div className="absolute top-2 right-2 z-10">
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/40" />
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ModesSection;
