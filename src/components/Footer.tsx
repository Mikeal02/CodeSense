import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, Github, Twitter, Heart, Mail, Zap, ArrowUpRight, Terminal, ArrowRight, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Footer = () => {
  const [time, setTime] = useState(new Date());
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const links = {
    Features: ["AI Code Analysis", "Interview Prep", "Dependency Graphs", "Code Metrics", "File Comparison"],
    Resources: ["Documentation", "Keyboard Shortcuts", "Privacy Policy", "Changelog", "API Reference"],
    Community: [
      { label: "GitHub", icon: Github },
      { label: "Twitter / X", icon: Twitter },
      { label: "Contact Us", icon: Mail },
    ],
  };

  return (
    <motion.footer
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative border-t border-border/30 overflow-hidden"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Background */}
      <div className="absolute inset-0 aurora-gradient opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8 relative">
        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-16 sm:mb-20 p-8 sm:p-10 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-accent/[0.02] to-transparent text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.06)_0%,_transparent_70%)] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3">Ready to understand your codebase?</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-lg mx-auto">Start analyzing in seconds. No signup required.</p>
            <button className="relative px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group inline-flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 mb-14 sm:mb-16">
          {/* Brand */}
          <motion.div 
            className="sm:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold font-display block leading-none">CodeSense</span>
                <span className="text-[10px] text-muted-foreground/50 font-mono">v2.0.0-stable</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              Turn confusion into confidence. Understand your code, ace your interviews, and ship with clarity.
            </p>

            {/* Live system status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success/[0.06] border border-success/15 text-xs text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              All systems operational
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h4 className="font-semibold mb-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Features</h4>
            <ul className="space-y-3">
              {links.Features.map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h4 className="font-semibold mb-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Resources</h4>
            <ul className="space-y-3">
              {links.Resources.map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Community */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h4 className="font-semibold mb-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Community</h4>
            <ul className="space-y-3">
              {links.Community.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2.5 group">
                    <div className="w-7 h-7 rounded-lg bg-secondary/40 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            {/* Live clock */}
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-muted-foreground/50">
              <Terminal className="w-3.5 h-3.5" />
              <span>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
            Built with <Heart className="w-3 h-3 text-destructive fill-destructive" /> by developers, for developers
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/40">
            <span>© {new Date().getFullYear()} CodeSense</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary/50" />
              Powered by AI
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
