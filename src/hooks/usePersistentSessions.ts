import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Session {
  id: string;
  repo_name: string;
  source: string;
  active_mode: string | null;
  messages: any[];
  bookmarks: any[];
  settings: any;
  file_count: number;
  last_accessed_at: string;
  created_at: string;
  user_id: string | null;
}

export function usePersistentSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Track auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load recent sessions on mount and when user changes
  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("last_accessed_at", { ascending: false })
        .limit(20);
      if (!error && data) {
        setSessions(data as unknown as Session[]);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = useCallback(async (session: Omit<Session, "id" | "created_at" | "last_accessed_at" | "user_id">) => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          repo_name: session.repo_name,
          source: session.source,
          active_mode: session.active_mode,
          messages: session.messages as any,
          bookmarks: session.bookmarks as any,
          settings: session.settings as any,
          file_count: session.file_count,
          user_id: userId,
        })
        .select()
        .single();
      if (!error && data) {
        const newSession = data as unknown as Session;
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        return newSession;
      }
    } catch {}
    return null;
  }, [userId]);

  const updateSession = useCallback(async (id: string, updates: Partial<Pick<Session, "messages" | "bookmarks" | "active_mode" | "settings">>) => {
    try {
      await supabase
        .from("sessions")
        .update({
          ...updates,
          messages: updates.messages as any,
          bookmarks: updates.bookmarks as any,
          settings: updates.settings as any,
          last_accessed_at: new Date().toISOString(),
        })
        .eq("id", id);
      setSessions(prev =>
        prev.map(s => s.id === id ? { ...s, ...updates, last_accessed_at: new Date().toISOString() } : s)
      );
    } catch {}
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    try {
      await supabase.from("sessions").delete().eq("id", id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) setActiveSessionId(null);
    } catch {}
  }, [activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    isLoading,
    saveSession,
    updateSession,
    deleteSession,
    loadSessions,
    userId,
  };
}
