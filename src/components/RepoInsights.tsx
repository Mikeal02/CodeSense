import { motion } from "framer-motion";
import { 
  Star, GitFork, Eye, AlertCircle, Calendar, GitBranch, Scale, Tag,
  Users, GitCommit, Clock, Globe, Archive, BookOpen, Sparkles, 
  TrendingUp, Code2, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RepoInsightsData } from "@/hooks/useRepoInsights";
import ShimmerSkeleton from "./ui/shimmer-skeleton";
import { formatDistanceToNow } from "date-fns";

interface RepoInsightsProps {
  insights: RepoInsightsData;
  repoName: string;
  className?: string;
}

const langColors: Record<string, string> = {
  TypeScript: "hsl(var(--info))", JavaScript: "hsl(var(--warning))", Python: "hsl(142 71% 45%)",
  Rust: "hsl(20 70% 65%)", Go: "hsl(190 80% 50%)", Java: "hsl(20 60% 50%)",
  CSS: "hsl(var(--accent))", HTML: "hsl(var(--destructive))", Shell: "hsl(var(--success))",
  Ruby: "hsl(0 65% 50%)", PHP: "hsl(265 50% 55%)", Swift: "hsl(20 90% 55%)",
  Kotlin: "hsl(265 70% 55%)", C: "hsl(210 50% 50%)", "C++": "hsl(340 60% 55%)",
  Dart: "hsl(195 80% 50%)", Svelte: "hsl(15 90% 55%)", Vue: "hsl(153 47% 49%)",
};

const RepoInsights = ({ insights, repoName, className }: RepoInsightsProps) => {
  const { metadata, contributors, languages, recentCommits, commitActivity, isLoading } = insights;

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} variant="stat" />
          ))}
        </div>
        <ShimmerSkeleton variant="card" />
      </div>
    );
  }

  if (!metadata) return null;

  const totalLangBytes = Object.values(languages).reduce((a, b) => a + b, 0);
  const langEntries = Object.entries(languages).sort(([, a], [, b]) => b - a);

  // Commit heatmap from last 12 weeks
  const recentWeeks = commitActivity.slice(-12);
  const maxDayCommits = Math.max(1, ...recentWeeks.flatMap(w => w.days));

  const statCards = [
    { icon: Star, label: "Stars", value: metadata.stars, color: "text-warning" },
    { icon: GitFork, label: "Forks", value: metadata.forks, color: "text-info" },
    { icon: Eye, label: "Watchers", value: metadata.watchers, color: "text-accent" },
    { icon: AlertCircle, label: "Issues", value: metadata.openIssues, color: "text-destructive" },
  ];

  const metaBadges = [
    metadata.language && { icon: Code2, label: metadata.language, color: langColors[metadata.language] || "hsl(var(--primary))" },
    metadata.license && { icon: Scale, label: metadata.license, color: "hsl(var(--muted-foreground))" },
    { icon: GitBranch, label: metadata.defaultBranch, color: "hsl(var(--info))" },
    metadata.isArchived && { icon: Archive, label: "Archived", color: "hsl(var(--warning))" },
    metadata.hasPages && { icon: Globe, label: "Pages", color: "hsl(var(--success))" },
    metadata.hasWiki && { icon: BookOpen, label: "Wiki", color: "hsl(var(--accent))" },
  ].filter(Boolean) as { icon: React.ElementType; label: string; color: string }[];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Description & Topics */}
      {(metadata.description || metadata.topics.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm p-4"
        >
          {metadata.description && (
            <p className="text-sm text-foreground/80 mb-3 leading-relaxed">{metadata.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {metaBadges.map(b => (
              <span key={b.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border border-border/30 bg-secondary/20" style={{ color: b.color }}>
                <b.icon className="w-2.5 h-2.5" />
                {b.label}
              </span>
            ))}
            {metadata.topics.slice(0, 6).map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/5 text-primary/70 border border-primary/10">
                {t}
              </span>
            ))}
          </div>
          {metadata.homepage && (
            <a href={metadata.homepage} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-[10px] text-primary/60 hover:text-primary transition-colors">
              <Globe className="w-2.5 h-2.5" /> {metadata.homepage}
              <ExternalLink className="w-2 h-2" />
            </a>
          )}
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-2">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm p-3 text-center group hover:bg-card/50 transition-colors"
          >
            <s.icon className={cn("w-4 h-4 mx-auto mb-1", s.color)} />
            <div className="text-lg font-bold text-foreground tabular-nums">{s.value.toLocaleString()}</div>
            <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Languages + Contributors row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Languages */}
        {langEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm p-4"
          >
            <h4 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Code2 className="w-3 h-3" /> Languages
            </h4>
            <div className="h-2 rounded-full overflow-hidden flex mb-3 bg-secondary/30">
              {langEntries.slice(0, 8).map(([lang, bytes]) => (
                <motion.div
                  key={lang}
                  initial={{ width: 0 }}
                  animate={{ width: `${(bytes / totalLangBytes) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{ backgroundColor: langColors[lang] || "hsl(var(--muted))" }}
                  className="h-full hover:opacity-80 transition-opacity"
                  title={`${lang}: ${((bytes / totalLangBytes) * 100).toFixed(1)}%`}
                />
              ))}
            </div>
            <div className="space-y-1">
              {langEntries.slice(0, 5).map(([lang, bytes]) => (
                <div key={lang} className="flex items-center gap-2 text-[10px]">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: langColors[lang] || "hsl(var(--muted))" }} />
                  <span className="text-foreground/70">{lang}</span>
                  <span className="text-muted-foreground/40 ml-auto tabular-nums">{((bytes / totalLangBytes) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Contributors */}
        {contributors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm p-4"
          >
            <h4 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Users className="w-3 h-3" /> Top Contributors
            </h4>
            <div className="space-y-2">
              {contributors.slice(0, 5).map((c, i) => (
                <div key={c.login} className="flex items-center gap-2">
                  <img src={c.avatarUrl} alt={c.login} className="w-5 h-5 rounded-full ring-1 ring-border/30" />
                  <span className="text-[11px] text-foreground/70 truncate flex-1">{c.login}</span>
                  <span className="text-[9px] text-muted-foreground/40 tabular-nums">{c.contributions} commits</span>
                </div>
              ))}
            </div>
            {/* Contributor avatar stack */}
            <div className="flex items-center mt-3 -space-x-1.5">
              {contributors.slice(0, 8).map((c, i) => (
                <img
                  key={c.login}
                  src={c.avatarUrl}
                  alt={c.login}
                  className="w-5 h-5 rounded-full ring-2 ring-background"
                  style={{ zIndex: 10 - i }}
                />
              ))}
              {contributors.length > 8 && (
                <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[8px] text-muted-foreground ring-2 ring-background">
                  +{contributors.length - 8}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Commit Activity Heatmap */}
      {recentWeeks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm p-4"
        >
          <h4 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> Commit Activity (12 weeks)
          </h4>
          <div className="flex gap-[3px]">
            {recentWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.days.map((count, di) => (
                  <motion.div
                    key={di}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: wi * 0.02 + di * 0.01 }}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: count === 0
                        ? "hsl(var(--secondary))"
                        : `hsl(var(--primary) / ${0.2 + (count / maxDayCommits) * 0.8})`,
                    }}
                    title={`${count} commits`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[8px] text-muted-foreground/40">
            <span>Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <div key={v} className="w-2.5 h-2.5 rounded-sm" style={{
                backgroundColor: v === 0 ? "hsl(var(--secondary))" : `hsl(var(--primary) / ${0.2 + v * 0.8})`
              }} />
            ))}
            <span>More</span>
          </div>
        </motion.div>
      )}

      {/* Recent Commits */}
      {recentCommits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm p-4"
        >
          <h4 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <GitCommit className="w-3 h-3" /> Recent Commits
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none">
            {recentCommits.slice(0, 8).map((c, i) => (
              <motion.div
                key={c.sha}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.03 }}
                className="flex items-start gap-2 group"
              >
                {c.authorAvatar ? (
                  <img src={c.authorAvatar} alt="" className="w-4 h-4 rounded-full mt-0.5 ring-1 ring-border/20" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-secondary mt-0.5 flex items-center justify-center">
                    <GitCommit className="w-2 h-2 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground/80 truncate leading-tight">{c.message}</p>
                  <p className="text-[9px] text-muted-foreground/40">
                    {c.authorLogin || c.authorName} · {formatDistanceToNow(new Date(c.date), { addSuffix: true })}
                  </p>
                </div>
                <span className="text-[8px] font-mono text-muted-foreground/30 flex-shrink-0">{c.sha.slice(0, 7)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Timestamps */}
      <div className="flex flex-wrap gap-3 text-[9px] text-muted-foreground/30">
        <span className="flex items-center gap-1">
          <Calendar className="w-2.5 h-2.5" /> Created {formatDistanceToNow(new Date(metadata.createdAt), { addSuffix: true })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" /> Pushed {formatDistanceToNow(new Date(metadata.pushedAt), { addSuffix: true })}
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> {(metadata.size / 1024).toFixed(1)} MB
        </span>
      </div>
    </div>
  );
};

export default RepoInsights;
