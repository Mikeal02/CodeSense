import { motion } from "framer-motion";

const TypingWave = () => (
  <div className="flex items-center gap-1.5 py-1">
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/40 border border-border/20">
      <motion.div
        className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="text-[8px] font-bold text-primary-foreground">AI</span>
      </motion.div>
      <div className="typing-wave flex gap-[3px]">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block" />
      </div>
      <span className="text-[10px] text-muted-foreground/50 ml-1">thinking...</span>
    </div>
  </div>
);

export default TypingWave;
