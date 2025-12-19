import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isActive?: boolean;
  onClick?: () => void;
}

const ModeCard = ({ icon: Icon, title, description, isActive, onClick }: ModeCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative p-6 rounded-xl text-left transition-all duration-300",
        "border border-border/50 hover:border-primary/50",
        "bg-card/50 hover:bg-card",
        isActive && "border-primary bg-card glow-primary"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors",
        "bg-secondary group-hover:bg-primary/20",
        isActive && "bg-primary/20"
      )}>
        <Icon className={cn(
          "w-6 h-6 transition-colors",
          "text-muted-foreground group-hover:text-primary",
          isActive && "text-primary"
        )} />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      
      {isActive && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full animate-pulse" />
      )}
    </button>
  );
};

export default ModeCard;
