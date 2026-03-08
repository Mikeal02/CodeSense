import { motion, useMotionValue, animate, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Star, Users, GitBranch, Zap, TrendingUp, Award, Quote, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import TextReveal from "./TextReveal";

const stats = [
  { icon: Users, value: 12400, suffix: "+", label: "Developers", color: "primary" },
  { icon: GitBranch, value: 48000, suffix: "+", label: "Repos Analyzed", color: "info" },
  { icon: Star, value: 4.9, suffix: "/5", label: "Rating", decimals: 1, color: "warning" },
  { icon: TrendingUp, value: 99, suffix: "%", label: "Uptime", color: "success" },
];

const AnimatedCounter = ({ value, suffix, decimals = 0, animate: shouldAnimate }: { value: number; suffix: string; decimals?: number; animate: boolean }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);

  useEffect(() => {
    if (!shouldAnimate) return;
    const controls = animate(motionVal, value, {
      duration: 2.5,
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
  { name: "Sarah Chen", role: "Senior Engineer @ Stripe", text: "CodeSense saved me 10+ hours during onboarding. The interview prep mode is genuinely brilliant.", avatar: "SC", accent: "primary" },
  { name: "Marcus Rodrigues", role: "CTO @ Fintech Startup", text: "We use this for every new hire. It maps complex codebases faster than any tool I've seen.", avatar: "MR", accent: "accent" },
  { name: "Yuki Tanaka", role: "Staff Engineer @ Google", text: "The dependency graph alone is worth it. Pair it with the AI chat and you have a superpower.", avatar: "YT", accent: "info" },
];

const logos = [
  "Google", "Microsoft", "Meta", "Amazon", "Netflix", "Stripe", "Vercel", "GitHub", "Shopify", "Figma",
];

const SocialProofSection = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: testimonialsRef, isVisible: testimonialsVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background pointer-events-none" />
      <div className="absolute inset-0 aurora-gradient opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Trusted-by marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-18 sm:mb-24"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mb-8">
            <TextReveal delay={0.1}>Trusted by engineers at</TextReveal>
          </p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <motion.div
              className="flex gap-12 sm:gap-20"
              animate={{ x: [0, -1200] }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            >
              {[...logos, ...logos, ...logos].map((logo, i) => (
                <span
                  key={i}
                  className="text-sm sm:text-base font-semibold text-muted-foreground/25 whitespace-nowrap select-none tracking-wide"
                >
                  {logo}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mb-18 sm:mb-24">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={statsVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center p-6 sm:p-7 rounded-2xl bento-card group"
            >
              <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-secondary/40 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                <stat.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1.5 font-mono tracking-tight">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} animate={statsVisible} />
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div ref={testimonialsRef}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={testimonialsVisible ? { opacity: 1 } : { opacity: 0 }}
            className="text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mb-8"
          >
            <TextReveal delay={0.05}>What developers say</TextReveal>
          </motion.p>
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.name} testimonial={t} index={i} isVisible={testimonialsVisible} />
            ))}
          </div>
        </div>

        {/* Award badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.5 }}
          className="mt-14 sm:mt-18 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl glass-ultra border border-primary/15">
            <Award className="w-5 h-5 text-primary" />
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
