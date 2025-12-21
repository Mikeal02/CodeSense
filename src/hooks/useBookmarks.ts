import { useState, useEffect, useCallback } from "react";

export interface Bookmark {
  id: string;
  path: string;
  lineNumber?: number;
  label?: string;
  color: "blue" | "green" | "yellow" | "red" | "purple";
  createdAt: number;
}

const STORAGE_KEY = "codesense_bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = useCallback((
    path: string, 
    lineNumber?: number, 
    label?: string,
    color: Bookmark["color"] = "blue"
  ) => {
    const bookmark: Bookmark = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      path,
      lineNumber,
      label,
      color,
      createdAt: Date.now(),
    };
    
    setBookmarks(prev => [...prev, bookmark]);
    return bookmark;
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  }, []);

  const updateBookmark = useCallback((id: string, updates: Partial<Omit<Bookmark, "id" | "createdAt">>) => {
    setBookmarks(prev => prev.map(b => 
      b.id === id ? { ...b, ...updates } : b
    ));
  }, []);

  const isBookmarked = useCallback((path: string, lineNumber?: number) => {
    return bookmarks.some(b => 
      b.path === path && 
      (lineNumber === undefined || b.lineNumber === lineNumber)
    );
  }, [bookmarks]);

  const getBookmarksForFile = useCallback((path: string) => {
    return bookmarks.filter(b => b.path === path);
  }, [bookmarks]);

  const clearAllBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    updateBookmark,
    isBookmarked,
    getBookmarksForFile,
    clearAllBookmarks,
  };
}
