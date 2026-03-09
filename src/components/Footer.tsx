import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, Twitter, Heart, Mail, Zap, ArrowUpRight, Terminal, ArrowRight, Sparkles, Layers, Shield, Code2, BookOpen, FileCode, MessageSquare } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Logo from "./Logo";

const Footer = () => {
  const [time, setTime] = useState(new Date());
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const links = {
    Product: [
      { label: "AI Analysis", icon: Sparkles },
      { label: "Interview Prep", icon: MessageSquare },
      { label: "Dependency Graphs", icon: Layers },
      { label: "Code Metrics", icon: FileCode },
      { label: "Security Scan", icon: Shield },
    ],
    Resources: [
      { label: "Documentation", icon: BookOpen },
      { label: "API Reference", icon: Code2 },
      { label: "Changelog", icon: FileCode },
      { label: "Privacy Policy", icon: Shield },
    ],
    Connect: [
      { label: "GitHub", icon: Github, href: "#" },
      { label: "Twitter / X", icon: Twitter, href: "#" },
      { label: "Contact", icon: Mail, href: "#" },
    ],
  };

  const stats = [
    { value: "11", label: "Analysis Modes" },
    { value: "50k+", label: "Files Analyzed" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <motion.footer
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative border-t border-border/20 overflow-hidden"
    >
      {/* Top gradient line with enhanced glow */}
      <div className="absolute top-0 left-0 right-0 h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8 relative">
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 sm:mb-20 relative"
        >
          <div className="p-8 sm:p-12 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.05] via-accent/[0.02] to-transparent relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
            
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block mb-4"
                >
                  <Sparkles className="w-8 h-8 text-primary/60" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 tracking-tight">
                  Ready to understand your codebase?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
                  Start analyzing in seconds. No signup required. Free forever for public repos.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-xl shadow-primary/25 inline-flex items-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-xl bg-secondary/50 text-foreground font-semibold text-sm border border-border/30 inline-flex items-center gap-2 group hover:bg-secondary/70 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  View on GitHub
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4 mb-16 max-w-2xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="text-center p-4 rounded-xl bg-secondary/20 border border-border/10"
            >
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
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
            <div className="mb-5">
              <Logo size="lg" animated={false} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              Turn confusion into confidence. Understand your code, ace your interviews, and ship with clarity.
            </p>

            {/* Live system status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-success/[0.08] border border-success/20 text-xs text-success"
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-success"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              All systems operational
            </motion.div>
          </motion.div>

          {/* Product links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h4 className="font-semibold mb-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Product</h4>
            <ul className="space-y-3">
              {links.Product.map(({ label, icon: Icon }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.04 }}
                >
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 group">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    {label}
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
              {links.Resources.map(({ label, icon: Icon }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 + i * 0.04 }}
                >
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 group">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h4 className="font-semibold mb-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Connect</h4>
            <ul className="space-y-3">
              {links.Connect.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2.5 group">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-lg bg-secondary/40 flex items-center justify-center group-hover:bg-primary/10 transition-all"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
