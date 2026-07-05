import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  X, GitBranch, ArrowDownLeft, ArrowUpRight, Flame, Component,
  FunctionSquare, Package, AlertTriangle, Layers, Hash, Zap,
  Activity, FileCode, ChevronRight, Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeCodebase, type CodeIntelligence, type RawFile } from "@/lib/codeIntelligence";

interface FileDrilldownPanelProps {
  files: RawFile[];
  activePath: string | undefined;
  onFileSelect: (path: string) => void;
  onClose?: () => void;
  precomputed?: CodeIntelligence;
}

interface Symbol {
  kind: "component" | "function" | "hook" | "class" | "export";
  name: string;
  line: number;
}

function extractSymbols(content: string): Symbol[] {
  const lines = content.split("\n");
  const seen = new Set<string>();
  const out: Symbol[] = [];
  const push = (kind: Symbol["kind"], name: string, line: number) => {
    const k = `${kind}:${name}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ kind, name, line });
  };

  lines.forEach((raw, i) => {
    const line = raw;
    let m: RegExpExecArray | null;
    // React component: PascalCase function/const returning JSX-ish
    const compFn = /^\s*(?:export\s+(?:default\s+)?)?function\s+([A-Z]\w+)\s*\(/.exec(line);
    if (compFn) return push("component", compFn[1], i + 1);
    const compConst = /^\s*(?:export\s+)?const\s+([A-Z]\w+)\s*[:=]\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/.exec(line);
    if (compConst) return push("component", compConst[1], i + 1);
    // Hook: useXxx = / function useXxx(
    const hookFn = /^\s*(?:export\s+)?function\s+(use[A-Z]\w*)\s*\(/.exec(line);
    if (hookFn) return push("hook", hookFn[1], i + 1);
    const hookConst = /^\s*(?:export\s+)?const\s+(use[A-Z]\w*)\s*=/.exec(line);
    if (hookConst) return push("hook", hookConst[1], i + 1);
    // Class
    const cls = /^\s*(?:export\s+)?class\s+([A-Z]\w+)/.exec(line);
    if (cls) return push("class", cls[1], i + 1);
    // Regular function
    const fn = /^\s*(?:export\s+)?function\s+([a-z]\w+)\s*\(/.exec(line);
    if (fn) return push("function", fn[1], i + 1);
    const arrowFn = /^\s*(?:export\s+)?const\s+([a-z]\w+)\s*=\s*(?:async\s*)?\(?[^=]*\)?\s*=>/.exec(line);
    if (arrowFn) return push("function", arrowFn[1], i + 1);
    // Named export list
    const exp = /^\s*export\s*\{\s*([^}]+)\s*\}/.exec(line);
    if (exp) {
      exp[1].split(",").forEach((n) => {
        const clean = n.trim().split(/\s+as\s+/i)[0].trim();
        if (clean) push("export", clean, i + 1);
      });
    }
  });
  return out;
}

const symbolIcon = {
  component: <Component className="w-3 h-3" />,
  function: <FunctionSquare className="w-3 h-3" />,
  hook: <Zap className="w-3 h-3" />,
  class: <Boxes className="w-3 h-3" />,
  export: <Package className="w-3 h-3" />,
};

const symbolColor: Record<Symbol["kind"], string> = {
  component: "#89b4fa",
  function: "#a6e3a1",
  hook: "#f9e2af",
  class: "#cba6f7",
  export: "#94e2d5",
};

function riskBand(score: number): { label: string; tone: string; ring: string } {
  if (score >= 70) return { label: "Critical", tone: "text-[#f38ba8]", ring: "from-[#f38ba8]/40 to-[#eb6f92]/10" };
  if (score >= 45) return { label: "Elevated", tone: "text-[#fab387]", ring: "from-[#fab387]/40 to-[#f9e2af]/10" };
  if (score >= 20) return { label: "Moderate", tone: "text-[#f9e2af]", ring: "from-[#f9e2af]/35 to-[#a6e3a1]/10" };
  return { label: "Healthy", tone: "text-[#a6e3a1]", ring: "from-[#a6e3a1]/40 to-[#94e2d5]/10" };
}

const Metric = ({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: string; tone?: string }) => (
  <div className="rounded-md border border-[#313244]/40 bg-[#1e1e2e]/60 p-2.5">
    <div className="text-[9px] uppercase tracking-wider text-[#6c7086] font-medium">{label}</div>
    <div className={cn("text-[15px] font-mono font-semibold mt-1 tabular-nums", tone || "text-[#cdd6f4]")}>{value}</div>
    {hint && <div className="text-[10px] text-[#585b70] mt-0.5">{hint}</div>}
  </div>
);

const Section = ({ icon, title, count, children }: { icon: React.ReactNode; title: string; count?: number; children: React.ReactNode }) => (
  <div className="border-t border-[#313244]/40">
    <div className="px-3 py-2 flex items-center justify-between bg-[#181825]/40">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-[#a6adc8]">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      {typeof count === "number" && (
        <span className="text-[10px] font-mono text-[#6c7086] tabular-nums px-1.5 py-0.5 rounded bg-[#313244]/40">{count}</span>
      )}
    </div>
    <div className="p-2">{children}</div>
  </div>
);

const FileRow = ({ path, onClick, right }: { path: string; onClick?: () => void; right?: React.ReactNode }) => {
  const name = path.split("/").pop() || path;
  const dir = path.slice(0, path.length - name.length - 1);
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left group hover:bg-[#313244]/50 transition-colors"
    >
      <FileCode className="w-3 h-3 flex-shrink-0 text-[#6c7086] group-hover:text-primary" />
      <div className="min-w-0 flex-1">
        <div className="text-[11.5px] text-[#cdd6f4] truncate">{name}</div>
        {dir && <div className="text-[10px] text-[#585b70] truncate font-mono">{dir}</div>}
      </div>
      {right}
      <ChevronRight className="w-3 h-3 text-[#45475a] group-hover:text-[#a6adc8] flex-shrink-0" />
    </button>
  );
};

const FileDrilldownPanel = ({ files, activePath, onFileSelect, onClose, precomputed }: FileDrilldownPanelProps) => {
  const intel = useMemo(() => precomputed || analyzeCodebase(files), [files, precomputed]);

  const active = useMemo(
    () => intel.files.find((f) => f.path === activePath),
    [intel, activePath],
  );
  const content = useMemo(
    () => files.find((f) => f.path === activePath)?.content || "",
    [files, activePath],
  );
  const symbols = useMemo(() => (content ? extractSymbols(content) : []), [content]);

  // Callers (fan-in): files that import this file
  const callers = useMemo(() => {
    if (!activePath) return [];
    return intel.dependencies.internal
      .filter((e) => e.to === activePath)
      .map((e) => e.from);
  }, [intel, activePath]);

  // Dependencies (fan-out): files this file imports
  const deps = useMemo(() => {
    if (!activePath) return [];
    return intel.dependencies.internal
      .filter((e) => e.from === activePath)
      .map((e) => e.to);
  }, [intel, activePath]);

  const externals = useMemo(() => {
    if (!active) return [];
    const inters = new Set(deps);
    return active.imports.filter((spec) => {
      if (spec.startsWith(".") || spec.startsWith("@/") || spec.startsWith("/")) return false;
      return !inters.has(spec);
    });
  }, [active, deps]);

  // Impact radius: transitive callers depth-limited
  const impact = useMemo(() => {
    if (!activePath) return { reach: 0, direct: 0 };
    const rev = new Map<string, string[]>();
    for (const e of intel.dependencies.internal) {
      if (!rev.has(e.to)) rev.set(e.to, []);
      rev.get(e.to)!.push(e.from);
    }
    const seen = new Set<string>();
    const q: string[] = [activePath];
    while (q.length) {
      const cur = q.shift()!;
      for (const parent of rev.get(cur) || []) {
        if (!seen.has(parent)) {
          seen.add(parent);
          q.push(parent);
        }
      }
    }
    return { reach: seen.size, direct: callers.length };
  }, [intel, activePath, callers]);

  const hotspotRank = useMemo(() => {
    if (!active) return null;
    const sorted = [...intel.files].sort((a, b) => b.score - a.score);
    const idx = sorted.findIndex((f) => f.path === active.path);
    return { rank: idx + 1, total: sorted.length };
  }, [intel, active]);

  if (!activePath || !active) {
    return (
      <div className="h-full flex flex-col bg-[#181825] text-[#cdd6f4]">
        <div className="h-8 flex items-center justify-between px-3 border-b border-[#313244]/40">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#a6adc8] font-semibold">
            <GitBranch className="w-3 h-3 text-primary" />
            Drilldown
          </div>
          {onClose && (
            <button onClick={onClose} className="text-[#6c7086] hover:text-[#cdd6f4]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <Activity className="w-8 h-8 text-[#45475a] mx-auto mb-3" />
            <p className="text-[12px] text-[#6c7086]">Select a file to see its call graph, symbols and impact</p>
          </div>
        </div>
      </div>
    );
  }

  const risk = riskBand(active.score);
  const fileName = active.path.split("/").pop() || active.path;

  return (
    <div className="h-full flex flex-col bg-[#181825] text-[#cdd6f4] overflow-hidden">
      {/* Header */}
      <div className="h-8 flex items-center justify-between px-3 border-b border-[#313244]/40 flex-shrink-0">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#a6adc8] font-semibold min-w-0">
          <GitBranch className="w-3 h-3 text-primary flex-shrink-0" />
          <span className="truncate">Drilldown · {fileName}</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#6c7086] hover:text-[#cdd6f4] flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Risk Card */}
        <div className="p-3">
          <div className={cn("relative rounded-lg border border-[#313244]/60 bg-gradient-to-br p-3 overflow-hidden", risk.ring)}>
            <div className="absolute inset-0 bg-[#1e1e2e]/70" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#a6adc8] font-semibold">Risk score</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={cn("text-[26px] font-mono font-bold tabular-nums", risk.tone)}>{active.score}</span>
                  <span className="text-[11px] text-[#6c7086]">/ 100</span>
                </div>
                <div className={cn("text-[10px] font-medium mt-0.5", risk.tone)}>{risk.label}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-[#a6adc8] font-semibold">Hotspot rank</div>
                <div className="text-[15px] font-mono font-semibold text-[#cdd6f4] mt-1 tabular-nums">
                  #{hotspotRank?.rank}
                  <span className="text-[10px] text-[#6c7086] ml-1">of {hotspotRank?.total}</span>
                </div>
                <div className="text-[10px] text-[#a6adc8] mt-0.5 flex items-center justify-end gap-1">
                  <Flame className="w-2.5 h-2.5 text-[#fab387]" />
                  top {Math.round(((hotspotRank?.rank || 1) / (hotspotRank?.total || 1)) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Metric label="SLOC" value={active.sloc.toLocaleString()} hint={`${active.lines} total`} />
            <Metric
              label="Complexity"
              value={active.complexity}
              hint={active.complexity > 60 ? "high" : active.complexity > 30 ? "medium" : "low"}
              tone={active.complexity > 60 ? "text-[#f38ba8]" : active.complexity > 30 ? "text-[#fab387]" : "text-[#a6e3a1]"}
            />
            <Metric label="Max nesting" value={`${active.maxIndent}`} hint="indent depth" />
            <Metric
              label="Fan-in / out"
              value={`${impact.direct} / ${deps.length}`}
              hint={`${impact.reach} transitive`}
              tone="text-[#89b4fa]"
            />
          </div>
        </div>

        {/* Symbols */}
        <Section icon={<Layers className="w-3 h-3" />} title="Key symbols" count={symbols.length}>
          {symbols.length === 0 ? (
            <div className="text-[11px] text-[#6c7086] px-2 py-3 text-center">No parseable symbols detected.</div>
          ) : (
            <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
              {symbols.slice(0, 40).map((s) => (
                <div
                  key={`${s.kind}-${s.name}-${s.line}`}
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#313244]/40 transition-colors text-[12px]"
                >
                  <span style={{ color: symbolColor[s.kind] }} className="flex-shrink-0">
                    {symbolIcon[s.kind]}
                  </span>
                  <span className="text-[#cdd6f4] font-mono truncate">{s.name}</span>
                  <span className="text-[9px] text-[#585b70] ml-auto uppercase tracking-wider flex-shrink-0">{s.kind}</span>
                  <span className="text-[10px] text-[#45475a] font-mono tabular-nums flex-shrink-0 w-8 text-right">:{s.line}</span>
                </div>
              ))}
              {symbols.length > 40 && (
                <div className="text-[10px] text-[#585b70] text-center pt-2">
                  +{symbols.length - 40} more
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Callers */}
        <Section icon={<ArrowDownLeft className="w-3 h-3" />} title="Called by (fan-in)" count={callers.length}>
          {callers.length === 0 ? (
            <div className="text-[11px] text-[#6c7086] px-2 py-3 text-center">
              No internal callers — this may be an entry point or dead code.
            </div>
          ) : (
            <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
              {callers.map((p) => (
                <FileRow key={p} path={p} onClick={() => onFileSelect(p)} />
              ))}
            </div>
          )}
        </Section>

        {/* Dependencies */}
        <Section icon={<ArrowUpRight className="w-3 h-3" />} title="Depends on (fan-out)" count={deps.length + externals.length}>
          {deps.length + externals.length === 0 ? (
            <div className="text-[11px] text-[#6c7086] px-2 py-3 text-center">No imports.</div>
          ) : (
            <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
              {deps.map((p) => (
                <FileRow key={p} path={p} onClick={() => onFileSelect(p)} />
              ))}
              {externals.length > 0 && (
                <>
                  <div className="text-[9px] uppercase tracking-wider text-[#585b70] px-2 pt-3 pb-1 font-semibold">
                    External packages
                  </div>
                  <div className="flex flex-wrap gap-1 px-2">
                    {externals.slice(0, 20).map((e) => (
                      <span
                        key={e}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#313244]/60 text-[#94e2d5] border border-[#313244]"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </Section>

        {/* Impact / hotspots that share dependencies */}
        <Section icon={<Flame className="w-3 h-3" />} title="Impact & hotspots" count={impact.reach}>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Metric label="Direct" value={impact.direct} />
              <Metric label="Transitive" value={impact.reach} tone="text-[#89b4fa]" />
              <Metric
                label="Hooks"
                value={active.hooks}
                tone={active.hooks > 0 ? "text-[#f9e2af]" : undefined}
              />
            </div>

            {/* related hotspots that this file imports or is imported by */}
            {(() => {
              const relatedPaths = new Set([...callers, ...deps]);
              const related = intel.hotspots.filter((h) => relatedPaths.has(h.path) && h.path !== active.path);
              if (related.length === 0) {
                return (
                  <div className="text-[11px] text-[#6c7086] px-2 py-2 text-center">
                    No related hotspots in the direct graph.
                  </div>
                );
              }
              return (
                <div className="space-y-0.5">
                  <div className="text-[9px] uppercase tracking-wider text-[#585b70] px-2 pt-1 pb-1 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-2.5 h-2.5 text-[#fab387]" />
                    Related risk files
                  </div>
                  {related.map((h) => {
                    const b = riskBand(h.score);
                    return (
                      <FileRow
                        key={h.path}
                        path={h.path}
                        onClick={() => onFileSelect(h.path)}
                        right={
                          <span className={cn("text-[10px] font-mono tabular-nums", b.tone)}>{h.score}</span>
                        }
                      />
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </Section>

        {/* Language / meta footer */}
        <div className="p-3 border-t border-[#313244]/40 flex items-center justify-between text-[10px] text-[#6c7086] font-mono">
          <span className="flex items-center gap-1.5">
            <Hash className="w-2.5 h-2.5" />
            {active.language} · .{active.ext}
          </span>
          <span>{active.todos > 0 ? `${active.todos} TODO` : "no TODOs"}</span>
        </div>
      </div>
    </div>
  );
};

export default FileDrilldownPanel;