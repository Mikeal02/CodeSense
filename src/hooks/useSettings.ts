import { useState, useCallback, useEffect } from "react";

export interface AppSettings {
  // AI Settings
  aiModel: string;
  temperature: number;
  maxTokens: number;
  streamResponses: boolean;
  
  // Editor Settings
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  showMinimap: boolean;
  
  // UI Settings
  animationsEnabled: boolean;
  compactMode: boolean;
  showActivityLog: boolean;
  autoSaveConversations: boolean;
  
  // Analysis Settings
  maxFilesToAnalyze: number;
  includeComments: boolean;
  showComplexityWarnings: boolean;
  deepAnalysis: boolean;
  
  // Audio
  soundEffects: boolean;
  
  // Privacy
  sendAnalytics: boolean;
  persistHistory: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  aiModel: "google/gemini-2.5-flash",
  temperature: 0.7,
  maxTokens: 4096,
  streamResponses: true,
  
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  showLineNumbers: true,
  showMinimap: true,
  
  animationsEnabled: true,
  compactMode: false,
  showActivityLog: true,
  autoSaveConversations: true,
  
  maxFilesToAnalyze: 50,
  includeComments: true,
  showComplexityWarnings: true,
  deepAnalysis: false,
  
  sendAnalytics: false,
  persistHistory: true,
};

const STORAGE_KEY = "codesense_settings";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    DEFAULT_SETTINGS,
  };
}
