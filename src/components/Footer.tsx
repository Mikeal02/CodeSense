import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, Github, Twitter, Heart, Mail, Zap, ArrowUpRight, Terminal } from "lucide-react";

const Footer = () => {
  const [time, setTime] = useState(new Date());

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
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative border-t border-border/50 overflow-hidden"
    >
      {/* Top gradient edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Background mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 pt-14 sm:pt-16 pb-8 relative">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-12 sm:mb-14">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold font-display block leading-none">CodeSense</span>
                <span className="text-[10px] text-muted-foreground font-mono">v2.0.0-stable</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
              Turn confusion into confidence. Understand your code, ace your interviews, and ship with clarity.
            </p>

            {/* Live system status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-xs text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest text-muted-foreground">Features</h4>
            <ul className="space-y-2.5">
              {links.Features.map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest text-muted-foreground">Resources</h4>
            <ul className="space-y-2.5">
              {links.Resources.map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest text-muted-foreground">Community</h4>
            <ul className="space-y-2.5">
              {links.Community.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 group">
                    <Icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            {/* Live clock */}
            <div className="mt-5 flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Terminal className="w-3.5 h-3.5 text-primary/50" />
              <span>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
            Built with <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" /> by developers, for developers
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} CodeSense</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" />
              Powered by AI
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
