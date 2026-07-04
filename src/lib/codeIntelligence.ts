// Elite in-browser static code intelligence.
// Zero deps, pure functions, memo-friendly. Works on any language subset
// but leans on JS/TS heuristics for the deepest signals.

export interface RawFile {
  path: string;
  content: string;
}

export interface FileMetric {
  path: string;
  name: string;
  folder: string;
  ext: string;
  language: string;
  lines: number;
  sloc: number;         // source lines (non-blank, non-comment)
  chars: number;
  imports: string[];    // resolved module ids (relative + package)
  exports: string[];    // top-level named exports
  hasDefaultExport: boolean;
  functions: number;
  classes: number;
  hooks: number;        // React hooks usage
  jsxElements: number;
  todos: number;
  maxIndent: number;    // deepest indent depth (proxy for nesting)
  complexity: number;   // cyclomatic-ish (branches + jumps + boolean ops)
  duplicationHash: string; // fingerprint for near-duplicate detection
  score: number;        // aggregate risk score 0-100 (higher = riskier)
}

export interface DependencyEdge {
  from: string;
  to: string;
  external: boolean;
}

export interface CircularDependency {
  cycle: string[];
}

export interface DuplicateGroup {
  fingerprint: string;
  files: string[];
  size: number;
}

export interface Insight {
  id: string;
  severity: "info" | "warn" | "error";
  title: string;
  detail: string;
  files?: string[];
  confidence: number; // 0-1
}

export interface CodeIntelligence {
  files: FileMetric[];
  totals: {
    files: number;
    lines: number;
    sloc: number;
    chars: number;
    functions: number;
    classes: number;
    hooks: number;
    imports: number;
    exports: number;
    todos: number;
  };
  languages: { name: string; files: number; lines: number; sloc: number }[];
  folders: { name: string; files: number; lines: number }[];
  entryPoints: string[];
  configFiles: string[];
  dependencies: {
    internal: DependencyEdge[];
    external: string[];       // package names
    externalCounts: { name: string; count: number }[];
    fanIn: Record<string, number>;
    fanOut: Record<string, number>;
  };
  circular: CircularDependency[];
  hotspots: FileMetric[];       // top risk files
  duplicates: DuplicateGroup[]; // near-duplicate clusters
  unusedExports: { file: string; name: string }[];
  insights: Insight[];
  health: {
    score: number;              // 0-100, higher = healthier
    grade: "A+" | "A" | "B" | "C" | "D" | "F";
    breakdown: { label: string; value: number; weight: number }[];
  };
}

const LANG_MAP: Record<string, string> = {
  ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript",
  mjs: "JavaScript", cjs: "JavaScript",
  py: "Python", rb: "Ruby", go: "Go", rs: "Rust", java: "Java", kt: "Kotlin",
  css: "CSS", scss: "SCSS", less: "Less", html: "HTML", vue: "Vue", svelte: "Svelte",
  json: "JSON", md: "Markdown", yaml: "YAML", yml: "YAML", toml: "TOML",
  sql: "SQL", graphql: "GraphQL", gql: "GraphQL",
};

const CONFIG_HINTS = [
  "package.json", "tsconfig", "vite.config", "next.config", "webpack.config",
  "tailwind.config", "postcss.config", "babel.config", "eslint", "prettier",
  "jest.config", "vitest.config", "playwright.config", "cargo.toml", "go.mod",
  "pyproject.toml", "requirements.txt", "pom.xml", "gradle", ".env",
];

const ENTRY_HINTS = [
  "main.ts", "main.tsx", "main.js", "main.jsx", "index.ts", "index.tsx",
  "index.js", "index.jsx", "App.tsx", "App.ts", "app.tsx",
  "server.ts", "server.js", "app.py", "main.py", "main.go", "main.rs",
];

const COMMENT_RE = /(^\s*\/\/)|(^\s*#)|(^\s*\/\*)|(^\s*\*)/;

function getExt(path: string): string {
  const m = path.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "";
}

function getLanguage(path: string): string {
  return LANG_MAP[getExt(path)] || "Other";
}

function isConfig(path: string): boolean {
  const lower = path.toLowerCase();
  return CONFIG_HINTS.some((h) => lower.includes(h));
}

function isEntry(path: string): boolean {
  const name = path.split("/").pop() || "";
  return ENTRY_HINTS.includes(name);
}

function parseImports(content: string): string[] {
  const results: string[] = [];
  const re1 = /import\s+(?:[^"'`;]+?\s+from\s+)?["']([^"']+)["']/g;
  const re2 = /require\(\s*["']([^"']+)["']\s*\)/g;
  const re3 = /^\s*from\s+([\w.]+)\s+import\s+/gm;
  let m: RegExpExecArray | null;
  while ((m = re1.exec(content))) results.push(m[1]);
  while ((m = re2.exec(content))) results.push(m[1]);
  while ((m = re3.exec(content))) results.push(m[1]);
  return results;
}

function parseExports(content: string): { names: string[]; hasDefault: boolean } {
  const names = new Set<string>();
  let hasDefault = false;
  const namedRe = /export\s+(?:const|let|var|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g;
  const listRe = /export\s*\{\s*([^}]+)\s*\}/g;
  const defRe = /export\s+default\b/;
  let m: RegExpExecArray | null;
  while ((m = namedRe.exec(content))) names.add(m[1]);
  while ((m = listRe.exec(content))) {
    m[1].split(",").forEach((raw) => {
      const clean = raw.trim().split(/\s+as\s+/i)[0].trim();
      if (clean) names.add(clean);
    });
  }
  if (defRe.test(content)) hasDefault = true;
  return { names: [...names], hasDefault };
}

function cyclomaticApprox(content: string): number {
  const patterns = [
    /\bif\s*\(/g, /\belse\s+if\b/g, /\bfor\s*\(/g, /\bwhile\s*\(/g,
    /\bcase\s+/g, /\bcatch\s*\(/g, /\?\s*[^:]+:/g, /&&|\|\|/g, /\breturn\b/g,
  ];
  let n = 1;
  for (const p of patterns) n += (content.match(p) || []).length;
  return n;
}

function fingerprint(content: string): string {
  // Normalize whitespace + identifiers to catch near-duplicates.
  const norm = content
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/["'`][^"'`]*["'`]/g, "S")
    .replace(/\b\d+\b/g, "N")
    .replace(/\s+/g, " ")
    .trim();
  // 32-bit rolling hash
  let h = 2166136261 >>> 0;
  for (let i = 0; i < norm.length; i++) {
    h ^= norm.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `${norm.length}:${(h >>> 0).toString(36)}`;
}

function resolveInternal(fromPath: string, spec: string, allPaths: Set<string>): string | null {
  if (!spec.startsWith(".") && !spec.startsWith("/") && !spec.startsWith("@/")) return null;
  let base: string;
  if (spec.startsWith("@/")) {
    base = "src/" + spec.slice(2);
  } else if (spec.startsWith("/")) {
    base = spec.slice(1);
  } else {
    const parts = fromPath.split("/");
    parts.pop();
    const segs = spec.split("/");
    for (const s of segs) {
      if (s === "..") parts.pop();
      else if (s !== ".") parts.push(s);
    }
    base = parts.join("/");
  }
  const candidates = [
    base,
    `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`,
    `${base}/index.ts`, `${base}/index.tsx`, `${base}/index.js`, `${base}/index.jsx`,
    `${base}.css`, `${base}.scss`, `${base}.json`,
  ];
  for (const c of candidates) if (allPaths.has(c)) return c;
  return null;
}

function packageOf(spec: string): string | null {
  if (spec.startsWith(".") || spec.startsWith("/") || spec.startsWith("@/")) return null;
  if (spec.startsWith("@")) {
    const parts = spec.split("/");
    return parts.slice(0, 2).join("/");
  }
  return spec.split("/")[0];
}

function findCycles(edges: DependencyEdge[]): CircularDependency[] {
  const graph = new Map<string, string[]>();
  for (const e of edges) {
    if (!graph.has(e.from)) graph.set(e.from, []);
    graph.get(e.from)!.push(e.to);
  }
  const cycles: CircularDependency[] = [];
  const seen = new Set<string>();
  const stack: string[] = [];
  const onStack = new Set<string>();

  const dfs = (node: string) => {
    if (onStack.has(node)) {
      const idx = stack.indexOf(node);
      if (idx >= 0) {
        const cycle = stack.slice(idx).concat(node);
        const key = [...cycle].sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push({ cycle });
        }
      }
      return;
    }
    if (seen.has("v:" + node)) return;
    stack.push(node);
    onStack.add(node);
    for (const n of graph.get(node) || []) dfs(n);
    stack.pop();
    onStack.delete(node);
    seen.add("v:" + node);
  };

  for (const n of graph.keys()) dfs(n);
  return cycles.slice(0, 20);
}

export function analyzeCodebase(rawFiles: RawFile[]): CodeIntelligence {
  const allPaths = new Set(rawFiles.map((f) => f.path));

  const files: FileMetric[] = rawFiles.map((f) => {
    const lines = f.content.split("\n");
    const nonBlank = lines.filter((l) => l.trim() && !COMMENT_RE.test(l));
    const importSpecs = parseImports(f.content);
    const { names: exportNames, hasDefault } = parseExports(f.content);
    const functions = (f.content.match(/\bfunction\s+[A-Za-z_$]|=>\s*[\{(]|=>\s*\w/g) || []).length;
    const classes = (f.content.match(/\bclass\s+[A-Z]/g) || []).length;
    const hooks = (f.content.match(/\buse[A-Z]\w*\s*\(/g) || []).length;
    const jsxElements = (f.content.match(/<[A-Z][A-Za-z0-9]*[\s/>]/g) || []).length;
    const todos = (f.content.match(/TODO|FIXME|XXX|HACK/g) || []).length;
    let maxIndent = 0;
    for (const line of lines) {
      const m = line.match(/^(\s+)/);
      if (!m) continue;
      const depth = m[1].replace(/\t/g, "  ").length / 2;
      if (depth > maxIndent) maxIndent = depth;
    }
    const complexity = cyclomaticApprox(f.content);
    const parts = f.path.split("/");
    const name = parts.pop() || f.path;
    const folder = parts[0] || "(root)";
    const ext = getExt(f.path);
    const language = getLanguage(f.path);

    // Risk score
    let score = 0;
    score += Math.min(40, (lines.length / 400) * 40);
    score += Math.min(30, (complexity / 60) * 30);
    score += Math.min(15, Math.max(0, maxIndent - 4) * 3);
    score += Math.min(10, todos * 2);
    score += Math.min(5, Math.max(0, importSpecs.length - 20) * 0.5);

    return {
      path: f.path,
      name,
      folder,
      ext,
      language,
      lines: lines.length,
      sloc: nonBlank.length,
      chars: f.content.length,
      imports: importSpecs,
      exports: exportNames,
      hasDefaultExport: hasDefault,
      functions,
      classes,
      hooks,
      jsxElements,
      todos,
      maxIndent,
      complexity,
      duplicationHash: fingerprint(f.content),
      score: Math.round(Math.min(100, score)),
    };
  });

  // Totals
  const totals = files.reduce(
    (a, f) => ({
      files: a.files + 1,
      lines: a.lines + f.lines,
      sloc: a.sloc + f.sloc,
      chars: a.chars + f.chars,
      functions: a.functions + f.functions,
      classes: a.classes + f.classes,
      hooks: a.hooks + f.hooks,
      imports: a.imports + f.imports.length,
      exports: a.exports + f.exports.length + (f.hasDefaultExport ? 1 : 0),
      todos: a.todos + f.todos,
    }),
    { files: 0, lines: 0, sloc: 0, chars: 0, functions: 0, classes: 0, hooks: 0, imports: 0, exports: 0, todos: 0 },
  );

  // Languages
  const langMap = new Map<string, { files: number; lines: number; sloc: number }>();
  files.forEach((f) => {
    const l = langMap.get(f.language) || { files: 0, lines: 0, sloc: 0 };
    l.files++;
    l.lines += f.lines;
    l.sloc += f.sloc;
    langMap.set(f.language, l);
  });
  const languages = [...langMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.lines - a.lines);

  // Folders
  const folderMap = new Map<string, { files: number; lines: number }>();
  files.forEach((f) => {
    const key = f.folder;
    const cur = folderMap.get(key) || { files: 0, lines: 0 };
    cur.files++;
    cur.lines += f.lines;
    folderMap.set(key, cur);
  });
  const folders = [...folderMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.files - a.files);

  const entryPoints = files.filter((f) => isEntry(f.path)).map((f) => f.path);
  const configFiles = files.filter((f) => isConfig(f.path)).map((f) => f.path);

  // Dependencies
  const internal: DependencyEdge[] = [];
  const externalCounts = new Map<string, number>();
  const fanIn: Record<string, number> = {};
  const fanOut: Record<string, number> = {};
  files.forEach((f) => {
    for (const spec of f.imports) {
      const inter = resolveInternal(f.path, spec, allPaths);
      if (inter) {
        internal.push({ from: f.path, to: inter, external: false });
        fanOut[f.path] = (fanOut[f.path] || 0) + 1;
        fanIn[inter] = (fanIn[inter] || 0) + 1;
      } else {
        const pkg = packageOf(spec);
        if (pkg) externalCounts.set(pkg, (externalCounts.get(pkg) || 0) + 1);
      }
    }
  });
  const externalCountsArr = [...externalCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Circular deps
  const circular = findCycles(internal);

  // Duplicate clusters
  const dupMap = new Map<string, string[]>();
  files.forEach((f) => {
    if (f.sloc < 20) return;
    const key = f.duplicationHash;
    const arr = dupMap.get(key) || [];
    arr.push(f.path);
    dupMap.set(key, arr);
  });
  const duplicates: DuplicateGroup[] = [...dupMap.entries()]
    .filter(([, arr]) => arr.length > 1)
    .map(([fingerprint, arr]) => ({
      fingerprint,
      files: arr,
      size: Number(fingerprint.split(":")[0]) || 0,
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  // Unused exports (only reliable when we can see the whole graph; low confidence)
  const importedNames = new Set<string>();
  files.forEach((f) => {
    const re = /import\s+(?:{([^}]+)}|(\*\s+as\s+\w+)|([A-Za-z_$][\w$]*))/g;
    let m: RegExpExecArray | null;
    const src = rawFiles.find((r) => r.path === f.path)?.content || "";
    while ((m = re.exec(src))) {
      if (m[1]) m[1].split(",").forEach((n) => importedNames.add(n.trim().split(/\s+as\s+/i)[0].trim()));
      if (m[3]) importedNames.add(m[3].trim());
    }
  });
  const unusedExports: { file: string; name: string }[] = [];
  files.forEach((f) => {
    for (const n of f.exports) {
      if (!importedNames.has(n)) unusedExports.push({ file: f.path, name: n });
    }
  });

  // Hotspots (top risk)
  const hotspots = [...files].sort((a, b) => b.score - a.score).slice(0, 10);

  // Insights
  const insights: Insight[] = [];
  if (circular.length) {
    insights.push({
      id: "circular",
      severity: "error",
      title: `${circular.length} circular dependency cluster(s)`,
      detail: "Circular imports cause fragile load ordering, memory leaks, and complicate refactors.",
      files: circular.flatMap((c) => c.cycle).slice(0, 10),
      confidence: 0.9,
    });
  }
  const bigFiles = files.filter((f) => f.lines > 400);
  if (bigFiles.length) {
    insights.push({
      id: "big-files",
      severity: "warn",
      title: `${bigFiles.length} oversized file(s)`,
      detail: "Files >400 lines often violate SRP. Consider splitting by responsibility.",
      files: bigFiles.slice(0, 6).map((f) => f.path),
      confidence: 0.85,
    });
  }
  const highComplexity = files.filter((f) => f.complexity > 60);
  if (highComplexity.length) {
    insights.push({
      id: "complex",
      severity: "warn",
      title: `${highComplexity.length} highly complex file(s)`,
      detail: "Cyclomatic complexity above 60 makes code hard to test and reason about.",
      files: highComplexity.slice(0, 6).map((f) => f.path),
      confidence: 0.75,
    });
  }
  if (duplicates.length) {
    insights.push({
      id: "duplicates",
      severity: "warn",
      title: `${duplicates.length} near-duplicate cluster(s)`,
      detail: "Files share a normalized fingerprint. Extract shared logic to reduce drift.",
      files: duplicates.flatMap((d) => d.files).slice(0, 8),
      confidence: 0.6,
    });
  }
  if (unusedExports.length > 5) {
    insights.push({
      id: "unused-exports",
      severity: "info",
      title: `${unusedExports.length} potentially unused export(s)`,
      detail: "Names exported but never imported inside the analyzed set. May be true dead code or referenced dynamically.",
      files: unusedExports.slice(0, 6).map((u) => u.file),
      confidence: 0.45,
    });
  }
  if (totals.todos > 0) {
    insights.push({
      id: "todos",
      severity: "info",
      title: `${totals.todos} TODO/FIXME marker(s)`,
      detail: "Track debt markers so they don't quietly accumulate.",
      confidence: 0.95,
    });
  }
  if (!entryPoints.length) {
    insights.push({
      id: "no-entry",
      severity: "info",
      title: "No obvious entry point detected",
      detail: "Add a conventional main/index file for clearer onboarding.",
      confidence: 0.5,
    });
  }

  // Health score (0-100)
  const penalize = (v: number, cap: number) => Math.max(0, cap - Math.min(cap, v));
  const complexityScore = penalize(highComplexity.length * 4, 25);
  const sizeScore = penalize(bigFiles.length * 3, 20);
  const cycleScore = penalize(circular.length * 8, 20);
  const dupScore = penalize(duplicates.length * 4, 15);
  const debtScore = penalize(totals.todos, 10);
  const structureScore = entryPoints.length > 0 ? 10 : 4;
  const raw = complexityScore + sizeScore + cycleScore + dupScore + debtScore + structureScore;
  const score = Math.round(raw);
  const grade: CodeIntelligence["health"]["grade"] =
    score >= 92 ? "A+" : score >= 85 ? "A" : score >= 72 ? "B" : score >= 58 ? "C" : score >= 40 ? "D" : "F";

  return {
    files,
    totals,
    languages,
    folders,
    entryPoints,
    configFiles,
    dependencies: {
      internal,
      external: externalCountsArr.map((e) => e.name),
      externalCounts: externalCountsArr,
      fanIn,
      fanOut,
    },
    circular,
    hotspots,
    duplicates,
    unusedExports,
    insights,
    health: {
      score,
      grade,
      breakdown: [
        { label: "Complexity", value: complexityScore, weight: 25 },
        { label: "File size", value: sizeScore, weight: 20 },
        { label: "Cycles", value: cycleScore, weight: 20 },
        { label: "Duplication", value: dupScore, weight: 15 },
        { label: "Debt markers", value: debtScore, weight: 10 },
        { label: "Structure", value: structureScore, weight: 10 },
      ],
    },
  };
}
