import { motion } from "framer-motion";
import { Shield, Zap, Brain, Lock, Code2, Globe, Layers, Cpu } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Deep understanding of your codebase using advanced language models with multi-modal reasoning"
  },
  {
    icon: Zap,
    title: "Instant Insights",
    description: "Get answers in seconds with streaming responses and intelligent caching"
  },
  {
    icon: Shield,
    title: "Interview Ready",
    description: "First-person explanations with Q&A generation perfect for technical interviews"
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description: "Your code is processed in real-time and never permanently stored on any server"
  },
  {
    icon: Layers,
    title: "Deep Code Metrics",
    description: "Complexity analysis, coupling detection, dependency graphs, and file statistics"
  },
  {
    icon: Code2,
    title: "Full IDE Experience",
    description: "Split view, file tree, syntax highlighting, code search, and keyboard shortcuts"
  },
  {
    icon: Globe,
    title: "GitHub Integration",
    description: "Direct repository connection with branch detection and rate limit management"
  },
  {
    icon: Cpu,
    title: "Performance Monitoring",
    description: "Track analysis speed, operation metrics, and optimize your workflow"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const FeaturesSection = () => {
  return (
    <section className="py-24 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive toolkit for understanding, analyzing, and preparing to discuss any codebase
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors group"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/50 group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-4 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
