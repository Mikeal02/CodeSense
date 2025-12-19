import { 
  Eye, 
  Map, 
  PlayCircle, 
  GraduationCap, 
  MessageSquare, 
  Briefcase, 
  Brain, 
  AlertTriangle, 
  GitBranch, 
  FileText,
  Lock,
  Link2
} from "lucide-react";
import ModeCard from "./ModeCard";

interface ModesSectionProps {
  activeMode: string;
  onSelectMode: (mode: string) => void;
  isConnected: boolean;
}

const modes = [
  {
    id: "overview",
    icon: Eye,
    title: "Project Overview",
    description: "Get a bird's-eye view of what the project does, its tech stack, and main responsibilities."
  },
  {
    id: "map",
    icon: Map,
    title: "Project Map",
    description: "Explore folder structure, critical files, and how different parts connect together."
  },
  {
    id: "flow",
    icon: PlayCircle,
    title: "Execution Flow",
    description: "Trace what happens step-by-step when code runs or users interact."
  },
  {
    id: "teach",
    icon: GraduationCap,
    title: "Teach-Me Mode",
    description: "Learn as if you built it yourself, with interview-ready explanations."
  },
  {
    id: "ask",
    icon: MessageSquare,
    title: "Ask Anything",
    description: "Get answers to any question about your codebase, grounded in actual code."
  },
  {
    id: "interview",
    icon: Briefcase,
    title: "Interview Prep",
    description: "Generate project-specific questions and strong sample answers."
  },
  {
    id: "forgot",
    icon: Brain,
    title: "Forgot Everything",
    description: "Quick refresher on purpose, architecture, and key decisions."
  },
  {
    id: "complexity",
    icon: AlertTriangle,
    title: "Complexity Detection",
    description: "Identify risky areas, tight coupling, and files doing too much."
  },
  {
    id: "impact",
    icon: GitBranch,
    title: "Change Impact",
    description: "Predict what breaks when you modify a file and what to test."
  },
  {
    id: "resume",
    icon: FileText,
    title: "Resume Summary",
    description: "Generate resume bullets and tech stack summaries for your portfolio."
  },
  {
    id: "coupling",
    icon: Link2,
    title: "Coupling Analysis",
    description: "Identify tightly and loosely coupled files to understand dependencies."
  }
];

const ModesSection = ({ activeMode, onSelectMode, isConnected }: ModesSectionProps) => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Mode</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isConnected 
              ? "Select a mode to analyze your codebase with AI"
              : "Connect a repository first, then select how you want to explore it"
            }
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {modes.map((mode) => (
            <div key={mode.id} className="relative">
              {!isConnected && (
                <div className="absolute top-2 right-2 z-10">
                  <Lock className="w-4 h-4 text-muted-foreground/50" />
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
        </div>
      </div>
    </section>
  );
};

export default ModesSection;
