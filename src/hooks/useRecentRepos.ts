import { useState, useCallback, useEffect } from "react";

export interface RecentRepo {
  name: string;
  url: string;
  source: "github" | "local" | "demo";
  accessedAt: number;
  fileCount?: number;
}

const STORAGE_KEY = "codesense_recent_repos";
const MAX_RECENT = 10;

export function useRecentRepos() {
  const [recentRepos, setRecentRepos] = useState<RecentRepo[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentRepos));
    } catch {
      console.warn("Failed to save recent repos");
    }
  }, [recentRepos]);

  const addRecentRepo = useCallback((repo: Omit<RecentRepo, "accessedAt">) => {
    setRecentRepos(prev => {
      // Remove existing entry if present
      const filtered = prev.filter(r => r.name !== repo.name);
      // Add new entry at the beginning
      const newEntry: RecentRepo = {
        ...repo,
        accessedAt: Date.now(),
      };
      return [newEntry, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const removeRecentRepo = useCallback((name: string) => {
    setRecentRepos(prev => prev.filter(r => r.name !== name));
  }, []);

  const clearRecentRepos = useCallback(() => {
    setRecentRepos([]);
  }, []);

  return {
    recentRepos,
    addRecentRepo,
    removeRecentRepo,
    clearRecentRepos,
  };
}
