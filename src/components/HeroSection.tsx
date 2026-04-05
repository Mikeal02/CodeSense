import { ArrowRight, FolderUp, Github, Zap, Loader2, User, Key, Check, Shield, Cpu, Terminal, GitBranch, Star, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TypewriterText from "./TypewriterText";
import RepoHealthScore from "./RepoHealthScore";
import RepoInsights from "./RepoInsights";
import type { FileContent } from "@/hooks/useCodebaseAnalysis";
import type { RepoInsightsData } from "@/hooks/useRepoInsights";

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

const trustItems = [
  { icon: Shield, label: "Private & Secure" },
  { icon: Cpu, label: "AI-Powered" },
  { icon: GitBranch, label: "GitHub Integration" },
  { icon: Star, label: "Interview Ready" },
  { icon: Terminal, label: "11 Analysis Modes" },
];

const terminalLines = [
  { prefix: "$", text: "codesense analyze github.com/acme/app", color: "text-foreground" },
  { prefix: "→", text: "Scanning 247 files across 18 directories...", color: "text-muted-foreground" },
  { prefix: "→", text: "Detected: React + TypeScript + Supabase", color: "text-primary" },
  { prefix: "→", text: "Architecture: Component-driven SPA", color: "text-primary" },
  { prefix: "✓", text: "Analysis complete in 2.3s", color: "text-success" },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim() && !isLoading) onSubmitRepo(repoUrl);
  };

  const handleSaveToken = () => {
    onUpdateGithubToken?.(tokenInput.trim() || null);
    setShowTokenInput(false);
  };

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center pt-20 sm:pt-24 pb-16 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute inset-0 grain pointer-events-none opacity-40" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left - Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 border border-primary/20 bg-primary/[0.06] text-xs text-primary font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI-Powered Codebase Intelligence
              <ChevronRight className="w-3 h-3 opacity-60" />
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black mb-5 leading-[1.08] tracking-[-0.03em]"
            >
              <span className="block text-foreground">Understand Your Code.</span>
              <span className="block mt-1 text-gradient-hero">Ace Your Interviews.</span>
            </motion.h1>

            {/* Typewriter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg text-muted-foreground mb-10 h-8 flex items-center justify-center lg:justify-start"
            >
              <TypewriterText phrases={heroSubtitles} typingSpeed={50} deletingSpeed={25} pauseTime={2200} />
            </motion.div>

            {/* States */}
            <AnimatePresence mode="wait">
              {isConnected && repoName ? (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-success/[0.08] border border-success/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                    <span className="text-foreground font-medium text-sm">Connected to: <span className="text-primary font-mono">{repoName}</span></span>
                  </div>

                  {files.length > 0 && <RepoHealthScore files={files} repoName={repoName} />}

                  {repoInsights && (repoInsights.metadata || repoInsights.isLoading) && (
                    <div className="max-w-2xl mx-auto lg:mx-0">
                      <button
                        onClick={() => setShowInsights(!showInsights)}
                        className="text-xs text-primary/60 hover:text-primary transition-colors flex items-center gap-1.5 mx-auto lg:mx-0 mb-3"
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
                            className="overflow-hidden"
                          >
                            <RepoInsights insights={repoInsights} repoName={repoName} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <p className="text-muted-foreground text-sm flex items-center justify-center lg:justify-start gap-2">
                    Select a mode below to start analyzing
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="disconnected"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  {/* Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto lg:mx-0 mb-5" data-onboarding="hero-input">
                    <div className="flex-1 relative group/input">
                      <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground transition-colors group-focus-within/input:text-primary" />
                      <Input
                        type="url"
                        placeholder="Paste GitHub repo URL..."
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        className="pl-11 h-12 sm:h-13 bg-card/80 border-border/60 text-sm focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl"
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground/40">
                        <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono">⌘K</kbd>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 sm:h-13 px-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                      disabled={isLoading || !repoUrl.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Secondary actions */}
                  <div className="mb-5 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                    <Button
                      variant="outline"
                      onClick={onOpenGitHubSelector}
                      disabled={isLoading}
                      className="gap-2 w-full sm:w-auto rounded-xl border-border/60 hover:border-primary/30 hover:bg-primary/[0.04]"
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

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                    <button
                      onClick={onUploadFolder}
                      disabled={isLoading}
                      className="flex items-center gap-2 hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      <FolderUp className="w-4 h-4" />
                      Upload Local Folder
                    </button>
                    <span className="hidden sm:inline opacity-20">|</span>
                    <button
                      onClick={onLoadDemo}
                      disabled={isLoading}
                      className="flex items-center gap-2 hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4" />
                      Try Demo Project
                    </button>
                  </div>

                  {/* Trust items */}
                  <div className="mt-12 flex justify-center lg:justify-start flex-wrap gap-x-6 gap-y-3">
                    {trustItems.map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
                        className="flex items-center gap-2 text-muted-foreground text-xs"
                      >
                        <item.icon className="w-3.5 h-3.5 text-primary/50" />
                        <span>{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right - Terminal Mockup */}
          <motion.div
            className="hidden lg:block flex-1 max-w-md w-full"
            initial={{ opacity: 0, x: 30, rotateY: -3 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative">
              {/* Glow effect behind terminal */}
              <div className="absolute -inset-4 bg-primary/[0.04] rounded-3xl blur-2xl" />
              
              {/* Terminal window */}
              <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-background/60">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-card/60">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-[10px] font-mono text-muted-foreground/50">codesense — terminal</span>
                  </div>
                </div>
                
                {/* Terminal content */}
                <div className="p-5 space-y-2.5 font-mono text-[13px] leading-relaxed">
                  {terminalLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.2, duration: 0.4 }}
                      className="flex items-start gap-2"
                    >
                      <span className={`${line.prefix === "✓" ? "text-success" : line.prefix === "$" ? "text-primary" : "text-muted-foreground/50"} select-none font-bold`}>
                        {line.prefix}
                      </span>
                      <span className={line.color}>{line.text}</span>
                    </motion.div>
                  ))}
                  
                  {/* Blinking cursor */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-primary font-bold select-none">$</span>
                    <span className="w-2 h-4 bg-primary/70 animate-caret-blink" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
