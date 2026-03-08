import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type IllustrationType = "no-repo" | "no-results" | "empty-chat" | "no-bookmarks" | "no-conversations" | "error" | "no-data" | "loading-failed";

interface EmptyStateProps {
  type: IllustrationType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { delay: i * 0.15, duration: 0.8, ease }, opacity: { delay: i * 0.15, duration: 0.3 } },
  }),
};

const NoRepoIllustration = () => (
  <motion.svg viewBox="0 0 120 120" className="w-28 h-28" initial="hidden" animate="visible">
    {/* Folder body */}
    <motion.rect x="20" y="38" width="80" height="56" rx="6" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" variants={draw} custom={0} />
    {/* Folder tab */}
    <motion.path d="M20 44V38a6 6 0 0 1 6-6h18l6 6" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" variants={draw} custom={0.5} />
    {/* Connection dots */}
    <motion.circle cx="60" cy="66" r="3" fill="hsl(var(--primary))" variants={draw} custom={1} />
    <motion.circle cx="44" cy="78" r="2" fill="hsl(var(--accent))" variants={draw} custom={1.2} />
    <motion.circle cx="76" cy="78" r="2" fill="hsl(var(--accent))" variants={draw} custom={1.4} />
    {/* Connection lines */}
    <motion.line x1="60" y1="66" x2="44" y2="78" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1" variants={draw} custom={1.6} />
    <motion.line x1="60" y1="66" x2="76" y2="78" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1" variants={draw} custom={1.8} />
    {/* Plus icon */}
    <motion.line x1="55" y1="54" x2="65" y2="54" stroke="hsl(var(--primary) / 0.5)" strokeWidth="1.5" strokeLinecap="round" variants={draw} custom={2} />
    <motion.line x1="60" y1="49" x2="60" y2="59" stroke="hsl(var(--primary) / 0.5)" strokeWidth="1.5" strokeLinecap="round" variants={draw} custom={2.2} />
    {/* Ambient orbit */}
    <motion.circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--primary) / 0.06)" strokeWidth="1" strokeDasharray="4 6" variants={draw} custom={0.2} />
  </motion.svg>
);

const NoResultsIllustration = () => (
  <motion.svg viewBox="0 0 120 120" className="w-28 h-28" initial="hidden" animate="visible">
    {/* Magnifying glass */}
    <motion.circle cx="52" cy="52" r="22" fill="none" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="2" variants={draw} custom={0} />
    <motion.line x1="68" y1="68" x2="90" y2="90" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="3" strokeLinecap="round" variants={draw} custom={0.5} />
    {/* X inside */}
    <motion.line x1="44" y1="44" x2="60" y2="60" stroke="hsl(var(--destructive) / 0.5)" strokeWidth="2" strokeLinecap="round" variants={draw} custom={1} />
    <motion.line x1="60" y1="44" x2="44" y2="60" stroke="hsl(var(--destructive) / 0.5)" strokeWidth="2" strokeLinecap="round" variants={draw} custom={1.2} />
    {/* Sparkles */}
    <motion.circle cx="30" cy="30" r="1.5" fill="hsl(var(--primary) / 0.3)" variants={draw} custom={1.5} />
    <motion.circle cx="85" cy="35" r="1" fill="hsl(var(--accent) / 0.3)" variants={draw} custom={1.7} />
  </motion.svg>
);

const EmptyChatIllustration = () => (
  <motion.svg viewBox="0 0 120 120" className="w-28 h-28" initial="hidden" animate="visible">
    {/* Chat bubble 1 */}
    <motion.rect x="15" y="30" width="55" height="30" rx="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" variants={draw} custom={0} />
    <motion.path d="M30 60L25 72L40 60" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" variants={draw} custom={0.3} />
    {/* Lines in bubble */}
    <motion.line x1="25" y1="40" x2="55" y2="40" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" strokeLinecap="round" variants={draw} custom={0.6} />
    <motion.line x1="25" y1="48" x2="45" y2="48" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1.5" strokeLinecap="round" variants={draw} custom={0.8} />
    {/* Chat bubble 2 */}
    <motion.rect x="50" y="55" width="55" height="25" rx="8" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5" variants={draw} custom={1} />
    <motion.path d="M90 80L95 90L80 80" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5" variants={draw} custom={1.3} />
    {/* Dots in bubble 2 */}
    <motion.circle cx="68" cy="67" r="2" fill="hsl(var(--accent) / 0.4)" variants={draw} custom={1.5} />
    <motion.circle cx="77" cy="67" r="2" fill="hsl(var(--accent) / 0.3)" variants={draw} custom={1.7} />
    <motion.circle cx="86" cy="67" r="2" fill="hsl(var(--accent) / 0.2)" variants={draw} custom={1.9} />
    {/* Code brackets */}
    <motion.text x="60" y="24" fontSize="14" fill="hsl(var(--primary) / 0.15)" fontFamily="monospace" variants={draw} custom={2}>{"{ }"}</motion.text>
  </motion.svg>
);

const NoBookmarksIllustration = () => (
  <motion.svg viewBox="0 0 120 120" className="w-28 h-28" initial="hidden" animate="visible">
    <motion.path d="M40 25h40v70l-20-15-20 15V25z" fill="none" stroke="hsl(var(--warning))" strokeWidth="2" variants={draw} custom={0} />
    <motion.line x1="50" y1="45" x2="70" y2="45" stroke="hsl(var(--warning) / 0.3)" strokeWidth="1.5" strokeLinecap="round" variants={draw} custom={0.8} />
    <motion.line x1="50" y1="55" x2="65" y2="55" stroke="hsl(var(--warning) / 0.2)" strokeWidth="1.5" strokeLinecap="round" variants={draw} custom={1} />
    <motion.circle cx="60" cy="65" r="1.5" fill="hsl(var(--warning) / 0.3)" variants={draw} custom={1.5} />
  </motion.svg>
);

const ErrorIllustration = () => (
  <motion.svg viewBox="0 0 120 120" className="w-28 h-28" initial="hidden" animate="visible">
    <motion.circle cx="60" cy="60" r="35" fill="none" stroke="hsl(var(--destructive) / 0.4)" strokeWidth="2" variants={draw} custom={0} />
    <motion.line x1="48" y1="48" x2="72" y2="72" stroke="hsl(var(--destructive))" strokeWidth="2.5" strokeLinecap="round" variants={draw} custom={0.5} />
    <motion.line x1="72" y1="48" x2="48" y2="72" stroke="hsl(var(--destructive))" strokeWidth="2.5" strokeLinecap="round" variants={draw} custom={0.7} />
    <motion.circle cx="60" cy="60" r="44" fill="none" stroke="hsl(var(--destructive) / 0.1)" strokeWidth="1" strokeDasharray="3 5" variants={draw} custom={1} />
  </motion.svg>
);

const NoDataIllustration = () => (
  <motion.svg viewBox="0 0 120 120" className="w-28 h-28" initial="hidden" animate="visible">
    <motion.rect x="25" y="35" width="70" height="50" rx="6" fill="none" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1.5" variants={draw} custom={0} />
    <motion.line x1="40" y1="50" x2="80" y2="50" stroke="hsl(var(--muted-foreground) / 0.15)" strokeWidth="1.5" strokeLinecap="round" variants={draw} custom={0.5} />
    <motion.line x1="40" y1="58" x2="70" y2="58" stroke="hsl(var(--muted-foreground) / 0.1)" strokeWidth="1.5" strokeLinecap="round" variants={draw} custom={0.7} />
    <motion.line x1="40" y1="66" x2="60" y2="66" stroke="hsl(var(--muted-foreground) / 0.07)" strokeWidth="1.5" strokeLinecap="round" variants={draw} custom={0.9} />
    <motion.circle cx="60" cy="60" r="48" fill="none" stroke="hsl(var(--muted-foreground) / 0.04)" strokeWidth="1" strokeDasharray="3 5" variants={draw} custom={0.2} />
  </motion.svg>
);

const LoadingFailedIllustration = () => (
  <motion.svg viewBox="0 0 120 120" className="w-28 h-28" initial="hidden" animate="visible">
    <motion.path d="M60 25L95 85H25Z" fill="none" stroke="hsl(var(--warning))" strokeWidth="2" strokeLinejoin="round" variants={draw} custom={0} />
    <motion.line x1="60" y1="48" x2="60" y2="64" stroke="hsl(var(--warning))" strokeWidth="2.5" strokeLinecap="round" variants={draw} custom={0.5} />
    <motion.circle cx="60" cy="73" r="2" fill="hsl(var(--warning))" variants={draw} custom={0.8} />
    <motion.circle cx="60" cy="60" r="46" fill="none" stroke="hsl(var(--warning) / 0.06)" strokeWidth="1" strokeDasharray="4 6" variants={draw} custom={0.2} />
  </motion.svg>
);

const illustrations: Record<IllustrationType, React.FC> = {
  "no-repo": NoRepoIllustration,
  "no-results": NoResultsIllustration,
  "empty-chat": EmptyChatIllustration,
  "no-bookmarks": NoBookmarksIllustration,
  "no-conversations": EmptyChatIllustration,
  "error": ErrorIllustration,
  "no-data": NoDataIllustration,
  "loading-failed": LoadingFailedIllustration,
};

const EmptyState = ({ type, title, description, action, className }: EmptyStateProps) => {
  const Illustration = illustrations[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex flex-col items-center justify-center text-center px-6 py-10", className)}
    >
      <div className="mb-5 relative">
        <Illustration />
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl -z-10" />
      </div>
      <h4 className="text-base font-semibold text-foreground mb-1.5">{title}</h4>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-4 leading-relaxed">{description}</p>
      )}
      {action}
    </motion.div>
  );
};

export default EmptyState;
