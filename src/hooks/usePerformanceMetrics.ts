import { useState, useCallback, useRef } from "react";

export interface PerformanceEntry {
  id: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  slowestOperation: PerformanceEntry | null;
  fastestOperation: PerformanceEntry | null;
  operationCounts: Record<string, number>;
  recentEntries: PerformanceEntry[];
}

export function usePerformanceMetrics() {
  const [entries, setEntries] = useState<PerformanceEntry[]>([]);
  const activeTimers = useRef<Map<string, PerformanceEntry>>(new Map());

  const startTimer = useCallback((operation: string, metadata?: Record<string, unknown>): string => {
    const id = `perf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const entry: PerformanceEntry = {
      id,
      operation,
      startTime: performance.now(),
      metadata,
    };
    activeTimers.current.set(id, entry);
    return id;
  }, []);

  const endTimer = useCallback((id: string): PerformanceEntry | null => {
    const entry = activeTimers.current.get(id);
    if (!entry) return null;

    const endTime = performance.now();
    const completed: PerformanceEntry = {
      ...entry,
      endTime,
      duration: endTime - entry.startTime,
    };

    activeTimers.current.delete(id);
    setEntries(prev => [completed, ...prev].slice(0, 200));
    return completed;
  }, []);

  const recordOperation = useCallback((
    operation: string,
    duration: number,
    metadata?: Record<string, unknown>
  ) => {
    const entry: PerformanceEntry = {
      id: `perf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      operation,
      startTime: performance.now() - duration,
      endTime: performance.now(),
      duration,
      metadata,
    };
    setEntries(prev => [entry, ...prev].slice(0, 200));
  }, []);

  const getStats = useCallback((): PerformanceStats => {
    const completed = entries.filter(e => e.duration !== undefined);
    const durations = completed.map(e => e.duration!);
    
    const operationCounts: Record<string, number> = {};
    completed.forEach(e => {
      operationCounts[e.operation] = (operationCounts[e.operation] || 0) + 1;
    });

    return {
      totalOperations: completed.length,
      averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      slowestOperation: completed.reduce((max, e) => (!max || (e.duration || 0) > (max.duration || 0)) ? e : max, null as PerformanceEntry | null),
      fastestOperation: completed.reduce((min, e) => (!min || (e.duration || 0) < (min.duration || 0)) ? e : min, null as PerformanceEntry | null),
      operationCounts,
      recentEntries: completed.slice(0, 20),
    };
  }, [entries]);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    startTimer,
    endTimer,
    recordOperation,
    getStats,
    clearEntries,
  };
}
