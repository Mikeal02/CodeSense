import { ArrowRight, FolderUp, Github, Zap, Loader2, User, Key, Check, Terminal, GitBranch, Star, Cpu, Shield, Command, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import ParticleCanvas from "./ParticleCanvas";
import TypewriterText from "./TypewriterText";
import RepoHealthScore from "./RepoHealthScore";
import RepoInsights from "./RepoInsights";
import AuroraBackground from "./AuroraBackground";
import { FileContent } from "@/hooks/useCodebaseAnalysis";
import { RepoInsightsData } from "@/hooks/useRepoInsights";

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
  repoInsights?: RepoInsightsData;
}

const heroSubtitles = [
  "Forgot what your project does?",
  "Preparing for a technical interview?",
  "Onboarding to a new codebase?",
  "Need resume-ready project summaries?",
  "Want to map your architecture?",
];

const stats = [
  { icon: Terminal, label: "11 Analysis Modes", color: "text-primary" },
  { icon: GitBranch, label: "GitHub Integration", color: "text-info" },
  { icon: Star, label: "Interview Ready", color: "text-warning" },
  { icon: Cpu, label: "AI-Powered", color: "text-accent" },
  { icon: Shield, label: "Private & Secure", color: "text-success" },
];

const HeroSection = ({
  onSubmitRepo, onUploadFolder, onLoadDemo, onOpenGitHubSelector,
  isLoading, isConnected, repoName, githubToken, onUpdateGithubToken,
  files = [], repoInsights,
}: HeroSectionProps) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState(githubToken || "");
  const [showInsights, setShowInsights] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim() && !isLoading) onSubmitRepo(repoUrl);
  };

  const handleSaveToken = () => {
    onUpdateGithubToken?.(tokenInput.trim() || null);
    setShowTokenInput(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const spotlightX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const spotlightY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[90vh] sm:min-h-[95vh] flex items-center justify-center pt-14 sm:pt-16 overflow-hidden"
    >
      <AuroraBackground />
      <ParticleCanvas />
      
      {/* Code Rain overlay */}
      <CodeRainCanvas />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${spotlightX.get()}% ${spotlightY.get()}%, hsl(var(--primary) / 0.04), transparent 40%)`,
        }}
      />

      {/* Floating accents */}
      <motion.div
        className="absolute top-[15%] right-[12%] w-24 h-24 sm:w-40 sm:h-40 border border-primary/[0.06] rounded-2xl pointer-events-none"
        animate={{ rotate: [0, 90, 180, 270, 360], y: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-[20%] left-[6%] w-16 h-16 sm:w-28 sm:h-28 border border-accent/[0.06] rounded-full pointer-events-none"
        animate={{ rotate: [360, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[40%] left-[80%] w-3 h-3 bg-primary/20 rounded-full pointer-events-none"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 border border-primary/20 bg-primary/[0.04] backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">AI-Powered Codebase Intelligence</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-medium">v2.0</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-4 sm:mb-5 leading-[1.05] tracking-tight"
          >
            <span className="block text-foreground">Understand Your Code.</span>
            <span className="relative inline-block mt-1">
              <span className="text-gradient-hero">Ace Your Interviews.</span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-primary via-info to-accent"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </motion.h1>

          {/* Typewriter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 h-8 flex items-center justify-center"
          >
            <TypewriterText phrases={heroSubtitles} typingSpeed={50} deletingSpeed={25} pauseTime={2200} />
          </motion.div>

          {/* Connected / Disconnected states */}
          <AnimatePresence mode="wait">
            {isConnected && repoName ? (
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5"
              >
                <div className="inline-flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-4 rounded-2xl bg-success/[0.08] border border-success/20 backdrop-blur-sm">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <span className="text-foreground font-medium text-sm sm:text-base">Connected to: <span className="text-primary font-mono">{repoName}</span></span>
                </div>

                {files.length > 0 && (
                  <RepoHealthScore files={files} repoName={repoName} />
                )}

                {/* GitHub Insights Toggle */}
                {repoInsights && (repoInsights.metadata || repoInsights.isLoading) && (
                  <div className="max-w-2xl mx-auto">
                    <button
                      onClick={() => setShowInsights(!showInsights)}
                      className="text-[11px] text-primary/60 hover:text-primary transition-colors flex items-center gap-1.5 mx-auto mb-3"
                    >
                      <Sparkles className="w-3 h-3" />
                      {showInsights ? "Hide" : "Show"} GitHub Insights
                    </button>
                    <AnimatePresence>
                      {showInsights && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <RepoInsights insights={repoInsights} repoName={repoName} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Select a mode below to start analyzing
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="disconnected"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* URL form */}
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-3 max-w-2xl mx-auto mb-5 sm:mb-6 px-4 sm:px-0" data-onboarding="hero-input">
                  <div className="flex-1 relative group/input">
                    <Github className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within/input:text-primary" />
                    <Input
                      type="url"
                      placeholder="Paste GitHub repo URL..."
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="pl-10 sm:pl-12 h-12 sm:h-14 bg-card/50 backdrop-blur-sm border-border/40 text-sm sm:text-base focus:border-primary/50 focus:bg-card/70 transition-all rounded-xl"
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground/50">
                      <kbd className="px-1.5 py-0.5 rounded bg-secondary/60 border border-border/30 font-mono">⌘K</kbd>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 sm:h-14 px-7 sm:px-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden group/btn rounded-xl font-semibold"
                    disabled={isLoading || !repoUrl.trim()}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        Analyze
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Secondary actions */}
                <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={onOpenGitHubSelector}
                    disabled={isLoading}
                    className="gap-2 w-full sm:w-auto hover:border-primary/40 hover:bg-primary/[0.04] transition-all rounded-xl"
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
                        className="w-full sm:w-56 h-10 rounded-xl"
                      />
                      <Button size="icon" variant="ghost" onClick={handleSaveToken} className="rounded-xl">
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTokenInput(true)}
                      className={`rounded-xl ${githubToken ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <Key className="w-4 h-4 mr-1" />
                      {githubToken ? "Token Set ✓" : "Optional: Your Token"}
                    </Button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground px-4">
                  <button
                    onClick={onUploadFolder}
                    disabled={isLoading}
                    className="flex items-center gap-2 hover:text-foreground transition-all disabled:opacity-50 group/ul"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center group-hover/ul:bg-primary/10 transition-colors">
                      <FolderUp className="w-4 h-4 group-hover/ul:text-primary transition-colors" />
                    </div>
                    Upload Local Folder
                  </button>
                  <span className="hidden sm:inline opacity-20">|</span>
                  <button
                    onClick={onLoadDemo}
                    disabled={isLoading}
                    className="flex items-center gap-2 hover:text-foreground transition-all disabled:opacity-50 group/demo"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center group-hover/demo:bg-primary/10 transition-colors">
                      <Zap className="w-4 h-4 group-hover/demo:text-primary transition-colors" />
                    </div>
                    Try Demo Project
                  </button>
                </div>

                {/* Stats ticker */}
                <div className="mt-12 sm:mt-16 relative">
                  <div className="flex justify-center flex-wrap gap-6 sm:gap-10 px-4">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-all group/stat"
                      >
                        <div className="w-8 h-8 rounded-lg bg-secondary/40 flex items-center justify-center group-hover/stat:bg-primary/10 transition-all">
                          <stat.icon className={`w-4 h-4 ${stat.color} group-hover/stat:scale-110 transition-transform`} />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{stat.label}</span>
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
