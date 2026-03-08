import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Shield, Zap, Brain, Lock, Code2, Globe, Layers, Cpu, ArrowRight, Sparkles, BarChart3 } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  { icon: Brain, title: "AI-Powered Analysis", description: "Deep understanding using advanced language models with multi-modal reasoning across your entire codebase.", accent: "primary", span: "col-span-1 sm:col-span-2 lg:col-span-2", size: "large" },
  { icon: Zap, title: "Instant Insights", description: "Streaming responses with intelligent caching.", accent: "warning", span: "col-span-1", size: "small" },
  { icon: Shield, title: "Interview Ready", description: "First-person explanations with Q&A generation.", accent: "success", span: "col-span-1", size: "small" },
  { icon: Lock, title: "Private & Secure", description: "Your code is processed in real-time and never permanently stored.", accent: "info", span: "col-span-1", size: "small" },
  { icon: Layers, title: "Deep Code Metrics", description: "Complexity analysis, coupling detection, dependency graphs, and file statistics for any codebase.", accent: "accent", span: "col-span-1 sm:col-span-2 lg:col-span-2", size: "large" },
  { icon: Code2, title: "Full IDE Experience", description: "Split view, file tree, syntax highlighting, and shortcuts.", accent: "primary", span: "col-span-1", size: "small" },
  { icon: Globe, title: "GitHub Integration", description: "Direct repo connection with branch detection.", accent: "info", span: "col-span-1", size: "small" },
  { icon: Cpu, title: "Performance Monitoring", description: "Track analysis speed and optimize workflow.", accent: "warning", span: "col-span-1", size: "small" },
];

const accentColors: Record<string, string> = {
  primary: "hsl(var(--primary))",
  warning: "hsl(var(--warning))",
  success: "hsl(var(--success))",
  info: "hsl(var(--info))",
  accent: "hsl(var(--accent))",
};

const BentoCard = ({ feature, index, sectionVisible }: { feature: typeof features[0]; index: number; sectionVisible: boolean }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const color = accentColors[feature.accent] || accentColors.primary;
  const isLarge = feature.size === "large";

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      animate={sectionVisible 
        ? { opacity: 1, y: 0, filter: "blur(0px)" } 
        : { opacity: 0, y: 40, filter: "blur(8px)" }
      }
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { x.set(0); y.set(0); setHovered(false); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className={`relative cursor-default ${feature.span}`}
    >
      <div className={`
        bento-card relative overflow-hidden transition-all duration-400
        ${isLarge ? "p-6 sm:p-8" : "p-5 sm:p-6"}
        ${hovered ? "border-primary/30" : ""}
      `}>
        {/* Spotlight radial gradient on hover */}
        {hovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(circle at 50% 0%, ${color}12 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Top accent line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: color }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 0.5 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Icon */}
        <div
          className={`${isLarge ? "w-14 h-14" : "w-11 h-11"} rounded-xl flex items-center justify-center mb-4 transition-all duration-400 relative`}
          style={{
            background: hovered ? `${color}15` : "hsl(var(--secondary) / 0.4)",
            boxShadow: hovered ? `0 0 24px ${color}20` : "none",
          }}
        >
          <feature.icon
            className={`${isLarge ? "w-7 h-7" : "w-5 h-5"} transition-all duration-300`}
            style={{ color: hovered ? color : "hsl(var(--muted-foreground))" }}
          />
        </div>

        <h3 className={`${isLarge ? "text-base sm:text-lg" : "text-sm"} font-semibold mb-2 text-foreground transition-colors`}>
          {feature.title}
        </h3>
        <p className={`${isLarge ? "text-sm" : "text-xs"} text-muted-foreground leading-relaxed`}>
          {feature.description}
        </p>

        {/* Corner decoration for large cards */}
        {isLarge && (
          <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none opacity-[0.03]">
            <feature.icon className="w-full h-full" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.08 });

  return (
    <section ref={ref} className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.015] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-border/30 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 sm:mb-18"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 bg-secondary/20 backdrop-blur-sm mb-5 text-xs text-muted-foreground"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Capabilities
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-5 tracking-tight">
            Everything You Need
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            A comprehensive toolkit for understanding, analyzing, and preparing to discuss any codebase — from a 5-file script to a 50k-line monorepo.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
          {features.map((feature, i) => (
            <BentoCard key={feature.title} feature={feature} index={i} sectionVisible={isVisible} />
          ))}
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-14 sm:mt-18 text-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass border border-primary/15 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-pointer group">
            <Zap className="w-4 h-4 text-primary" />
            <span>Paste a GitHub URL above to see it in action</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
