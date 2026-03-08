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
      className="relative border-t border-border/20 overflow-hidden"
    >
      {/* Top gradient line with glow */}
      <div className="absolute top-0 left-0 right-0 h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm" />
      </div>

      {/* Background mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8 relative">
        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 sm:mb-20 p-8 sm:p-10 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-accent/[0.02] to-transparent text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.06)_0%,_transparent_70%)] pointer-events-none" />
          
          {/* Animated orb */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], y: [-20, 0, -20] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 tracking-tight">Ready to understand your codebase?</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-lg mx-auto">Start analyzing in seconds. No signup required.</p>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="relative px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all shadow-lg shadow-primary/20 group/btn inline-flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary via-accent/20 to-primary"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.4 }}
              />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 mb-14 sm:mb-16">
          {/* Brand */}
          <motion.div 
            className="sm:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-5">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <span className="text-lg font-bold font-display block leading-none tracking-tight">CodeSense</span>
                <span className="text-[10px] text-muted-foreground/50 font-mono tracking-wider">v2.0.0-stable</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              Turn confusion into confidence. Understand your code, ace your interviews, and ship with clarity.
            </p>

            {/* Live system status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-success/[0.06] border border-success/15 text-xs text-success"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-success"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              All systems operational
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h4 className="font-semibold mb-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Features</h4>
            <ul className="space-y-3">
              {links.Features.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.04 }}
                >
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h4 className="font-semibold mb-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Resources</h4>
            <ul className="space-y-3">
              {links.Resources.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 + i * 0.04 }}
                >
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Community */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h4 className="font-semibold mb-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Community</h4>
            <ul className="space-y-3">
              {links.Community.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2.5 group">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-7 h-7 rounded-lg bg-secondary/40 flex items-center justify-center group-hover:bg-primary/10 transition-all"
                    >
                      <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.div>
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            {/* Live clock */}
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-muted-foreground/40">
              <Terminal className="w-3.5 h-3.5" />
              <motion.span
                key={time.toLocaleTimeString()}
                initial={{ opacity: 0.5, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8 }}
          className="border-t border-border/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-muted-foreground/50 flex items-center gap-1.5">
            Built with <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Heart className="w-3 h-3 text-destructive fill-destructive" /></motion.span> by developers, for developers
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/35">
            <span>© {new Date().getFullYear()} CodeSense</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary/40" />
              Powered by AI
            </span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
