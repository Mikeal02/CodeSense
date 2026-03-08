import { useEffect, useRef } from "react";

const chars = "01{}[]()<>/*#@$%^&|~;:,.=+-_abcdefghijklmnopqrstuvwxyz";

interface CodeDrop {
  x: number;
  y: number;
  speed: number;
  char: string;
  opacity: number;
  size: number;
  switchTimer: number;
}

const CodeRainCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const dropsRef = useRef<CodeDrop[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    // Initialize drops
    const columnCount = Math.floor(w() / 18);
    dropsRef.current = Array.from({ length: columnCount }, (_, i) => ({
      x: i * 18 + 9,
      y: Math.random() * h(),
      speed: 0.3 + Math.random() * 0.8,
      char: chars[Math.floor(Math.random() * chars.length)],
      opacity: 0.1 + Math.random() * 0.3,
      size: 10 + Math.random() * 4,
      switchTimer: Math.random() * 60,
    }));

    const isDark = () =>
      document.documentElement.classList.contains("dark") ||
      !document.documentElement.classList.contains("light");

    const draw = () => {
      ctx.clearRect(0, 0, w(), h());
      const dark = isDark();
      const baseColor = dark ? "172, 66%, 50%" : "172, 66%, 38%";

      for (const drop of dropsRef.current) {
        drop.y += drop.speed;
        drop.switchTimer -= 1;

        if (drop.switchTimer <= 0) {
          drop.char = chars[Math.floor(Math.random() * chars.length)];
          drop.switchTimer = 20 + Math.random() * 40;
        }

        if (drop.y > h()) {
          drop.y = -20;
          drop.speed = 0.3 + Math.random() * 0.8;
          drop.opacity = 0.1 + Math.random() * 0.3;
        }

        ctx.font = `${drop.size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `hsla(${baseColor}, ${drop.opacity})`;
        ctx.fillText(drop.char, drop.x, drop.y);
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="code-rain-container w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default CodeRainCanvas;
