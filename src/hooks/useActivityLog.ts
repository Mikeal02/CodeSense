import { useState, useCallback } from "react";

export type ActivityType = 
  | "repo_connected" 
  | "mode_selected" 
  | "question_asked" 
  | "file_viewed" 
  | "bookmark_added"
  | "export_created"
  | "search_performed"
  | "theme_changed"
  | "conversation_saved"
  | "error_occurred";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = "codesense_activity_log";
const MAX_ENTRIES = 100;

export function useActivityLog() {
  const [activities, setActivities] = useState<ActivityEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addActivity = useCallback((
    type: ActivityType,
    title: string,
    description?: string,
    metadata?: Record<string, unknown>
  ) => {
    const entry: ActivityEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      description,
      timestamp: Date.now(),
      metadata,
    };

    setActivities(prev => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return entry;
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getActivitiesByType = useCallback((type: ActivityType) => {
    return activities.filter(a => a.type === type);
  }, [activities]);

  const getRecentActivities = useCallback((count: number = 10) => {
    return activities.slice(0, count);
  }, [activities]);

  return {
    activities,
    addActivity,
    clearActivities,
    getActivitiesByType,
    getRecentActivities,
  };
}
