import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Brain, Lock, Code2, Globe, Layers, Cpu, ArrowRight, Terminal, CheckCircle2, Eye } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  { icon: Brain, title: "AI-Powered Analysis", description: "Deep understanding using advanced language models with multi-modal reasoning across your entire codebase.", span: "col-span-1 sm:col-span-2 lg:col-span-2", size: "large", metrics: ["2M+ tokens", "99.8% accuracy", "< 3s avg"] },
  { icon: Zap, title: "Instant Insights", description: "Streaming responses with intelligent caching.", span: "col-span-1", size: "small", metrics: ["Real-time"] },
  { icon: Shield, title: "Interview Ready", description: "First-person explanations with Q&A generation.", span: "col-span-1", size: "small", metrics: ["500+ Q&A"] },
  { icon: Lock, title: "Private & Secure", description: "Your code is processed in real-time and never permanently stored.", span: "col-span-1", size: "small", metrics: ["Zero storage"] },
  { icon: Layers, title: "Deep Code Metrics", description: "Complexity analysis, coupling detection, dependency graphs, and file statistics for any codebase.", span: "col-span-1 sm:col-span-2 lg:col-span-2", size: "large", metrics: ["50+ metrics", "Visual graphs", "LOC analysis"] },
  { icon: Code2, title: "Full IDE Experience", description: "Split view, file tree, syntax highlighting, and shortcuts.", span: "col-span-1", size: "small", metrics: ["CMD+K"] },
  { icon: Globe, title: "GitHub Integration", description: "Direct repo connection with branch detection.", span: "col-span-1", size: "small", metrics: ["OAuth"] },
  { icon: Cpu, title: "Performance Monitoring", description: "Track analysis speed and optimize workflow.", span: "col-span-1", size: "small", metrics: ["Live stats"] },
];

const BentoCard = ({ feature, index, sectionVisible }: { feature: typeof features[0]; index: number; sectionVisible: boolean }) => {
  const [hovered, setHovered] = useState(false);
  const isLarge = feature.size === "large";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={sectionVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative cursor-default ${feature.span}`}
    >
      <div className={`
        bento-card transition-all duration-300
        ${isLarge ? "p-6 sm:p-8" : "p-5 sm:p-6"}
        ${hovered ? "border-primary/30" : ""}
      `}>
        {/* Icon */}
        <div className={`
          ${isLarge ? "w-12 h-12" : "w-10 h-10"} 
          rounded-lg flex items-center justify-center mb-4 transition-colors duration-300
          ${hovered ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}
        `}>
          <feature.icon className={`${isLarge ? "w-6 h-6" : "w-5 h-5"}`} />
        </div>

        <h3 className={`${isLarge ? "text-base sm:text-lg" : "text-sm"} font-semibold mb-2 text-foreground tracking-tight`}>
          {feature.title}
        </h3>
        <p className={`${isLarge ? "text-sm" : "text-xs"} text-muted-foreground leading-relaxed mb-3`}>
          {feature.description}
        </p>

        {/* Metrics */}
        <div className="flex flex-wrap gap-1.5">
          {feature.metrics.map((metric, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/30"
            >
              {metric}
            </span>
          ))}
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
    <section ref={ref} className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-4">Capabilities</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 tracking-tight text-foreground">
            Everything You Need
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A comprehensive toolkit for understanding, analyzing, and preparing to discuss any codebase — from a 5-file script to a 50k-line monorepo.
          </p>

          <div className="flex items-center justify-center gap-5 mt-6">
            {trustBadges.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="w-3.5 h-3.5 text-success" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <BentoCard key={feature.title} feature={feature} index={i} sectionVisible={isVisible} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-pointer group">
            <Terminal className="w-4 h-4 text-primary" />
            <span>Paste a GitHub URL above to see it in action</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
