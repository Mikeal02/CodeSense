import { useState, useEffect, useCallback, useRef } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem("codesense_theme") as Theme | null;
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  const toggleOriginRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("codesense_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback((e?: React.MouseEvent | MouseEvent) => {
    const origin = e
      ? { x: e.clientX, y: e.clientY }
      : { x: window.innerWidth / 2, y: 0 };

    toggleOriginRef.current = origin;

    // Use View Transitions API if available for circular reveal
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(prev => prev === "dark" ? "light" : "dark");
      });

      // Apply the circular clip-path via CSS custom properties
      const maxDim = Math.max(window.innerWidth, window.innerHeight) * 2;
      document.documentElement.style.setProperty("--reveal-x", `${origin.x}px`);
      document.documentElement.style.setProperty("--reveal-y", `${origin.y}px`);
      document.documentElement.style.setProperty("--reveal-size", `${maxDim}px`);
    } else {
      setTheme(prev => prev === "dark" ? "light" : "dark");
    }
  }, []);

  const isDarkMode = theme === "dark";

  return {
    theme,
    setTheme,
    toggleTheme,
    isDarkMode,
  };
}
