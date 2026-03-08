import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: "circle" | "rect" | "star";
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--info))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--accent) / 0.7)",
];

const ConfettiExplosion = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate particles from center
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.35;
    const particles: Particle[] = [];

    for (let i = 0; i < 120; i++) {
      const angle = (Math.PI * 2 * i) / 120 + (Math.random() - 0.5) * 0.5;
      particles.push({
        id: i,
        x: cx,
        y: cy,
        angle,
        velocity: 4 + Math.random() * 12,
        size: 3 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        shape: (["circle", "rect", "star"] as const)[Math.floor(Math.random() * 3)],
      });
    }
    particlesRef.current = particles;

    let frame = 0;
    const gravity = 0.15;
    const friction = 0.985;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      let alive = false;
      for (const p of particles) {
        p.x += Math.cos(p.angle) * p.velocity;
        p.y += Math.sin(p.angle) * p.velocity + gravity * frame * 0.05;
        p.velocity *= friction;
        p.rotation += p.rotationSpeed;

        const alpha = Math.max(0, 1 - frame / 90);
        if (alpha <= 0) continue;
        alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "rect") {
          ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
        } else {
          // star
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            const a = (s * Math.PI * 2) / 5 - Math.PI / 2;
            const r = s % 2 === 0 ? p.size : p.size * 0.4;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (alive && frame < 100) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.canvas
          ref={canvasRef}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
};

export default ConfettiExplosion;
