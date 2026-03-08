import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Star, Users, GitBranch, Zap, TrendingUp, Award } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const stats = [
  { icon: Users, value: 12400, suffix: "+", label: "Developers" },
  { icon: GitBranch, value: 48000, suffix: "+", label: "Repos Analyzed" },
  { icon: Star, value: 4.9, suffix: "/5", label: "Rating", decimals: 1 },
  { icon: TrendingUp, value: 99, suffix: "%", label: "Uptime" },
];

const AnimatedCounter = ({ value, suffix, decimals = 0, animate: shouldAnimate }: { value: number; suffix: string; decimals?: number; animate: boolean }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);

  useEffect(() => {
    if (!shouldAnimate) return;
    const controls = animate(motionVal, value, {
      duration: 2.2,
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
  { name: "Sarah Chen", role: "Senior Engineer @ Stripe", text: "CodeSense saved me 10+ hours during onboarding. The interview prep mode is brilliant.", avatar: "SC" },
  { name: "Marcus Rodrigues", role: "CTO @ Fintech Startup", text: "We use this for every new hire. It maps complex codebases faster than any tool I've seen.", avatar: "MR" },
  { name: "Yuki Tanaka", role: "Staff Engineer @ Google", text: "The dependency graph alone is worth it. Pair it with the AI chat and you have a superpower.", avatar: "YT" },
];

const logos = [
  "Google", "Microsoft", "Meta", "Amazon", "Netflix", "Stripe", "Vercel", "GitHub", "Shopify", "Figma",
];

const SocialProofSection = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: testimonialsRef, isVisible: testimonialsVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Trusted-by marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 sm:mb-20"
        >
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
            Trusted by engineers at
          </p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <motion.div
              className="flex gap-10 sm:gap-16"
              animate={{ x: [0, -1200] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {[...logos, ...logos, ...logos].map((logo, i) => (
                <span
                  key={i}
                  className="text-sm sm:text-lg font-semibold text-muted-foreground/40 whitespace-nowrap select-none"
                >
                  {logo}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={statsVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center p-5 sm:p-6 rounded-2xl glass border border-border/30 group hover:border-primary/30 transition-all"
            >
              <stat.icon className="w-5 h-5 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 font-mono">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} animate={statsVisible} />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div ref={testimonialsRef} className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
              animate={testimonialsVisible 
                ? { opacity: 1, y: 0, filter: "blur(0px)" } 
                : { opacity: 0, y: 40, filter: "blur(4px)" }
              }
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="p-5 sm:p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/30 hover:bg-card/60 transition-all group"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-warning text-warning" />
                ))}
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed mb-4 italic">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Award badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.4 }}
          className="mt-12 sm:mt-16 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass border border-primary/20">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">#1 Developer Tool</span> — ProductHunt, 2025
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;
