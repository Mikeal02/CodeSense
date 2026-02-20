import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Shield, Zap, Brain, Lock, Code2, Globe, Layers, Cpu, ArrowRight } from "lucide-react";

const features = [
  { icon: Brain, title: "AI-Powered Analysis", description: "Deep understanding of your codebase using advanced language models with multi-modal reasoning.", accent: "hsl(var(--primary))" },
  { icon: Zap, title: "Instant Insights", description: "Get answers in seconds with streaming responses and intelligent caching.", accent: "hsl(var(--warning))" },
  { icon: Shield, title: "Interview Ready", description: "First-person explanations with Q&A generation perfect for technical interviews.", accent: "hsl(var(--success))" },
  { icon: Lock, title: "Private & Secure", description: "Your code is processed in real-time and never permanently stored on any server.", accent: "hsl(var(--info))" },
  { icon: Layers, title: "Deep Code Metrics", description: "Complexity analysis, coupling detection, dependency graphs, and file statistics.", accent: "hsl(var(--accent))" },
  { icon: Code2, title: "Full IDE Experience", description: "Split view, file tree, syntax highlighting, code search, and keyboard shortcuts.", accent: "hsl(var(--primary))" },
  { icon: Globe, title: "GitHub Integration", description: "Direct repository connection with branch detection and rate limit management.", accent: "hsl(var(--info))" },
  { icon: Cpu, title: "Performance Monitoring", description: "Track analysis speed, operation metrics, and optimize your workflow.", accent: "hsl(var(--warning))" },
];

const TiltFeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });
  const glowX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(y, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { x.set(0); y.set(0); setHovered(false); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className="relative group cursor-default"
    >
      <div className={`
        relative p-5 sm:p-6 rounded-2xl border transition-all duration-300 overflow-hidden
        ${hovered
          ? "border-primary/40 bg-card/70 shadow-xl"
          : "border-border/50 bg-card/30"
        }
      `}>
        {/* Spotlight effect */}
        {hovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${glowX.get()}% ${glowY.get()}%, ${feature.accent}15 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Icon */}
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
          style={{
            background: hovered ? `${feature.accent}20` : "hsl(var(--secondary) / 0.5)",
            boxShadow: hovered ? `0 0 20px ${feature.accent}30` : "none",
          }}
        >
          <feature.icon
            className="w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300"
            style={{ color: hovered ? feature.accent : "hsl(var(--primary))" }}
          />
        </div>

        <h3 className="text-sm sm:text-base font-semibold mb-2 text-foreground group-hover:text-foreground transition-colors">
          {feature.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] rounded-full"
          style={{ background: feature.accent }}
          initial={{ width: 0 }}
          animate={{ width: hovered ? "100%" : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-28 border-t border-border/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-border/50 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-secondary/30 mb-4 text-xs text-muted-foreground"
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            Capabilities
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Everything You Need</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            A comprehensive toolkit for understanding, analyzing, and preparing to discuss any codebase — from a 5-file script to a 50k-line monorepo.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features.map((feature, i) => (
            <TiltFeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl glass border border-primary/20 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all cursor-pointer group">
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
