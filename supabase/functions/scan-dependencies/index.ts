import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VulnResult {
  package: string;
  version: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  cve: string;
  description: string;
  fixedIn: string;
  url: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dependencies } = await req.json();

    if (!dependencies || typeof dependencies !== "object") {
      return new Response(JSON.stringify({ error: "dependencies object is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vulns: VulnResult[] = [];
    const packages = Object.entries(dependencies).slice(0, 30);

    // Query OSV.dev API for each dependency
    const results = await Promise.allSettled(
      packages.map(async ([pkg, versionRange]) => {
        const version = String(versionRange).replace(/[\^~>=<]/g, "").split(" ")[0];

        try {
          const response = await fetch("https://api.osv.dev/v1/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              version,
              package: { name: pkg, ecosystem: "npm" },
            }),
          });

          if (!response.ok) {
            await response.text();
            return [];
          }

          const data = await response.json();
          if (!data.vulns || data.vulns.length === 0) return [];

          return data.vulns.slice(0, 3).map((vuln: any) => {
            const severity = vuln.database_specific?.severity?.toLowerCase() ||
              (vuln.severity?.[0]?.score >= 9 ? "critical" :
                vuln.severity?.[0]?.score >= 7 ? "high" :
                  vuln.severity?.[0]?.score >= 4 ? "medium" : "low");

            const fixedVersions = vuln.affected?.[0]?.ranges?.[0]?.events
              ?.filter((e: any) => e.fixed)
              ?.map((e: any) => e.fixed) || [];

            return {
              package: pkg,
              version,
              severity: severity || "medium",
              title: vuln.summary || vuln.id,
              cve: vuln.aliases?.find((a: string) => a.startsWith("CVE-")) || vuln.id,
              description: (vuln.details || vuln.summary || "No description available").slice(0, 300),
              fixedIn: fixedVersions[fixedVersions.length - 1] || "No fix available",
              url: vuln.references?.[0]?.url || `https://osv.dev/vulnerability/${vuln.id}`,
            } as VulnResult;
          });
        } catch (err) {
          console.warn(`Failed to check ${pkg}:`, err);
          return [];
        }
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        vulns.push(...result.value);
      }
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    vulns.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

    return new Response(JSON.stringify({
      totalScanned: packages.length,
      vulnerabilities: vulns,
      scannedAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in scan-dependencies:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
