import { motion } from "framer-motion";

const AuroraBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient mesh */}
      <div className="absolute inset-0 aurora-gradient" />
      
      {/* Animated aurora bands */}
      <motion.div
        className="absolute -top-[40%] left-[10%] w-[80%] h-[80%] rounded-full blur-[120px] opacity-30"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.2), transparent)" }}
        animate={{ 
          x: [0, 80, -40, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.2, 0.9, 1],
          rotate: [0, 15, -10, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full blur-[100px] opacity-20"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.5), hsl(var(--info) / 0.2), transparent)" }}
        animate={{ 
          x: [0, -60, 40, 0],
          y: [0, 40, -30, 0],
          scale: [1.1, 0.8, 1.2, 1.1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full blur-[90px] opacity-15"
        style={{ background: "radial-gradient(circle, hsl(var(--info) / 0.4), transparent)" }}
        animate={{ 
          x: [0, 50, -30, 0],
          y: [0, -40, 20, 0],
          scale: [0.9, 1.15, 1, 0.9],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />
      
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_hsl(var(--background))_100%)]" />
    </div>
  );
};

export default AuroraBackground;
