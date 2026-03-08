import { ArrowRight, FolderUp, Github, Zap, Loader2, User, Key, Check, Terminal, GitBranch, Star, Cpu, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleCanvas from "./ParticleCanvas";
import TypewriterText from "./TypewriterText";
import RepoHealthScore from "./RepoHealthScore";
import { FileContent } from "@/hooks/useCodebaseAnalysis";

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
  files?: FileContent[];
}

const heroSubtitles = [
  "Forgot what your project does?",
  "Preparing for a technical interview?",
  "Onboarding to a new codebase?",
  "Need resume-ready project summaries?",
  "Want to map your architecture?",
];

const stats = [
  { icon: Terminal, label: "11 Analysis Modes" },
  { icon: GitBranch, label: "GitHub Integration" },
  { icon: Star, label: "Interview Ready" },
  { icon: Cpu, label: "AI-Powered" },
  { icon: Shield, label: "Private & Secure" },
];

const HeroSection = ({
  onSubmitRepo, onUploadFolder, onLoadDemo, onOpenGitHubSelector,
  isLoading, isConnected, repoName, githubToken, onUpdateGithubToken,
  files = [],
}: HeroSectionProps) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState(githubToken || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim() && !isLoading) onSubmitRepo(repoUrl);
  };

  const handleSaveToken = () => {
    onUpdateGithubToken?.(tokenInput.trim() || null);
    setShowTokenInput(false);
  };

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center pt-14 sm:pt-16 overflow-hidden">
      {/* Particle layer */}
      <ParticleCanvas />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[15%] left-[10%] w-64 sm:w-[500px] h-64 sm:h-[500px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)" }}
          animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[5%] w-72 sm:w-[550px] h-72 sm:h-[550px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.12), transparent 70%)" }}
          animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1.1, 0.9, 1.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-48 sm:w-[350px] h-48 sm:h-[350px] rounded-full blur-[80px]"
          style={{ background: "radial-gradient(circle, hsl(var(--info) / 0.08), transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Dot grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      {/* Floating geometric accents */}
      <motion.div
        className="absolute top-[20%] right-[15%] w-20 h-20 sm:w-32 sm:h-32 border border-primary/10 rounded-2xl pointer-events-none"
        animate={{ rotate: [0, 90, 180, 270, 360], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-[25%] left-[8%] w-16 h-16 sm:w-24 sm:h-24 border border-accent/10 rounded-full pointer-events-none"
        animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 border border-primary/30 bg-primary/5 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">AI-Powered Codebase Intelligence</span>
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-medium">v2.0</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 leading-tight tracking-tight"
          >
            <span className="block">Understand Your Code.</span>
            <span className="relative inline-block">
              <span className="text-gradient">Ace Your Interviews.</span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-primary via-info to-accent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </motion.h1>

          {/* Typewriter subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 h-8 flex items-center justify-center"
          >
            <TypewriterText
              phrases={heroSubtitles}
              typingSpeed={55}
              deletingSpeed={25}
              pauseTime={2200}
            />
          </motion.div>

          {/* Connected state: show health score */}
          <AnimatePresence mode="wait">
            {isConnected && repoName ? (
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5"
              >
                <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-success/10 border border-success/25">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <span className="text-foreground font-medium text-sm sm:text-base">Connected to: <span className="text-primary font-mono">{repoName}</span></span>
                </div>

                {files.length > 0 && (
                  <RepoHealthScore files={files} repoName={repoName} />
                )}

                <p className="text-muted-foreground text-sm">Select a mode below to start analyzing ↓</p>
              </motion.div>
            ) : (
              <motion.div
                key="disconnected"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.4 }}
              >
                {/* URL form */}
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-xl mx-auto mb-4 sm:mb-6 px-4 sm:px-0" data-onboarding="hero-input">
                  <div className="flex-1 relative">
                    <Github className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="Paste GitHub repo URL..."
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="pl-10 sm:pl-12 h-12 sm:h-14 bg-secondary/50 border-border/50 text-sm sm:text-base focus:border-primary/50 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 sm:h-14 px-6 sm:px-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden group/btn"
                    disabled={isLoading || !repoUrl.trim()}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
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

                {/* Secondary actions */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={onOpenGitHubSelector}
                    disabled={isLoading}
                    className="gap-2 w-full sm:w-auto hover:border-primary/50 transition-colors"
                    data-onboarding="github-browse"
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
                      {githubToken ? "Token Set ✓" : "Optional: Your Token"}
                    </Button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-sm text-muted-foreground px-4">
                  <button
                    onClick={onUploadFolder}
                    disabled={isLoading}
                    className="flex items-center gap-2 hover:text-foreground transition-colors disabled:opacity-50 group/ul"
                  >
                    <FolderUp className="w-4 h-4 group-hover/ul:text-primary transition-colors" />
                    Upload Local Folder
                  </button>
                  <span className="hidden sm:inline opacity-30">•</span>
                  <button
                    onClick={onLoadDemo}
                    disabled={isLoading}
                    className="flex items-center gap-2 hover:text-foreground transition-colors disabled:opacity-50 group/demo"
                  >
                    <Zap className="w-4 h-4 group-hover/demo:text-primary transition-colors" />
                    Try Demo Project
                  </button>
                </div>

                {/* Animated stats ticker */}
                <div className="mt-10 sm:mt-14 relative overflow-hidden">
                  <div className="flex justify-center flex-wrap gap-4 sm:gap-8 px-4">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.08 }}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group/stat"
                      >
                        <stat.icon className="w-4 h-4 text-primary group-hover/stat:scale-110 transition-transform" />
                        <span className="text-xs sm:text-sm">{stat.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
