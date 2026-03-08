import { useState } from "react";
import { 
  Download, FileText, FileJson, Copy, Check, X, 
  FileCode, BarChart3, MessageSquare, Printer
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Message } from "./ChatInterface";
import { toast } from "sonner";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName?: string;
  files: { path: string; content: string }[];
  messages: Message[];
}

type ExportFormat = "markdown" | "json" | "text" | "pdf";
type ExportContent = "all" | "chat" | "structure" | "stats";

const ExportReportModal = ({
  isOpen,
  onClose,
  repoName,
  files,
  messages,
}: ExportReportModalProps) => {
  const [format, setFormat] = useState<ExportFormat>("markdown");
  const [content, setContent] = useState<ExportContent>("all");
  const [copied, setCopied] = useState(false);

  const generateReport = (): string => {
    const timestamp = new Date().toLocaleString();
    
    // Calculate stats
    const totalLines = files.reduce((sum, f) => sum + f.content.split('\n').length, 0);
    const extensions: Record<string, number> = {};
    files.forEach(f => {
      const ext = f.path.split('.').pop() || 'unknown';
      extensions[ext] = (extensions[ext] || 0) + 1;
    });

    if (format === "json") {
      const data: Record<string, unknown> = {
        reportName: `CodeSense Analysis Report - ${repoName}`,
        generatedAt: timestamp,
      };

      if (content === "all" || content === "stats") {
        data.statistics = {
          totalFiles: files.length,
          totalLines,
          filesByExtension: extensions,
        };
      }

      if (content === "all" || content === "structure") {
        data.fileStructure = files.map(f => ({
          path: f.path,
          lines: f.content.split('\n').length,
        }));
      }

      if (content === "all" || content === "chat") {
        data.conversation = messages.map(m => ({
          role: m.role,
          content: m.content,
        }));
      }

      return JSON.stringify(data, null, 2);
    }

    // Markdown/Text format
    const lines: string[] = [];
    const isMarkdown = format === "markdown";
    
    lines.push(isMarkdown ? `# CodeSense Analysis Report` : "CodeSense Analysis Report");
    lines.push(isMarkdown ? `**Repository:** ${repoName}` : `Repository: ${repoName}`);
    lines.push(isMarkdown ? `**Generated:** ${timestamp}` : `Generated: ${timestamp}`);
    lines.push("");

    if (content === "all" || content === "stats") {
      lines.push(isMarkdown ? "## Statistics" : "Statistics");
      lines.push(isMarkdown ? "---" : "---");
      lines.push(`Total Files: ${files.length}`);
      lines.push(`Total Lines: ${totalLines.toLocaleString()}`);
      lines.push("");
      lines.push(isMarkdown ? "### Files by Extension" : "Files by Extension:");
      Object.entries(extensions)
        .sort((a, b) => b[1] - a[1])
        .forEach(([ext, count]) => {
          lines.push(isMarkdown ? `- \`.${ext}\`: ${count} files` : `  .${ext}: ${count} files`);
        });
      lines.push("");
    }

    if (content === "all" || content === "structure") {
      lines.push(isMarkdown ? "## File Structure" : "File Structure");
      lines.push(isMarkdown ? "---" : "---");
      files.forEach(f => {
        const lineCount = f.content.split('\n').length;
        lines.push(isMarkdown 
          ? `- \`${f.path}\` (${lineCount} lines)` 
          : `  ${f.path} (${lineCount} lines)`
        );
      });
      lines.push("");
    }

    if (content === "all" || content === "chat") {
      lines.push(isMarkdown ? "## Conversation" : "Conversation");
      lines.push(isMarkdown ? "---" : "---");
      messages.forEach(m => {
        const role = m.role === "user" ? "User" : "Assistant";
        lines.push(isMarkdown ? `### ${role}` : `${role}:`);
        lines.push(m.content);
        lines.push("");
      });
    }

    return lines.join("\n");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Report copied to clipboard!");
  };

  const handleDownload = () => {
    if (format === "pdf") {
      handlePdfExport();
      return;
    }
    const report = generateReport();
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    const ext = format === "json" ? "json" : format === "markdown" ? "md" : "txt";
    a.download = `codesense-report-${repoName?.replace(/\//g, "-") || "export"}.${ext}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded!");
    onClose();
  };

  const handlePdfExport = () => {
    const report = generateReport();
    const printWin = window.open("", "_blank");
    if (!printWin) {
      toast.error("Please allow popups to export PDF");
      return;
    }
    printWin.document.write(`<!DOCTYPE html><html><head><title>CodeSense Report - ${repoName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a2e; line-height: 1.7; }
        h1 { color: #0d9488; font-size: 24px; border-bottom: 2px solid #0d9488; padding-bottom: 8px; }
        h2 { color: #1a1a2e; font-size: 18px; margin-top: 32px; }
        h3 { color: #374151; font-size: 15px; margin-top: 20px; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        pre { background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; overflow-x: auto; font-size: 13px; }
        ul, ol { padding-left: 20px; }
        li { margin-bottom: 4px; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
        .meta { color: #6b7280; font-size: 12px; margin-bottom: 24px; }
        @media print { body { margin: 20px; } }
      </style></head><body>`);
    // Convert markdown-like content to HTML
    const htmlContent = report
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^---$/gm, '<hr>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    printWin.document.write(`<div class="meta">Generated by CodeSense AI · ${new Date().toLocaleString()}</div>`);
    printWin.document.write(`<p>${htmlContent}</p>`);
    printWin.document.write('</body></html>');
    printWin.document.close();
    setTimeout(() => {
      printWin.print();
      toast.success("PDF export ready!");
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Download className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Export Report</h3>
              <p className="text-xs text-muted-foreground">Save your analysis</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Format</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "markdown", label: "Markdown", icon: FileText },
                { id: "json", label: "JSON", icon: FileJson },
                { id: "text", label: "Plain Text", icon: FileCode },
                { id: "pdf", label: "PDF", icon: Printer },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setFormat(id as ExportFormat)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors",
                    format === id 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Include</label>
            <div className="space-y-2">
              {[
                { id: "all", label: "Everything", desc: "Stats, structure, and chat" },
                { id: "chat", label: "Chat Only", desc: "Conversation messages" },
                { id: "structure", label: "Structure Only", desc: "File list and paths" },
                { id: "stats", label: "Statistics Only", desc: "Overview and metrics" },
              ].map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setContent(id as ExportContent)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                    content === id 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    content === id ? "border-primary" : "border-muted-foreground"
                  )}>
                    {content === id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{label}</span>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;
