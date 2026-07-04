import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, FileCode, Code2, FolderTree, AlertTriangle, TrendingUp,
  BarChart3, PieChart as PieChartIcon, Layers, GitBranch, Package,
  ShieldCheck, Flame, Copy, Boxes, Sparkles, ChevronRight, Info,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import { analyzeCodebase, type CodeIntelligence } from "@/lib/codeIntelligence";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  files: { path: string; content: string }[];
  repoName?: string;
}

const COLORS = [
  "hsl(217 91% 60%)", "hsl(152 60% 42%)", "hsl(38 92% 50%)",
  "hsl(262 52% 56%)", "hsl(190 80% 45%)", "hsl(0 72% 51%)",
  "hsl(330 70% 55%)", "hsl(45 85% 55%)",
];

type Tab = "overview" | "architecture" | "dependencies" | "hotspots" | "quality" | "files";

const TABS: { id: Tab; label: string; icon: typeof FileCode }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "architecture", label: "Architecture", icon: Layers },
  { id: "dependencies", label: "Dependencies", icon: GitBranch },
  { id: "hotspots", label: "Hotspots", icon: Flame },
  { id: "quality", label: "Quality", icon: ShieldCheck },
  { id: "files", label: "Files", icon: FileCode },
];

const gradeColor = (g: string) =>
  g.startsWith("A") ? "text-success" : g === "B" ? "text-info" : g === "C" ? "text-warning" : "text-destructive";

const severityStyle = (s: "info" | "warn" | "error") =>
  s === "error" ? "border-destructive/40 bg-destructive/5 text-destructive"
    : s === "warn" ? "border-warning/40 bg-warning/5 text-warning"
    : "border-info/40 bg-info/5 text-info";

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm", className)}>{children}</div>
);

const StatTile = ({ label, value, hint, icon: Icon }: {
  label: string; value: string | number; hint?: string; icon: typeof FileCode;
}) => (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      <Icon className="w-3.5 h-3.5 text-muted-foreground/70" />
    </div>
    <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
    {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
  </Card>
);

const SectionTitle = ({ icon: Icon, children, tip }: { icon: typeof FileCode; children: React.ReactNode; tip?: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon className="w-4 h-4 text-primary" />
    <h3 className="text-sm font-semibold text-foreground">{children}</h3>
    {tip && (
      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
        <Info className="w-3 h-3" /> {tip}
      </span>
    )}
  </div>
);

const CodeIntelligenceDashboard = ({ isOpen, onClose, files, repoName }: Props) => {
  const [tab, setTab] = useState<Tab>("overview");

  const intel: CodeIntelligence | null = useMemo(
    () => (files.length ? analyzeCodebase(files) : null),
    [files],
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto overflow-x-hidden"
      >
        <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 max-w-7xl">
          {/* Header */}
          <div className="flex items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight truncate">Code Intelligence</h2>
                <p className="text-xs text-muted-foreground truncate">
                  {repoName ? `${repoName} · ` : ""}Deep static analysis of your codebase
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose} className="gap-1.5 shrink-0">
              <X className="w-4 h-4" /> Close
            </Button>
          </div>

          {!intel ? (
            <Card className="p-10 text-center text-muted-foreground">
              Connect a repository to see intelligence.
            </Card>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-1 mb-5 overflow-x-auto scrollbar-none -mx-3 sm:mx-0 px-3 sm:px-0">
                {TABS.map((t) => {
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
                        active
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "text-muted-foreground hover:text-foreground border-transparent hover:bg-secondary/40",
                      )}
                    >
                      <t.icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab === "overview" && <OverviewTab intel={intel} />}
                  {tab === "architecture" && <ArchitectureTab intel={intel} />}
                  {tab === "dependencies" && <DependenciesTab intel={intel} />}
                  {tab === "hotspots" && <HotspotsTab intel={intel} />}
                  {tab === "quality" && <QualityTab intel={intel} />}
                  {tab === "files" && <FilesTab intel={intel} />}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ---------------- Tabs ---------------- */

const OverviewTab = ({ intel }: { intel: CodeIntelligence }) => {
  const langData = intel.languages.slice(0, 8).map((l) => ({ name: l.name, value: l.lines }));
  const healthData = [{ name: "score", value: intel.health.score, fill: "hsl(var(--primary))" }];
  return (
    <div className="space-y-5">
      {/* Top row: Health + Key stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-1">
          <SectionTitle icon={ShieldCheck}>Health Score</SectionTitle>
          <div className="relative flex items-center justify-center h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={healthData} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={12} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={cn("text-4xl font-bold tabular-nums", gradeColor(intel.health.grade))}>
                {intel.health.score}
              </div>
              <div className={cn("text-xs font-semibold tracking-widest", gradeColor(intel.health.grade))}>
                GRADE {intel.health.grade}
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {intel.health.breakdown.map((b) => (
              <div key={b.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{b.label}</span>
                <div className="flex items-center gap-2 flex-1 max-w-[120px] ml-3">
                  <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(b.value / b.weight) * 100}%` }} />
                  </div>
                  <span className="tabular-nums text-foreground w-8 text-right">{b.value}/{b.weight}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Files" value={intel.totals.files} icon={FileCode} />
          <StatTile label="Lines" value={intel.totals.lines.toLocaleString()} hint={`${intel.totals.sloc.toLocaleString()} SLOC`} icon={Code2} />
          <StatTile label="Languages" value={intel.languages.length} icon={Layers} />
          <StatTile label="Functions" value={intel.totals.functions} icon={TrendingUp} />
          <StatTile label="Components" value={intel.files.reduce((a, f) => a + (f.jsxElements > 0 ? 1 : 0), 0)} icon={Boxes} />
          <StatTile label="Hooks" value={intel.totals.hooks} icon={Sparkles} />
          <StatTile label="Imports" value={intel.totals.imports} icon={GitBranch} />
          <StatTile label="TODOs" value={intel.totals.todos} icon={AlertTriangle} />
        </div>
      </div>

      {/* Language + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <SectionTitle icon={PieChartIcon}>Language Distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={langData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                {langData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {intel.languages.slice(0, 6).map((lang, i) => (
              <div key={lang.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{lang.name}</span>
                <span className="text-muted-foreground ml-auto tabular-nums">{lang.files}f</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle icon={AlertTriangle} tip="Confidence shown">Actionable Insights</SectionTitle>
          {intel.insights.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No red flags detected. Nicely done.
            </p>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {intel.insights.map((i) => (
                <div key={i.id} className={cn("rounded-lg border p-3 text-xs", severityStyle(i.severity))}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-foreground text-[13px]">{i.title}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-70">
                      {Math.round(i.confidence * 100)}% conf
                    </span>
                  </div>
                  <p className="text-muted-foreground">{i.detail}</p>
                  {i.files && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {i.files.slice(0, 4).map((f) => (
                        <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-foreground/80 font-mono truncate max-w-[220px]">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const ArchitectureTab = ({ intel }: { intel: CodeIntelligence }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <SectionTitle icon={FolderTree}>Folder Composition</SectionTitle>
        <div className="space-y-2">
          {intel.folders.slice(0, 10).map((f, i) => {
            const pct = (f.lines / intel.totals.lines) * 100;
            return (
              <div key={f.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-foreground truncate">{f.name}/</span>
                  <span className="text-muted-foreground tabular-nums">
                    {f.files} files · {f.lines.toLocaleString()} lines
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle icon={Sparkles}>Entry Points & Config</SectionTitle>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Entry points</div>
            {intel.entryPoints.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">None detected in analyzed set.</div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {intel.entryPoints.map((p) => (
                  <span key={p} className="text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary font-mono border border-primary/20 max-w-full truncate">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Config files</div>
            {intel.configFiles.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">None detected.</div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {intel.configFiles.map((p) => (
                  <span key={p} className="text-[11px] px-2 py-1 rounded-md bg-secondary/60 text-foreground/80 font-mono truncate max-w-full">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>

    <Card className="p-5">
      <SectionTitle icon={Boxes}>Most-Depended-On Modules (Fan-in)</SectionTitle>
      {(() => {
        const rows = Object.entries(intel.dependencies.fanIn)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12);
        if (!rows.length) return <div className="text-xs text-muted-foreground py-4 text-center">No internal edges resolved.</div>;
        const max = rows[0][1];
        return (
          <div className="space-y-1.5">
            {rows.map(([file, count]) => (
              <div key={file} className="flex items-center gap-3 text-xs">
                <span className="font-mono truncate flex-1 min-w-0 text-foreground/90">{file}</span>
                <div className="w-28 sm:w-40 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                </div>
                <span className="tabular-nums text-muted-foreground w-10 text-right">{count} in</span>
              </div>
            ))}
          </div>
        );
      })()}
    </Card>
  </div>
);

const DependenciesTab = ({ intel }: { intel: CodeIntelligence }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <SectionTitle icon={Package}>Top External Packages</SectionTitle>
        {intel.dependencies.externalCounts.length === 0 ? (
          <div className="text-xs text-muted-foreground py-4 text-center">No external imports detected.</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={intel.dependencies.externalCounts.slice(0, 12)} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-5">
        <SectionTitle icon={AlertTriangle}>Circular Dependencies</SectionTitle>
        {intel.circular.length === 0 ? (
          <div className="text-xs text-success py-4 text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> No cycles detected.
          </div>
        ) : (
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {intel.circular.map((c, i) => (
              <div key={i} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">
                  Cycle #{i + 1} · {c.cycle.length - 1} hops
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
                  {c.cycle.map((n, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-secondary/60 truncate max-w-[180px]">{n}</span>
                      {idx < c.cycle.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>

    <Card className="p-5">
      <SectionTitle icon={GitBranch}>Most Coupled Files (Fan-out)</SectionTitle>
      {(() => {
        const rows = Object.entries(intel.dependencies.fanOut)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12);
        if (!rows.length) return <div className="text-xs text-muted-foreground py-4 text-center">No fan-out data.</div>;
        const max = rows[0][1];
        return (
          <div className="space-y-1.5">
            {rows.map(([file, count]) => (
              <div key={file} className="flex items-center gap-3 text-xs">
                <span className="font-mono truncate flex-1 min-w-0 text-foreground/90">{file}</span>
                <div className="w-28 sm:w-40 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-warning rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                </div>
                <span className="tabular-nums text-muted-foreground w-12 text-right">{count} out</span>
              </div>
            ))}
          </div>
        );
      })()}
    </Card>
  </div>
);

const HotspotsTab = ({ intel }: { intel: CodeIntelligence }) => (
  <Card className="p-0 overflow-hidden">
    <div className="p-5 pb-3">
      <SectionTitle icon={Flame} tip="Risk = size + complexity + nesting + debt">
        Complexity Hotspots
      </SectionTitle>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-muted-foreground border-y border-border/50 bg-secondary/20">
          <tr>
            <th className="text-left px-4 py-2 font-medium">File</th>
            <th className="text-right px-3 py-2 font-medium">Lines</th>
            <th className="text-right px-3 py-2 font-medium hidden sm:table-cell">Complexity</th>
            <th className="text-right px-3 py-2 font-medium hidden md:table-cell">Nesting</th>
            <th className="text-right px-3 py-2 font-medium hidden md:table-cell">TODOs</th>
            <th className="text-right px-4 py-2 font-medium">Risk</th>
          </tr>
        </thead>
        <tbody>
          {intel.hotspots.map((f) => (
            <tr key={f.path} className="border-b border-border/40 hover:bg-secondary/20">
              <td className="px-4 py-2 font-mono truncate max-w-[240px] sm:max-w-none">{f.path}</td>
              <td className="px-3 py-2 text-right tabular-nums">{f.lines}</td>
              <td className="px-3 py-2 text-right tabular-nums hidden sm:table-cell">{f.complexity}</td>
              <td className="px-3 py-2 text-right tabular-nums hidden md:table-cell">{f.maxIndent}</td>
              <td className="px-3 py-2 text-right tabular-nums hidden md:table-cell">{f.todos}</td>
              <td className="px-4 py-2 text-right">
                <span className={cn(
                  "inline-flex items-center justify-center px-2 py-0.5 rounded font-semibold tabular-nums",
                  f.score >= 70 ? "bg-destructive/15 text-destructive"
                    : f.score >= 45 ? "bg-warning/15 text-warning"
                    : "bg-success/15 text-success",
                )}>
                  {f.score}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const QualityTab = ({ intel }: { intel: CodeIntelligence }) => (
  <div className="space-y-4">
    <Card className="p-5">
      <SectionTitle icon={Copy}>Near-Duplicate Clusters</SectionTitle>
      {intel.duplicates.length === 0 ? (
        <div className="text-xs text-success py-4 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" /> No significant duplication detected.
        </div>
      ) : (
        <div className="space-y-2">
          {intel.duplicates.map((d, i) => (
            <div key={i} className="rounded-lg border border-warning/30 bg-warning/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-warning font-semibold mb-1">
                Cluster #{i + 1} · {d.files.length} files · ~{d.size} normalized chars
              </div>
              <div className="flex flex-wrap gap-1">
                {d.files.map((f) => (
                  <span key={f} className="text-[11px] px-1.5 py-0.5 rounded bg-secondary/60 font-mono truncate max-w-[240px]">{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>

    <Card className="p-5">
      <SectionTitle icon={Info} tip="Low confidence — may be referenced dynamically">
        Potentially Unused Exports
      </SectionTitle>
      {intel.unusedExports.length === 0 ? (
        <div className="text-xs text-success py-4 text-center">All exports referenced.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-[320px] overflow-y-auto">
          {intel.unusedExports.slice(0, 60).map((u, i) => (
            <div key={i} className="text-[11px] rounded border border-border/50 px-2 py-1.5 bg-secondary/20 flex items-center justify-between gap-2">
              <code className="text-warning truncate">{u.name}</code>
              <span className="font-mono text-muted-foreground truncate text-[10px]">{u.file}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  </div>
);

const FilesTab = ({ intel }: { intel: CodeIntelligence }) => {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"lines" | "complexity" | "score" | "path">("score");
  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return [...intel.files]
      .filter((f) => (q ? f.path.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        if (sort === "path") return a.path.localeCompare(b.path);
        return (b[sort] as number) - (a[sort] as number);
      })
      .slice(0, 200);
  }, [intel.files, query, sort]);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between border-b border-border/50">
        <SectionTitle icon={FileCode}>File Explorer</SectionTitle>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter files..."
            className="text-xs px-2.5 py-1.5 rounded-md bg-secondary/40 border border-border/60 outline-none focus:border-primary/50 w-full sm:w-56"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="text-xs px-2 py-1.5 rounded-md bg-secondary/40 border border-border/60 outline-none focus:border-primary/50"
          >
            <option value="score">Sort: Risk</option>
            <option value="lines">Sort: Lines</option>
            <option value="complexity">Sort: Complexity</option>
            <option value="path">Sort: Path</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground border-b border-border/40 bg-secondary/20">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Path</th>
              <th className="text-right px-3 py-2 font-medium">Lang</th>
              <th className="text-right px-3 py-2 font-medium">Lines</th>
              <th className="text-right px-3 py-2 font-medium hidden sm:table-cell">Fns</th>
              <th className="text-right px-3 py-2 font-medium hidden md:table-cell">Cx</th>
              <th className="text-right px-4 py-2 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.path} className="border-b border-border/30 hover:bg-secondary/20">
                <td className="px-4 py-1.5 font-mono truncate max-w-[260px] sm:max-w-none">{f.path}</td>
                <td className="px-3 py-1.5 text-right text-muted-foreground">{f.language}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{f.lines}</td>
                <td className="px-3 py-1.5 text-right tabular-nums hidden sm:table-cell">{f.functions}</td>
                <td className="px-3 py-1.5 text-right tabular-nums hidden md:table-cell">{f.complexity}</td>
                <td className="px-4 py-1.5 text-right tabular-nums">
                  <span className={cn(
                    "inline-block px-1.5 rounded",
                    f.score >= 70 ? "text-destructive" : f.score >= 45 ? "text-warning" : "text-success",
                  )}>{f.score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">No files match.</div>
        )}
      </div>
    </Card>
  );
};

export default CodeIntelligenceDashboard;