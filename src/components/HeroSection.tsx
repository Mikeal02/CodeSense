import { ArrowRight, FolderUp, Github, Zap, Loader2, User, Key, Check, Terminal, GitBranch, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onSubmitRepo: (url: string) => void;
  onUploadFolder: () => void;
  onLoadDemo: () => void;
  onOpenGitHubSelector: () => void;
  isLoading: boolean;
  isConnected: boolean;
  repoName?: string;
  githubToken?: string | null;
  onUpdateGithubToken?: (token: string | null) => void;
}

const HeroSection = ({ 
  onSubmitRepo, onUploadFolder, onLoadDemo, onOpenGitHubSelector,
  isLoading, isConnected, repoName, githubToken, onUpdateGithubToken
}: HeroSectionProps) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState(githubToken || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim() && !isLoading) {
      onSubmitRepo(repoUrl);
    }
  };

  const handleSaveToken = () => {
    onUpdateGithubToken?.(tokenInput.trim() || null);
    setShowTokenInput(false);
  };

  const stats = [
    { icon: Terminal, label: "11 Analysis Modes", value: "" },
    { icon: GitBranch, label: "GitHub Integration", value: "" },
    { icon: Star, label: "Interview Ready", value: "" },
  ];

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center pt-14 sm:pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:32px_32px] sm:bg-[size:64px_64px]" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass mb-6 sm:mb-8"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm text-muted-foreground">AI-Powered Codebase Intelligence</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight"
          >
            Understand Your Code.
            <br />
            <span className="text-gradient">Ace Your Interviews.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto px-4"
          >
            Forgot what your project does? Let CodeSense analyze your codebase and prepare you for technical interviews with confidence.
          </motion.p>

          {isConnected && repoName ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-primary/10 border border-primary/30">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-foreground font-medium text-sm sm:text-base">Connected to: {repoName}</span>
              </div>
              <p className="text-muted-foreground text-sm">Select a mode below to start analyzing</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-xl mx-auto mb-4 sm:mb-6 px-4 sm:px-0">
                <div className="flex-1 relative">
                  <Github className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="Paste GitHub repo URL..."
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="pl-10 sm:pl-12 h-12 sm:h-14 bg-secondary/50 border-border/50 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="h-12 sm:h-14 px-6 sm:px-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading || !repoUrl.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="sm:inline">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      Analyze
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Browse GitHub button and Token */}
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                <Button
                  variant="outline"
                  size="default"
                  onClick={onOpenGitHubSelector}
                  disabled={isLoading}
                  className="gap-2 w-full sm:w-auto"
                >
                  <User className="w-4 h-4" />
                  Browse GitHub Repos
                </Button>
                
                {showTokenInput ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input
                      type="password"
                      placeholder="Your GitHub token"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="w-full sm:w-56 h-10"
                    />
                    <Button size="icon" variant="ghost" onClick={handleSaveToken}>
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTokenInput(true)}
                    className={githubToken ? "text-primary" : "text-muted-foreground"}
                  >
                    <Key className="w-4 h-4 mr-1" />
                    {githubToken ? "Token Set" : "Optional: Your Token"}
                  </Button>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-sm text-muted-foreground px-4">
                <button 
                  onClick={onUploadFolder}
                  disabled={isLoading}
                  className="flex items-center gap-2 hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <FolderUp className="w-4 h-4" />
                  Upload Local Folder
                </button>
                <span className="hidden sm:inline">•</span>
                <button 
                  onClick={onLoadDemo}
                  disabled={isLoading}
                  className="flex items-center gap-2 hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  Try Demo Project
                </button>
              </div>

              {/* Stats Bar */}
              <div className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-4 sm:gap-8 px-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2 text-muted-foreground">
                    <stat.icon className="w-4 h-4 text-primary" />
                    <span className="text-xs sm:text-sm">{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
