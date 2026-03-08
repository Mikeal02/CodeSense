import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Shield, ShieldAlert, ShieldCheck, ShieldX, ExternalLink,
  Loader2, Package, AlertTriangle, ChevronDown, ChevronRight, RefreshCw
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useDependencyScan, Vulnerability } from "@/hooks/useDependencyScan";
import { ScrollArea } from "./ui/scroll-area";

interface DependencyScannerProps {
  isOpen: boolean;
  onClose: () => void;
  files: { path: string; content: string }[];
}

const severityConfig = {
  critical: { icon: ShieldX, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", ring: "ring-red-500/20" },
  high: { icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", ring: "ring-orange-500/20" },
  medium: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", ring: "ring-yellow-500/20" },
  low: { icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", ring: "ring-blue-500/20" },
};

const VulnCard = ({ vuln, index }: { vuln: Vulnerability; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = severityConfig[vuln.severity] || severityConfig.medium;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn("border rounded-lg overflow-hidden", cfg.border)}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
      >
        <Icon className={cn("w-4 h-4 shrink-0", cfg.color)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{vuln.package}</span>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">v{vuln.version}</span>
            {/* CVSS Score Badge */}
            {vuln.severity === "critical" && (
              <span className="text-[9px] font-bold text-red-300 bg-red-500/20 px-1.5 py-0.5 rounded-full ring-1 ring-red-500/30 animate-pulse">CVSS 9.0+</span>
            )}
            {vuln.severity === "high" && (
              <span className="text-[9px] font-bold text-orange-300 bg-orange-500/20 px-1.5 py-0.5 rounded-full ring-1 ring-orange-500/30">CVSS 7.0+</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{vuln.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ring-1", cfg.bg, cfg.color, cfg.ring)}>
            {vuln.severity}
          </span>
          {vuln.fixedIn && vuln.fixedIn !== "No fix available" && (
            <span className="text-[9px] bg-success/10 text-success px-1.5 py-0.5 rounded-full ring-1 ring-success/20">
              Fix ✓
            </span>
          )}
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground">
                  {vuln.cve}
                </span>
                {vuln.fixedIn && vuln.fixedIn !== "No fix available" && (
                  <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">
                    Fix: v{vuln.fixedIn}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{vuln.description}</p>
              {vuln.url && (
                <a
                  href={vuln.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View Advisory <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DependencyScanner = ({ isOpen, onClose, files }: DependencyScannerProps) => {
  const { scanResult, isScanning, scanDependencies } = useDependencyScan();

  const packageJson = files.find((f) => f.path === "package.json" || f.path.endsWith("/package.json"));

  const handleScan = () => {
    if (packageJson) {
      scanDependencies(packageJson.content);
    }
  };

  const critCount = scanResult?.vulnerabilities.filter((v) => v.severity === "critical").length || 0;
  const highCount = scanResult?.vulnerabilities.filter((v) => v.severity === "high").length || 0;
  const medCount = scanResult?.vulnerabilities.filter((v) => v.severity === "medium").length || 0;
  const lowCount = scanResult?.vulnerabilities.filter((v) => v.severity === "low").length || 0;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Dependency Vulnerability Scanner</h2>
              <p className="text-xs text-muted-foreground">
                {scanResult
                  ? `${scanResult.totalScanned} packages scanned • ${scanResult.vulnerabilities.length} vulnerabilities`
                  : "Scan package.json against CVE databases"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleScan}
              disabled={isScanning || !packageJson}
              className="gap-1.5"
            >
              {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {scanResult ? "Re-scan" : "Scan Now"}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {scanResult ? (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Summary Banner */}
            {(critCount > 0 || highCount > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mx-4 mt-3 px-4 py-2.5 rounded-lg border flex items-center gap-3",
                  critCount > 0 ? "bg-red-500/5 border-red-500/20" : "bg-orange-500/5 border-orange-500/20"
                )}
              >
                <ShieldX className={cn("w-5 h-5 shrink-0", critCount > 0 ? "text-red-400" : "text-orange-400")} />
                <p className="text-xs text-foreground">
                  <strong>{critCount + highCount} high-priority</strong> vulnerabilities found.
                  {scanResult?.vulnerabilities.some(v => v.fixedIn && v.fixedIn !== "No fix available")
                    ? " Fixes are available for some packages."
                    : " Review and mitigate manually."}
                </p>
              </motion.div>
            )}

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-3 p-4 border-b border-border">
              {[
                { label: "Critical", count: critCount, ...severityConfig.critical },
                { label: "High", count: highCount, ...severityConfig.high },
                { label: "Medium", count: medCount, ...severityConfig.medium },
                { label: "Low", count: lowCount, ...severityConfig.low },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("rounded-lg border p-3 text-center", item.border, item.bg)}
                  >
                    <Icon className={cn("w-5 h-5 mx-auto mb-1", item.color)} />
                    <p className="text-lg font-bold text-foreground">{item.count}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Vuln List */}
            <ScrollArea className="flex-1 p-4">
              {scanResult.vulnerabilities.length > 0 ? (
                <div className="space-y-2">
                  {scanResult.vulnerabilities.map((vuln, idx) => (
                    <VulnCard key={`${vuln.cve}-${idx}`} vuln={vuln} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <ShieldCheck className="w-14 h-14 mx-auto text-green-400 mb-4" />
                  <p className="text-lg font-medium text-foreground">All Clear!</p>
                  <p className="text-sm text-muted-foreground mt-1">No known vulnerabilities detected in your dependencies</p>
                </div>
              )}
            </ScrollArea>

            <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground text-center">
              Data from <span className="font-medium">OSV.dev</span> • Scanned at {new Date(scanResult.scannedAt).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            {isScanning ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                <p className="text-foreground font-medium">Scanning dependencies...</p>
                <p className="text-sm text-muted-foreground mt-1">Checking against known vulnerability databases</p>
              </div>
            ) : !packageJson ? (
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-foreground font-medium">No package.json found</p>
                <p className="text-sm text-muted-foreground mt-1">Connect a repository with a package.json to scan</p>
              </div>
            ) : (
              <div className="text-center">
                <ShieldAlert className="w-12 h-12 mx-auto text-orange-400/40 mb-4" />
                <p className="text-foreground font-medium">Ready to scan</p>
                <p className="text-sm text-muted-foreground mt-1">Click "Scan Now" to check for vulnerabilities</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DependencyScanner;
