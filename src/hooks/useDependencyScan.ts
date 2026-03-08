import { useState, useCallback } from "react";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface Vulnerability {
  package: string;
  version: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  cve: string;
  description: string;
  fixedIn: string;
  url: string;
}

export interface ScanResult {
  totalScanned: number;
  vulnerabilities: Vulnerability[];
  scannedAt: string;
}

export function useDependencyScan() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const scanDependencies = useCallback(async (packageJsonContent: string) => {
    setIsScanning(true);
    try {
      const parsed = JSON.parse(packageJsonContent);
      const deps = {
        ...parsed.dependencies,
        ...parsed.devDependencies,
      };

      if (Object.keys(deps).length === 0) {
        toast.error("No dependencies found in package.json");
        return null;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/scan-dependencies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ dependencies: deps }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Scan failed");
      }

      const result: ScanResult = await response.json();
      setScanResult(result);

      const critCount = result.vulnerabilities.filter((v) => v.severity === "critical").length;
      const highCount = result.vulnerabilities.filter((v) => v.severity === "high").length;

      if (critCount > 0 || highCount > 0) {
        toast.warning(`Found ${critCount} critical, ${highCount} high severity vulnerabilities`);
      } else if (result.vulnerabilities.length > 0) {
        toast.info(`Found ${result.vulnerabilities.length} vulnerabilities`);
      } else {
        toast.success("No known vulnerabilities found!");
      }

      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scan failed");
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearScan = useCallback(() => setScanResult(null), []);

  return { scanResult, isScanning, scanDependencies, clearScan };
}
