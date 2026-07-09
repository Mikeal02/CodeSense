import { useState, useEffect } from "react";
import {motion} from "framer-motion";
import { Github, Bell, Settings, Clock, MessageSquare, BarChart3, GitCompare, Menu, Shield, FileSearch, LogOut, LogIn, Command, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import RateLimitStatus from "./RateLimitStatus";
import ThemeToggle from "./ThemeToggle";
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

const ToolButton = ({ icon: Icon, label, onClick, badge }: { icon: any; label: string; onClick?: () => void; badge?: string }) => (
  <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg relative"
    onClick={onClick}
    title={label}
  >
    <Icon className="w-3.5 h-3.5" />
    {badge && (
      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[8px] bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
        {badge}
      </span>
    )}
  </Button>
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
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
            : "bg-background/40 backdrop-blur-lg border-b border-transparent"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.img
  src="/favicon.png"
  alt="CodeSense Logo"
  data-onboarding="logo"
  className="w-10 h-10 object-contain cursor-pointer"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.4 }}
/>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1.5" data-onboarding="header-tools">
            <div className="flex items-center gap-2 mr-2">
              <RateLimitStatus githubToken={githubToken} />
              {isConnected && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                  <span className="w-1.5 h-1.5 bg-success rounded-full" />
                  <span className="text-[10px] text-success font-medium">Connected</span>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-border mx-1.5" />

            <div className="flex items-center gap-0.5">
              {visibleTools.map((tool) => (
                <ToolButton key={tool.label} icon={tool.icon} label={tool.label} onClick={tool.onClick} />
              ))}
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 relative text-muted-foreground hover:text-foreground rounded-lg" onClick={onOpenNotifications} title="Notifications">
              <Bell className="w-3.5 h-3.5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[8px] flex items-center justify-center font-bold">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            {onToggleTheme && (
              <div data-onboarding="theme-toggle">
                <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
              </div>
            )}

            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg" onClick={onOpenSettings} title="Settings">
              <Settings className="w-3.5 h-3.5" />
            </Button>

            <div className="w-px h-5 bg-border mx-1.5" />

            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary border border-border/30">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
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
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="gap-2 h-8 text-xs rounded-lg">
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={onConnectRepo}
                className="gap-2 h-8 text-xs rounded-lg"
              >
                <Github className="w-3.5 h-3.5" />
                Connect
                <kbd className="hidden xl:inline text-[9px] px-1 py-0.5 rounded bg-primary-foreground/15 font-mono">⌘K</kbd>
              </Button>
            </div>
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center gap-1.5">
            {isConnected && <span className="w-2 h-2 bg-success rounded-full" />}
            <Button variant="ghost" size="icon" className="h-8 w-8 relative rounded-lg" onClick={onOpenNotifications}>
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-destructive text-destructive-foreground text-[8px] flex items-center justify-center font-bold">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            {onToggleTheme && <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} size="sm" />}
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[340px] bg-background/95 backdrop-blur-2xl p-0 border-l border-border">
          <SheetHeader className="p-5 pb-3 border-b border-border/30">
            <SheetTitle className="flex items-center gap-3">
            <div className="flex items-center gap-3">
  <motion.img
    src="/favicon.png"
    alt="CodeSense Logo"
    className="w-9 h-9 object-contain"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
  />
  <span className="text-lg font-bold tracking-tight">
    CodeSense
  </span>
</div>
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)]">
            {isConnected && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success/10 border border-success/20">
                <span className="w-2 h-2 bg-success rounded-full" />
                <span className="text-xs text-success font-medium">Repository Connected</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {visibleTools.map((tool) => (
                <button
                  key={tool.label}
                  onClick={() => { tool.onClick?.(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 border border-border/30 transition-all active:scale-95"
                >
                  <tool.icon className="w-5 h-5 text-primary" />
                  <span className="text-[10px] text-muted-foreground">{tool.label}</span>
                </button>
              ))}
              <button
                onClick={() => { onOpenSettings?.(); setMobileMenuOpen(false); }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 border border-border/30 transition-all active:scale-95"
              >
                <Settings className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-muted-foreground">Settings</span>
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/20 text-xs text-muted-foreground">
              <Command className="w-3.5 h-3.5" />
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">⌘K</kbd> for commands</span>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/30">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
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
              <Button variant="default" size="sm" onClick={() => { onConnectRepo(); setMobileMenuOpen(false); }} className="w-full gap-2 rounded-xl justify-start">
                <Github className="w-4 h-4" />
                Connect Repository
              </Button>
            </div>

            <div className="pt-2 border-t border-border/30">
              <RateLimitStatus githubToken={githubToken} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
