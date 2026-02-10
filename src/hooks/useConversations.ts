import { useState, useCallback, useEffect } from "react";
import { Message } from "@/components/ChatInterface";

export interface Conversation {
  id: string;
  name: string;
  repoName: string;
  mode: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  tags: string[];
}

const STORAGE_KEY = "codesense_conversations";
const MAX_CONVERSATIONS = 50;

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  const createConversation = useCallback((
    repoName: string,
    mode: string,
    name?: string
  ): Conversation => {
    const conv: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name || `${mode} - ${new Date().toLocaleDateString()}`,
      repoName,
      mode,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      tags: [],
    };

    setConversations(prev => {
      const updated = [conv, ...prev].slice(0, MAX_CONVERSATIONS);
      return updated;
    });

    setActiveConversationId(conv.id);
    return conv;
  }, []);

  const updateConversation = useCallback((id: string, updates: Partial<Omit<Conversation, "id" | "createdAt">>) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
    ));
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  const togglePin = useCallback((id: string) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, pinned: !c.pinned } : c
    ));
  }, []);

  const addTag = useCallback((id: string, tag: string) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, tags: [...new Set([...c.tags, tag])] } : c
    ));
  }, []);

  const removeTag = useCallback((id: string, tag: string) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, tags: c.tags.filter(t => t !== tag) } : c
    ));
  }, []);

  const getConversationsByRepo = useCallback((repoName: string) => {
    return conversations.filter(c => c.repoName === repoName);
  }, [conversations]);

  const clearAll = useCallback(() => {
    setConversations([]);
    setActiveConversationId(null);
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  // Sort: pinned first, then by updatedAt
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  return {
    conversations: sortedConversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    updateConversation,
    deleteConversation,
    togglePin,
    addTag,
    removeTag,
    getConversationsByRepo,
    clearAll,
  };
}
