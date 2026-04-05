import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Brain, Lock, Code2, Globe, Layers, Cpu, ArrowRight, Terminal, CheckCircle2, Eye } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  { icon: Brain, title: "AI-Powered Analysis", description: "Deep understanding using advanced language models with multi-modal reasoning across your entire codebase.", span: "col-span-1 sm:col-span-2 lg:col-span-2", size: "large", metrics: ["2M+ tokens", "99.8% accuracy", "< 3s avg"] },
  { icon: Zap, title: "Instant Insights", description: "Streaming responses with intelligent caching for sub-second analysis.", span: "col-span-1", size: "small", metrics: ["Real-time"] },
  { icon: Shield, title: "Interview Ready", description: "First-person explanations with full Q&A generation.", span: "col-span-1", size: "small", metrics: ["500+ Q&A"] },
  { icon: Lock, title: "Private & Secure", description: "Your code is processed in real-time and never permanently stored on any server.", span: "col-span-1", size: "small", metrics: ["Zero storage"] },
  { icon: Layers, title: "Deep Code Metrics", description: "Complexity analysis, coupling detection, dependency graphs, and comprehensive file statistics.", span: "col-span-1 sm:col-span-2 lg:col-span-2", size: "large", metrics: ["50+ metrics", "Visual graphs", "LOC analysis"] },
  { icon: Code2, title: "Full IDE Experience", description: "Split view, file tree, syntax highlighting, and keyboard shortcuts.", span: "col-span-1", size: "small", metrics: ["CMD+K"] },
  { icon: Globe, title: "GitHub Integration", description: "Direct repo connection with automatic branch detection.", span: "col-span-1", size: "small", metrics: ["OAuth"] },
  { icon: Cpu, title: "Performance Monitoring", description: "Track analysis speed and optimize your workflow.", span: "col-span-1", size: "small", metrics: ["Live stats"] },
];

const BentoCard = ({ feature, index, sectionVisible }: { feature: typeof features[0]; index: number; sectionVisible: boolean }) => {
  const [hovered, setHovered] = useState(false);
  const isLarge = feature.size === "large";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={sectionVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative cursor-default ${feature.span}`}
    >
      <div className={`
        bento-card relative overflow-hidden
        ${isLarge ? "p-6 sm:p-8" : "p-5 sm:p-6"}
      `}>
        {/* Hover gradient overlay */}
        <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${hovered ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className={`
            ${isLarge ? "w-12 h-12" : "w-10 h-10"} 
            rounded-lg flex items-center justify-center mb-4 transition-all duration-300
            ${hovered ? "bg-primary/10 text-primary shadow-lg shadow-primary/10" : "bg-secondary/60 text-muted-foreground"}
          `}>
            <feature.icon className={`${isLarge ? "w-6 h-6" : "w-5 h-5"}`} />
          </div>

          <h3 className={`${isLarge ? "text-base sm:text-lg" : "text-sm"} font-semibold mb-2 text-foreground tracking-tight`}>
            {feature.title}
          </h3>
          <p className={`${isLarge ? "text-sm" : "text-xs"} text-muted-foreground leading-relaxed mb-4`}>
            {feature.description}
          </p>

          {/* Metrics */}
          <div className="flex flex-wrap gap-1.5">
            {feature.metrics.map((metric, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/60 text-muted-foreground border border-border/20 font-mono"
              >
                {metric}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.08 });

  const trustBadges = [
    { icon: CheckCircle2, text: "SOC 2 Compliant" },
    { icon: Shield, text: "Enterprise Grade" },
    { icon: Eye, text: "Privacy First" },
  ];

  return (
    <section ref={ref} className="py-24 sm:py-32 relative">
      {/* Background accent */}
      <div className="absolute inset-0 aurora-gradient pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 sm:mb-18"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-4">Capabilities</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 tracking-tight text-foreground">
            Everything You Need
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A comprehensive toolkit for understanding, analyzing, and preparing to discuss any codebase — from a 5-file script to a 50k-line monorepo.
          </p>

          <div className="flex items-center justify-center gap-6 mt-7">
            {trustBadges.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="w-3.5 h-3.5 text-success/80" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {features.map((feature, i) => (
            <BentoCard key={feature.title} feature={feature} index={i} sectionVisible={isVisible} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-14 text-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-border/40 bg-card/40 text-sm text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all cursor-pointer group">
            <Terminal className="w-4 h-4 text-primary/70" />
            <span>Paste a GitHub URL above to see it in action</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-primary/50" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
