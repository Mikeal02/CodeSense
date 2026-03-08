import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Github, Sparkles, Bell, Settings, Clock, MessageSquare, BarChart3, GitCompare, Zap, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import RateLimitStatus from "./RateLimitStatus";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onConnectRepo: () => void;
  githubToken?: string | null;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  unreadNotifications?: number;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
  onOpenActivityLog?: () => void;
  onOpenConversations?: () => void;
  onOpenAnalytics?: () => void;
  onOpenDiffView?: () => void;
  onOpenPerformance?: () => void;
  isConnected?: boolean;
}

const Header = ({ 
  onConnectRepo, githubToken, isDarkMode = true, onToggleTheme,
  unreadNotifications = 0, onOpenNotifications, onOpenSettings,
  onOpenActivityLog, onOpenConversations, onOpenAnalytics,
  onOpenDiffView, onOpenPerformance, isConnected
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toolButtons = [
    { icon: BarChart3, label: "Analytics", onClick: onOpenAnalytics, connected: true },
    { icon: GitCompare, label: "Compare", onClick: onOpenDiffView, connected: true },
    { icon: MessageSquare, label: "Conversations", onClick: onOpenConversations, connected: true },
    { icon: Clock, label: "Activity", onClick: onOpenActivityLog, connected: false },
    { icon: Zap, label: "Performance", onClick: onOpenPerformance, connected: false },
  ];

  const visibleTools = toolButtons.filter(t => !t.connected || isConnected);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 glass-heavy"
      >
        {/* Animated gradient border at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
          <motion.div
            className="h-full w-[200%] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3" data-onboarding="logo">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse-glow" />
            </motion.div>
            <div>
              <h1 className="text-base sm:text-lg font-bold font-display text-foreground">CodeSense</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">AI Codebase Assistant</p>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1" data-onboarding="header-tools">
            <RateLimitStatus githubToken={githubToken} />
            
            {visibleTools.map((tool) => (
              <Button key={tool.label} variant="ghost" size="icon" className="h-9 w-9" onClick={tool.onClick} title={tool.label}>
                <tool.icon className="w-4 h-4" />
              </Button>
            ))}
            
            <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={onOpenNotifications} title="Notifications">
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            
            {onToggleTheme && (
              <div data-onboarding="theme-toggle">
                <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
              </div>
            )}
            
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onOpenSettings} title="Settings (Ctrl+,)">
              <Settings className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Button variant="outline" size="sm" onClick={onConnectRepo} className="gap-2">
              <Github className="w-4 h-4" />
              Connect Repo
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Sparkles className="w-4 h-4" />
                Get Started
              </Button>
            </motion.div>
          </div>

          {/* Mobile / Tablet Controls */}
          <div className="flex lg:hidden items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 relative" onClick={onOpenNotifications}>
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-destructive text-destructive-foreground text-[8px] flex items-center justify-center font-bold">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            {onToggleTheme && (
              <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} size="sm" />
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 sm:top-16 left-0 right-0 z-40 glass-heavy border-b border-border/50 lg:hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {visibleTools.map((tool) => (
                  <button
                    key={tool.label}
                    onClick={() => { tool.onClick?.(); setMobileMenuOpen(false); }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <tool.icon className="w-5 h-5 text-primary" />
                    <span className="text-[11px] text-muted-foreground">{tool.label}</span>
                  </button>
                ))}
                <button
                  onClick={() => { onOpenSettings?.(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <Settings className="w-5 h-5 text-primary" />
                  <span className="text-[11px] text-muted-foreground">Settings</span>
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { onConnectRepo(); setMobileMenuOpen(false); }} className="flex-1 gap-2">
                  <Github className="w-4 h-4" />
                  Connect Repo
                </Button>
                <Button size="sm" className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Sparkles className="w-4 h-4" />
                  Get Started
                </Button>
              </div>
              <RateLimitStatus githubToken={githubToken} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
