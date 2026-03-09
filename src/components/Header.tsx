import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Sparkles, Bell, Settings, Clock, MessageSquare, BarChart3, GitCompare, Zap, Menu, Shield, FileSearch, LogOut, LogIn, Command, Layers, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import RateLimitStatus from "./RateLimitStatus";
import ThemeToggle from "./ThemeToggle";
import MagneticButton from "./MagneticButton";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HeaderProps {
  onConnectRepo: () => void;
  githubToken?: string | null;
  isDarkMode?: boolean;
  onToggleTheme?: (e?: React.MouseEvent) => void;
  unreadNotifications?: number;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
  onOpenActivityLog?: () => void;
  onOpenConversations?: () => void;
  onOpenAnalytics?: () => void;
  onOpenDiffView?: () => void;
  onOpenPerformance?: () => void;
  onOpenCodeReview?: () => void;
  onOpenDepScanner?: () => void;
  isConnected?: boolean;
}

const ToolButton = ({ icon: Icon, label, onClick, delay, badge }: { icon: any; label: string; onClick?: () => void; delay: number; badge?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  >
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg relative group"
      onClick={onClick}
      title={label}
    >
      <Icon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
      {badge && (
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[8px] bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-popover text-popover-foreground px-2 py-0.5 rounded-md border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
        {label}
      </span>
    </Button>
  </motion.div>
);

const Header = ({ 
  onConnectRepo, githubToken, isDarkMode = true, onToggleTheme,
  unreadNotifications = 0, onOpenNotifications, onOpenSettings,
  onOpenActivityLog, onOpenConversations, onOpenAnalytics,
  onOpenDiffView, onOpenPerformance, onOpenCodeReview, onOpenDepScanner, isConnected
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Track scroll for glass effect intensity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  const toolButtons = [
    { icon: BarChart3, label: "Analytics", onClick: onOpenAnalytics, connected: true },
    { icon: GitCompare, label: "Compare", onClick: onOpenDiffView, connected: true },
    { icon: FileSearch, label: "Code Review", onClick: onOpenCodeReview, connected: true },
    { icon: Shield, label: "Security", onClick: onOpenDepScanner, connected: true },
    { icon: MessageSquare, label: "Conversations", onClick: onOpenConversations, connected: true },
    { icon: Clock, label: "Activity", onClick: onOpenActivityLog, connected: false },
    { icon: Activity, label: "Performance", onClick: onOpenPerformance, connected: false },
  ];

  const visibleTools = toolButtons.filter(t => !t.connected || isConnected);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Multi-layer glass background */}
        <motion.div 
          className="absolute inset-0 transition-all duration-300"
          animate={{
            backgroundColor: scrolled ? "hsl(var(--background) / 0.75)" : "hsl(var(--background) / 0.45)",
            backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "blur(20px) saturate(150%)",
          }}
        />
        <div className="absolute inset-0 gradient-mesh opacity-70" />
        
        {/* Bottom border with gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border/30" />
        
        {/* Animated accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
          <motion.div
            className="h-full w-[300%] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            animate={{ x: ["-66%", "0%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between relative">
          {/* Logo */}
          <MagneticButton strength={0.2}>
            <Logo size="md" data-onboarding="logo" />
          </MagneticButton>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1" data-onboarding="header-tools">
            {/* Status indicators cluster */}
            <div className="flex items-center gap-2 mr-2">
              <RateLimitStatus githubToken={githubToken} />
              {isConnected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20"
                >
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  <span className="text-[10px] text-success font-medium">Connected</span>
                </motion.div>
              )}
            </div>
            
            <div className="w-px h-5 bg-border/40 mx-1.5" />
            
            {/* Tool buttons */}
            <div className="flex items-center gap-0.5">
              {visibleTools.map((tool, i) => (
                <ToolButton key={tool.label} icon={tool.icon} label={tool.label} onClick={tool.onClick} delay={0.1 + i * 0.03} />
              ))}
            </div>
            
            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 relative text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg group" onClick={onOpenNotifications} title="Notifications">
                <Bell className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                <AnimatePresence>
                  {unreadNotifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-0 right-0 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[8px] flex items-center justify-center font-bold"
                    >
                      {unreadNotifications}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
            
            {/* Theme toggle */}
            {onToggleTheme && (
              <motion.div data-onboarding="theme-toggle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
              </motion.div>
            )}
            
            {/* Settings */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg group" onClick={onOpenSettings} title="Settings">
                <Settings className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            </motion.div>
            
            <div className="w-px h-5 bg-border/40 mx-1.5" />
            
            {/* Auth + Connect actions */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/30 border border-border/20">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">
                        {user.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{user.email?.split("@")[0]}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" onClick={handleSignOut} title="Sign Out">
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <MagneticButton strength={0.25}>
                  <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="gap-2 h-8 text-xs rounded-lg border-border/40 hover:border-primary/40 hover:bg-primary/[0.04]">
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </Button>
                </MagneticButton>
              )}
              <MagneticButton strength={0.25}>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={onConnectRepo} 
                  className="gap-2 h-8 text-xs rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  <Github className="w-3.5 h-3.5" />
                  Connect
                  <kbd className="hidden xl:inline text-[9px] px-1 py-0.5 rounded bg-primary-foreground/10 font-mono">⌘K</kbd>
                </Button>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-1.5">
            {isConnected && (
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 relative rounded-lg" onClick={onOpenNotifications}>
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
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Slide-out Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[340px] bg-background/95 backdrop-blur-2xl p-0 border-l border-border/30">
          <SheetHeader className="p-5 pb-3 border-b border-border/20">
            <SheetTitle className="flex items-center gap-3">
              <Logo size="sm" showText={true} animated={false} />
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)]">
            {/* Connection status */}
            {isConnected && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success/10 border border-success/20">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-xs text-success font-medium">Repository Connected</span>
              </div>
            )}

            {/* Tool Grid */}
            <div className="grid grid-cols-3 gap-2">
              {visibleTools.map((tool) => (
                <button
                  key={tool.label}
                  onClick={() => { tool.onClick?.(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 border border-border/15 transition-all active:scale-95"
                >
                  <tool.icon className="w-5 h-5 text-primary" />
                  <span className="text-[10px] text-muted-foreground">{tool.label}</span>
                </button>
              ))}
              <button
                onClick={() => { onOpenSettings?.(); setMobileMenuOpen(false); }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 border border-border/15 transition-all active:scale-95"
              >
                <Settings className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-muted-foreground">Settings</span>
              </button>
            </div>

            {/* Keyboard shortcut hint */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 text-xs text-muted-foreground">
              <Command className="w-3.5 h-3.5" />
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-secondary/60 border border-border/30 font-mono text-[10px]">⌘K</kbd> for commands</span>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-border/15">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/20">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">
                        {user.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate flex-1">{user.email}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full gap-2 rounded-xl justify-start">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }} className="w-full gap-2 rounded-xl justify-start">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              )}
              <Button variant="default" size="sm" onClick={() => { onConnectRepo(); setMobileMenuOpen(false); }} className="w-full gap-2 rounded-xl justify-start bg-primary hover:bg-primary/90">
                <Github className="w-4 h-4" />
                Connect Repository
              </Button>
            </div>

            {/* Rate Limit */}
            <div className="pt-2 border-t border-border/15">
              <RateLimitStatus githubToken={githubToken} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
