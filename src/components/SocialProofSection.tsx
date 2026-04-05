import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Star, Users, GitBranch, TrendingUp, Award, Quote } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const stats = [
  { icon: Users, value: 12400, suffix: "+", label: "Developers", decimals: 0 },
  { icon: GitBranch, value: 48000, suffix: "+", label: "Repos Analyzed", decimals: 0 },
  { icon: Star, value: 4.9, suffix: "/5", label: "Rating", decimals: 1 },
  { icon: TrendingUp, value: 99, suffix: "%", label: "Uptime", decimals: 0 },
];

const AnimatedCounter = ({ value, suffix, decimals = 0, animate: shouldAnimate }: { value: number; suffix: string; decimals?: number; animate: boolean }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);

  useEffect(() => {
    if (!shouldAnimate) return;
    const controls = animate(motionVal, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = decimals > 0
            ? v.toFixed(decimals) + suffix
            : Math.floor(v).toLocaleString() + suffix;
        }
      },
    });
    return () => controls.stop();
  }, [shouldAnimate, value, suffix, decimals]);

  return <span ref={ref}>0</span>;
};

const testimonials = [
  { name: "Sarah Chen", role: "Senior Engineer @ Stripe", text: "CodeSense saved me 10+ hours during onboarding. The interview prep mode is genuinely brilliant.", avatar: "SC" },
  { name: "Marcus Rodrigues", role: "CTO @ Fintech Startup", text: "We use this for every new hire. It maps complex codebases faster than any tool I've seen.", avatar: "MR" },
  { name: "Yuki Tanaka", role: "Staff Engineer @ Google", text: "The dependency graph alone is worth it. Pair it with the AI chat and you have a superpower.", avatar: "YT" },
];

const logos = ["Google", "Microsoft", "Meta", "Amazon", "Netflix", "Stripe", "Vercel", "GitHub", "Shopify", "Figma"];

const SocialProofSection = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: testimonialsRef, isVisible: testimonialsVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.015] to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Logo marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 sm:mb-24"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-8 font-medium">
            Trusted by engineers at
          </p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <motion.div
              className="flex gap-16 sm:gap-24"
              animate={{ x: [0, -1200] }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            >
              {[...logos, ...logos, ...logos].map((logo, i) => (
                <span key={i} className="text-sm font-semibold text-muted-foreground/15 whitespace-nowrap select-none tracking-widest uppercase">
                  {logo}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats */}
        <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-20 sm:mb-24">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={statsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center p-6 sm:p-8 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm group hover:border-border/50 hover:bg-card/50 transition-all duration-300"
            >
              <div className="w-10 h-10 mx-auto mb-4 rounded-lg bg-primary/[0.06] border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <stat.icon className="w-5 h-5 text-primary/70" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1.5 font-mono tracking-tight">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} animate={statsVisible} />
              </div>
              <p className="text-xs text-muted-foreground/70">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div ref={testimonialsRef}>
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-10 font-medium">
            What developers say
          </p>
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                animate={testimonialsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 sm:p-7 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm hover:border-border/50 hover:bg-card/40 transition-all duration-300 group"
              >
                <Quote className="w-5 h-5 text-primary/15 mb-5 group-hover:text-primary/25 transition-colors" />
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-warning/80 text-warning/80" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-border/20">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground/60">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Award */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-14 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm">
            <Award className="w-5 h-5 text-warning/70" />
            <span className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">#1 Developer Tool</span> — ProductHunt, 2025
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;
