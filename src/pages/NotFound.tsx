import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, ArrowLeft, Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
      <motion.div
        className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.1), transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg mx-4 relative z-10"
      >
        {/* Glitchy 404 */}
        <motion.div
          className="mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="relative inline-block">
            <h1 className="text-[120px] sm:text-[160px] font-bold font-mono leading-none text-gradient select-none">
              404
            </h1>
            <motion.div
              className="absolute inset-0 text-[120px] sm:text-[160px] font-bold font-mono leading-none text-primary/10 select-none"
              animate={{ x: [-2, 2, -1, 0], y: [1, -1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              404
            </motion.div>
          </div>
        </motion.div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-xs font-mono text-muted-foreground mb-4">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span>Route not found: <span className="text-destructive">{location.pathname}</span></span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <ArrowLeft className="w-4 h-4" />
              Back to CodeSense
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Zap className="w-4 h-4" />
              Analyze a Repo
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
