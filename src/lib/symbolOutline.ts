// Lightweight regex-based symbol extractor for the code viewer outline.
// Supports the primary languages CodeSense targets.

export type SymbolKind = "function" | "component" | "class" | "hook" | "method" | "export" | "interface" | "type" | "const";

export interface OutlineSymbol {
  name: string;
  kind: SymbolKind;
  line: number; // 1-based
}

interface Rule {
  re: RegExp;
  kind: SymbolKind | ((name: string) => SymbolKind);
  nameGroup?: number;
}

const JS_TS_RULES: Rule[] = [
  { re: /^\s*export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/, kind: (n) => (/^[A-Z]/.test(n) ? "component" : "function") },
  { re: /^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/, kind: (n) => (/^[A-Z]/.test(n) ? "component" : "function") },
  { re: /^\s*export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/, kind: (n) => (/^[A-Z]/.test(n) ? "component" : /^use[A-Z]/.test(n) ? "hook" : "function") },
  { re: /^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/, kind: (n) => (/^[A-Z]/.test(n) ? "component" : /^use[A-Z]/.test(n) ? "hook" : "function") },
  { re: /^\s*export\s+(?:default\s+)?class\s+([A-Za-z_$][\w$]*)/, kind: "class" },
  { re: /^\s*class\s+([A-Za-z_$][\w$]*)/, kind: "class" },
  { re: /^\s*export\s+interface\s+([A-Za-z_$][\w$]*)/, kind: "interface" },
  { re: /^\s*interface\s+([A-Za-z_$][\w$]*)/, kind: "interface" },
  { re: /^\s*export\s+type\s+([A-Za-z_$][\w$]*)/, kind: "type" },
  { re: /^\s*type\s+([A-Za-z_$][\w$]*)/, kind: "type" },
  { re: /^\s*export\s+(?:const|let)\s+([A-Z_][A-Z0-9_]{2,})\s*[:=]/, kind: "const" },
];

const PY_RULES: Rule[] = [
  { re: /^\s*def\s+([A-Za-z_][\w]*)/, kind: "function" },
  { re: /^\s*async\s+def\s+([A-Za-z_][\w]*)/, kind: "function" },
  { re: /^\s*class\s+([A-Za-z_][\w]*)/, kind: "class" },
];

const GO_RULES: Rule[] = [
  { re: /^\s*func\s+(?:\([^)]*\)\s+)?([A-Za-z_][\w]*)/, kind: "function" },
  { re: /^\s*type\s+([A-Za-z_][\w]*)\s+(?:struct|interface)/, kind: "class" },
];

const RUST_RULES: Rule[] = [
  { re: /^\s*(?:pub\s+)?fn\s+([A-Za-z_][\w]*)/, kind: "function" },
  { re: /^\s*(?:pub\s+)?struct\s+([A-Za-z_][\w]*)/, kind: "class" },
  { re: /^\s*(?:pub\s+)?trait\s+([A-Za-z_][\w]*)/, kind: "interface" },
];

function rulesFor(path: string): Rule[] {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  if (["ts", "tsx", "js", "jsx", "mjs", "cjs"].includes(ext)) return JS_TS_RULES;
  if (ext === "py") return PY_RULES;
  if (ext === "go") return GO_RULES;
  if (ext === "rs") return RUST_RULES;
  return [];
}

export function extractSymbols(content: string, path: string): OutlineSymbol[] {
  const rules = rulesFor(path);
  if (!rules.length) return [];
  const out: OutlineSymbol[] = [];
  const seen = new Set<string>();
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length > 400) continue;
    for (const rule of rules) {
      const m = line.match(rule.re);
      if (m) {
        const name = m[rule.nameGroup ?? 1];
        if (!name) continue;
        const kind = typeof rule.kind === "function" ? rule.kind(name) : rule.kind;
        const key = `${name}@${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ name, kind, line: i + 1 });
        break;
      }
    }
  }
  return out;
}