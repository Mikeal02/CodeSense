import { motion } from "framer-motion";
import { Github, Twitter, Heart, Mail, Zap, ArrowUpRight, ArrowRight, Sparkles, Layers, Shield, Code2, BookOpen, FileCode, MessageSquare } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Logo from "./Logo";

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
      className="relative border-t border-border/30"
    >
      <div className="container mx-auto px-4 sm:px-6 pt-14 sm:pt-18 pb-8 relative">
        {/* CTA */}
        <div className="mb-14 sm:mb-18">
          <div className="p-8 sm:p-12 rounded-2xl border border-border bg-card/40">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight text-foreground">
                  Ready to understand your codebase?
                </h3>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Start analyzing in seconds. No signup required. Free forever for public repos.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center gap-2 hover:bg-primary/90 transition-colors">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-7 py-3.5 rounded-xl bg-secondary text-foreground font-semibold text-sm border border-border inline-flex items-center gap-2 hover:bg-secondary/80 transition-colors">
                  <Github className="w-4 h-4" />
                  View on GitHub
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="mb-4">
              <Logo size="lg" animated={false} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              Turn confusion into confidence. Understand your code, ace your interviews, and ship with clarity.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-success/[0.08] border border-success/20 text-xs text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              All systems operational
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="font-semibold mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">{section}</h4>
              <ul className="space-y-2.5">
                {items.map(({ label, icon: Icon }) => (
                  <li key={label}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 group">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/50 flex items-center gap-1.5">
            Built with <Heart className="w-3 h-3 text-destructive/60" /> by developers, for developers
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/35">
            <span>© {new Date().getFullYear()} CodeSense</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary/40" />
              Powered by AI
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
