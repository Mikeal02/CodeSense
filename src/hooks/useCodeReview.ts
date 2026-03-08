import { useState, useCallback } from "react";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface CodeReviewIssue {
  category: "bug" | "security" | "performance" | "improvement";
  severity: "critical" | "high" | "medium" | "low";
  line?: number;
  title: string;
  description: string;
  suggestion?: string;
}

export interface CodeReviewResult {
  score: number;
  summary: string;
  issues: CodeReviewIssue[];
  filePath: string;
  reviewedAt: string;
}

export function useCodeReview() {
  const [reviews, setReviews] = useState<Map<string, CodeReviewResult>>(new Map());
  const [isReviewing, setIsReviewing] = useState<string | null>(null);

  const reviewFile = useCallback(async (filePath: string, content: string) => {
    setIsReviewing(filePath);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/code-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ fileContent: content, filePath }),
      });

      if (response.status === 429) {
        toast.error("Rate limit exceeded. Please try again later.");
        return null;
      }
      if (response.status === 402) {
        toast.error("Credits required. Please add funds.");
        return null;
      }
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Review failed");
      }

      const result = await response.json();
      const review: CodeReviewResult = {
        ...result,
        filePath,
        reviewedAt: new Date().toISOString(),
      };

      setReviews((prev) => new Map(prev).set(filePath, review));
      toast.success(`Review complete: ${result.issues.length} issues found`);
      return review;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review failed");
      return null;
    } finally {
      setIsReviewing(null);
    }
  }, []);

  const getReview = useCallback((filePath: string) => reviews.get(filePath), [reviews]);

  const clearReviews = useCallback(() => setReviews(new Map()), []);

  return { reviews, isReviewing, reviewFile, getReview, clearReviews };
}
