import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShareReportData {
  repoName: string;
  activeMode?: string;
  messages: Array<{ id: string; role: string; content: string }>;
  fileSummary: Array<{ path: string; lines: number; extension: string }>;
}

export function useShareReport() {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const shareReport = async (data: ShareReportData) => {
    setIsSharing(true);
    try {
      const fileSummary = data.fileSummary.slice(0, 100);

      const { data: report, error } = await supabase
        .from("shared_reports")
        .insert({
          repo_name: data.repoName,
          active_mode: data.activeMode,
          messages: data.messages as any,
          file_summary: fileSummary as any,
        })
        .select("id")
        .single();

      if (error) throw error;

      const url = `${window.location.origin}/report/${report.id}`;
      setShareUrl(url);

      await navigator.clipboard.writeText(url);
      toast.success("Report link copied to clipboard!", {
        description: "Share this URL with anyone to view the analysis.",
      });

      return url;
    } catch (err) {
      console.error("Failed to share report:", err);
      toast.error("Failed to generate share link");
      return null;
    } finally {
      setIsSharing(false);
    }
  };

  return { shareReport, isSharing, shareUrl, setShareUrl };
}
