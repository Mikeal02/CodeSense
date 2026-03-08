import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { 
  Code2, ArrowLeft, Calendar, Eye, FileCode, Sparkles, 
  Share2, Copy, Check, Clock, Loader2, AlertCircle,
  MessageSquare, Zap, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

interface SharedReport {
  id: string;
  repo_name: string;
  active_mode: string | null;
  messages: Array<{ id: string; role: string; content: string }>;
  file_summary: Array<{ path: string; lines: number; extension: string }>;
  created_at: string;
  views: number;
}

const SharedReport = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SharedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) { setError("Invalid report ID"); setLoading(false); return; }
      
      const { data, error: fetchError } = await supabase
        .from("shared_reports")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        setError("Report not found or has expired.");
        setLoading(false);
        return;
      }

      setReport(data as unknown as SharedReport);
      setLoading(false);

      // Increment views
      await supabase
        .from("shared_reports")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", id);
    };

    fetchReport();
  }, [id]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading report...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Report Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to CodeSense
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const assistantMessages = report.messages.filter(m => m.role === "assistant");
  const userMessages = report.messages.filter(m => m.role === "user");
  const fileExtensions = report.file_summary.reduce((acc: Record<string, number>, f) => {
    const ext = f.extension || "other";
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {});
  const topExtensions = Object.entries(fileExtensions).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const totalLines = report.file_summary.reduce((sum, f) => sum + (f.lines || 0), 0);
  const createdDate = new Date(report.created_at);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass-heavy"
      >
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">CodeSense</span>
              <span className="text-[10px] text-muted-foreground block leading-none">Shared Report</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopyLink} className="gap-2 text-xs">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Zap className="w-3.5 h-3.5" />
                Try CodeSense
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div className="container mx-auto px-4 sm:px-6 pt-12 pb-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {/* Repo badge */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-mono font-medium text-foreground">{report.repo_name}</span>
              </div>
              {report.active_mode && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs text-foreground capitalize">{report.active_mode} mode</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
              Codebase Analysis Report
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              AI-generated analysis of <span className="text-foreground font-medium">{report.repo_name}</span> with {report.messages.length} messages and {report.file_summary.length} files analyzed.
            </p>

            {/* Meta strip */}
            <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {createdDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {report.views + 1} views
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {report.messages.length} messages
              </span>
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                {report.file_summary.length} files · {totalLines.toLocaleString()} lines
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {report.messages.map((msg, i) => (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                className={cn(
                  "rounded-2xl border overflow-hidden",
                  msg.role === "user"
                    ? "border-primary/20 bg-primary/5"
                    : "border-border/50 bg-card/50"
                )}
              >
                <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center",
                    msg.role === "assistant" ? "bg-gradient-to-br from-primary to-accent" : "bg-secondary"
                  )}>
                    {msg.role === "assistant" 
                      ? <Sparkles className="w-3 h-3 text-primary-foreground" />
                      : <MessageSquare className="w-3 h-3 text-muted-foreground" />
                    }
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {msg.role === "assistant" ? "CodeSense AI" : "User"}
                  </span>
                </div>
                <div className="px-5 py-4">
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-themed">
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            if (!match) {
                              return <code className="bg-secondary px-1.5 py-0.5 rounded text-primary font-mono text-xs" {...props}>{children}</code>;
                            }
                            return (
                              <div className="bg-secondary/80 rounded-xl overflow-hidden my-3">
                                <div className="px-4 py-2 border-b border-border/50 flex items-center gap-2">
                                  <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground font-mono">{match[1]}</span>
                                </div>
                                <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto"><code {...props}>{children}</code></pre>
                              </div>
                            );
                          },
                          h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mt-4 mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-4 mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-3 mb-1">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 text-foreground/90 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* File breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border/50 bg-card/50 p-5"
            >
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" />
                File Breakdown
              </h3>
              <div className="space-y-2.5">
                {topExtensions.map(([ext, count]) => (
                  <div key={ext} className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">.{ext}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${(count / report.file_summary.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                {report.file_summary.length} files · {totalLines.toLocaleString()} total lines
              </div>
            </motion.div>

            {/* Share card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-5"
            >
              <h3 className="text-sm font-semibold mb-2">Share This Report</h3>
              <p className="text-xs text-muted-foreground mb-3">Anyone with the link can view this analysis.</p>
              <Button onClick={handleCopyLink} size="sm" className="w-full gap-2 text-xs">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {copied ? "Link Copied!" : "Copy Share Link"}
              </Button>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-border/50 bg-card/50 p-5 text-center"
            >
              <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
              <h3 className="text-sm font-semibold mb-1">Analyze Your Own Code</h3>
              <p className="text-xs text-muted-foreground mb-3">Free, instant, AI-powered analysis.</p>
              <Link to="/">
                <Button size="sm" className="w-full gap-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                  Try CodeSense Free
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 py-6">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Generated by CodeSense AI</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Expires {new Date(report.created_at).getTime() + 30 * 24 * 60 * 60 * 1000 > Date.now() 
              ? `in ${Math.ceil((new Date(report.created_at).getTime() + 30 * 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60 * 24))} days`
              : "soon"
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default SharedReport;
