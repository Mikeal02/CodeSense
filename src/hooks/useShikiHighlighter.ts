import { useState, useEffect, useRef } from "react";
import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;
let cachedHighlighter: Highlighter | null = null;

// LRU-style result cache to avoid re-highlighting unchanged files
const htmlCache = new Map<string, string>();
const MAX_CACHE = 100;

const SUPPORTED_LANGS = [
  "typescript", "tsx", "javascript", "jsx", "python", "java", "go", "rust",
  "css", "scss", "html", "json", "markdown", "yaml", "toml", "sql",
  "shellscript", "ruby", "php", "swift", "kotlin", "c", "cpp",
  "vue", "svelte", "xml", "graphql",
] as const;

const EXT_TO_LANG: Record<string, string> = {
  ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
  py: "python", java: "java", go: "go", rs: "rust", css: "css", scss: "scss",
  html: "html", json: "json", md: "markdown", yaml: "yaml", yml: "yaml",
  toml: "toml", sql: "sql", sh: "shellscript", bash: "shellscript",
  rb: "ruby", php: "php", swift: "swift", kt: "kotlin", c: "c", cpp: "cpp",
  vue: "vue", svelte: "svelte", xml: "xml", graphql: "graphql",
};

function getHighlighter(): Promise<Highlighter> {
  if (cachedHighlighter) return Promise.resolve(cachedHighlighter);
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["catppuccin-mocha"],
      langs: [...SUPPORTED_LANGS],
    }).then(h => {
      cachedHighlighter = h;
      return h;
    });
  }
  return highlighterPromise;
}

export function getLangFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  return EXT_TO_LANG[ext] || "text";
}

export function useShikiHighlighter(code: string, filePath: string) {
  const [html, setHtml] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const prevKey = useRef("");

  useEffect(() => {
    const lang = getLangFromPath(filePath);
    const key = `${lang}::${code.length}::${code.slice(0, 200)}`;
    if (key === prevKey.current) return;
    prevKey.current = key;

    // Check result cache first
    const cached = htmlCache.get(key);
    if (cached) {
      setHtml(cached);
      setIsReady(true);
      return;
    }

    let cancelled = false;
    getHighlighter().then(highlighter => {
      if (cancelled) return;
      try {
        const result = highlighter.codeToHtml(code, {
          lang: SUPPORTED_LANGS.includes(lang as any) ? lang : "text",
          theme: "catppuccin-mocha",
        });
        // Store in cache with eviction
        if (htmlCache.size >= MAX_CACHE) {
          const firstKey = htmlCache.keys().next().value;
          if (firstKey) htmlCache.delete(firstKey);
        }
        htmlCache.set(key, result);
        setHtml(result);
        setIsReady(true);
      } catch {
        setHtml("");
        setIsReady(false);
      }
    });
    return () => { cancelled = true; };
  }, [code, filePath]);

  return { html, isReady };
}
