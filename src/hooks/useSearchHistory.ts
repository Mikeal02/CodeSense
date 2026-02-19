import { useState, useCallback, useEffect } from "react";

export interface SearchEntry {
  id: string;
  query: string;
  resultsCount: number;
  timestamp: number;
  filters: {
    regex: boolean;
    caseSensitive: boolean;
    wholeWord: boolean;
    fileTypes: string[];
  };
}

const STORAGE_KEY = "codesense_search_history";
const MAX_ENTRIES = 30;

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addEntry = useCallback((
    query: string,
    resultsCount: number,
    filters: SearchEntry["filters"]
  ) => {
    const entry: SearchEntry = {
      id: `search-${Date.now()}`,
      query,
      resultsCount,
      timestamp: Date.now(),
      filters,
    };
    setHistory(prev => {
      // Deduplicate by query
      const filtered = prev.filter(e => e.query !== query);
      return [entry, ...filtered].slice(0, MAX_ENTRIES);
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setHistory(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getFrequentSearches = useCallback(() => {
    const freq = new Map<string, number>();
    history.forEach(e => {
      freq.set(e.query, (freq.get(e.query) || 0) + 1);
    });
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query]) => query);
  }, [history]);

  return {
    history,
    addEntry,
    removeEntry,
    clearHistory,
    getFrequentSearches,
  };
}
