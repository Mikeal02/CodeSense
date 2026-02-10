import { motion } from "framer-motion";
import { Code2, Github, Sparkles, Moon, Sun, Bell, Settings, Clock, MessageSquare, BarChart3, GitCompare, Zap } from "lucide-react";
import { Button } from "./ui/button";
import RateLimitStatus from "./RateLimitStatus";
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
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-heavy"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold font-display text-foreground">CodeSense</h1>
            <p className="text-xs text-muted-foreground">AI Codebase Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <RateLimitStatus githubToken={githubToken} />
          
          {isConnected && (
            <>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onOpenAnalytics} title="Analytics">
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onOpenDiffView} title="Compare files">
                <GitCompare className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onOpenConversations} title="Conversations">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onOpenActivityLog} title="Activity log">
            <Clock className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onOpenPerformance} title="Performance">
            <Zap className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={onOpenNotifications} title="Notifications">
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                {unreadNotifications}
              </span>
            )}
          </Button>
          
          {onToggleTheme && (
            <Button variant="ghost" size="icon" onClick={onToggleTheme} className="h-9 w-9" title={isDarkMode ? "Light mode" : "Dark mode"}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onOpenSettings} title="Settings (Ctrl+,)">
            <Settings className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <Button variant="outline" size="sm" onClick={onConnectRepo} className="hidden sm:flex gap-2">
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
      </div>
    </motion.header>
  );
};

export default Header;
