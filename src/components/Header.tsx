import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Github, Sparkles, Bell, Settings, Clock, MessageSquare, BarChart3, GitCompare, Zap, Menu, Shield, FileSearch, User, LogOut, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import RateLimitStatus from "./RateLimitStatus";
import ThemeToggle from "./ThemeToggle";
import MagneticButton from "./MagneticButton";
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

const ToolButton = ({ icon: Icon, label, onClick, delay }: { icon: any; label: string; onClick?: () => void; delay: number }) => (
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
      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-popover text-popover-foreground px-2 py-0.5 rounded-md border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
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
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
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
    { icon: Zap, label: "Performance", onClick: onOpenPerformance, connected: false },
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
        {/* Layered frosted glass background */}
        <div className="absolute inset-0 bg-background/45 backdrop-blur-3xl" />
        <div className="absolute inset-0 gradient-mesh opacity-70" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border/45" />
        
        {/* Animated gradient accent line */}
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
            <motion.div 
              className="flex items-center gap-2.5 sm:gap-3" 
              data-onboarding="logo"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.08, rotate: 3 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                  <Code2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-primary-foreground" />
                </div>
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              <div>
                <h1 className="text-sm sm:text-base font-bold font-display text-foreground leading-none tracking-tight">CodeSense</h1>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 hidden sm:block font-mono tracking-wider">v2.0.0</p>
              </div>
            </motion.div>
          </MagneticButton>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1" data-onboarding="header-tools">
            <RateLimitStatus githubToken={githubToken} />
            
            <div className="w-px h-5 bg-border/40 mx-1.5" />
            
            {visibleTools.map((tool, i) => (
              <ToolButton key={tool.label} icon={tool.icon} label={tool.label} onClick={tool.onClick} delay={0.1 + i * 0.03} />
            ))}
            
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
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[8px] flex items-center justify-center font-bold"
                    >
                      {unreadNotifications}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
            
            {onToggleTheme && (
              <motion.div data-onboarding="theme-toggle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
              </motion.div>
            )}
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg group" onClick={onOpenSettings} title="Settings">
                <Settings className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            </motion.div>
            
            <div className="w-px h-5 bg-border/40 mx-1.5" />
            
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{user.email}</span>
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
                <Button variant="outline" size="sm" onClick={onConnectRepo} className="gap-2 h-8 text-xs rounded-lg border-border/40 hover:border-primary/40 hover:bg-primary/[0.04]">
                  <Github className="w-3.5 h-3.5" />
                  Connect
                </Button>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-1.5">
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
        <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background/95 backdrop-blur-2xl p-0">
          <SheetHeader className="p-5 pb-3 border-b border-border/30">
            <SheetTitle className="flex items-center gap-2.5 text-sm font-bold">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center">
                <Code2 className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              CodeSense
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)]">
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

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={() => { onConnectRepo(); setMobileMenuOpen(false); }} className="w-full gap-2 rounded-xl justify-start">
                <Github className="w-4 h-4" />
                Connect Repo
              </Button>
              <Button size="sm" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl justify-start">
                <Sparkles className="w-4 h-4" />
                Get Started
              </Button>
            </div>

            {/* Rate Limit */}
            <RateLimitStatus githubToken={githubToken} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
