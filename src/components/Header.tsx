import { Code2, Github, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onConnectRepo: () => void;
}

const Header = ({ onConnectRepo }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">CodeSense</h1>
            <p className="text-xs text-muted-foreground">AI Codebase Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onConnectRepo}
            className="hidden sm:flex gap-2"
          >
            <Github className="w-4 h-4" />
            Connect Repo
          </Button>
          <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Sparkles className="w-4 h-4" />
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
