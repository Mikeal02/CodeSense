import { ArrowRight, FolderUp, Github, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

interface HeroSectionProps {
  onSubmitRepo: (url: string) => void;
}

const HeroSection = ({ onSubmitRepo }: HeroSectionProps) => {
  const [repoUrl, setRepoUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onSubmitRepo(repoUrl);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Codebase Intelligence</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up">
            Understand Your Code.
            <br />
            <span className="text-gradient">Ace Your Interviews.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Forgot what your project does? Let CodeSense analyze your codebase and prepare you for technical interviews with confidence.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex-1 relative">
              <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Paste GitHub repo URL..."
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="pl-12 h-14 bg-secondary/50 border-border/50 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Analyze
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <button className="flex items-center gap-2 hover:text-foreground transition-colors">
              <FolderUp className="w-4 h-4" />
              Upload Local Folder
            </button>
            <span className="hidden sm:inline">•</span>
            <button className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Zap className="w-4 h-4" />
              Try Demo Project
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
