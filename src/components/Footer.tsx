import { motion } from "framer-motion";
import { Github, Twitter, Heart, Mail, Zap, ArrowRight, Sparkles, Layers, Shield, Code2, BookOpen, FileCode, MessageSquare } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";


const Footer = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

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
      { label: "GitHub", icon: Github },
      { label: "Twitter / X", icon: Twitter },
      { label: "Contact", icon: Mail },
    ],
  };

  return (
    <motion.footer
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative border-t border-border/20"
    >
      <div className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8 relative">
        {/* CTA */}
        <div className="mb-16 sm:mb-20">
          <div className="relative p-8 sm:p-12 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
            {/* CTA background accent */}
            <div className="absolute inset-0 gradient-premium pointer-events-none" />
            <div className="absolute inset-0 grain pointer-events-none opacity-30" />
            
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight text-foreground">
                  Ready to understand your codebase?
                </h3>
                <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                  Start analyzing in seconds. No signup required. Free forever for public repos.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-7 py-3.5 rounded-xl bg-secondary/60 text-foreground font-semibold text-sm border border-border/40 inline-flex items-center gap-2 hover:bg-secondary/80 hover:border-border/60 transition-all">
                  <Github className="w-4 h-4" />
                  View on GitHub
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 mb-14">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="mb-5">
            <motion.img
  src="/favicon.png"
  alt="CodeSense Logo"
  className="w-16 h-16 object-contain"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
/>
            </div>
            <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xs mb-6">
              Turn confusion into confidence. Understand your code, ace your interviews, and ship with clarity.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-success/[0.06] border border-success/15 text-xs text-success/80">
              <span className="w-1.5 h-1.5 rounded-full bg-success/80 animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="font-semibold mb-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">{section}</h4>
              <ul className="space-y-3">
                {items.map(({ label, icon: Icon }) => (
                  <li key={label}>
                    <span className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 group">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/40 flex items-center gap-1.5">
            Built with <Heart className="w-3 h-3 text-destructive/50" /> by developers, for developers
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/30">
            <span>© {new Date().getFullYear()} CodeSense</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary/30" />
              Powered by AI
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
