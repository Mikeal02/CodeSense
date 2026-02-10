import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, X, Brain, Code, Palette, Shield, Sliders,
  RotateCcw, ChevronRight, Monitor, Sparkles, Eye
} from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { cn } from "@/lib/utils";
import { AppSettings } from "@/hooks/useSettings";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetSettings: () => void;
}

type SettingsTab = "ai" | "editor" | "ui" | "analysis" | "privacy";

const tabs: { id: SettingsTab; label: string; icon: typeof Brain }[] = [
  { id: "ai", label: "AI Engine", icon: Brain },
  { id: "editor", label: "Editor", icon: Code },
  { id: "ui", label: "Interface", icon: Palette },
  { id: "analysis", label: "Analysis", icon: Sliders },
  { id: "privacy", label: "Privacy", icon: Shield },
];

const aiModels = [
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", desc: "Fast & balanced" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", desc: "Best quality" },
  { id: "google/gemini-2.5-flash-lite", name: "Gemini Flash Lite", desc: "Fastest" },
  { id: "openai/gpt-5", name: "GPT-5", desc: "Most capable" },
  { id: "openai/gpt-5-mini", name: "GPT-5 Mini", desc: "Cost effective" },
];

const SettingsPanel = ({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
  onResetSettings,
}: SettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("ai");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex"
        >
          {/* Sidebar */}
          <div className="w-56 border-r border-border bg-card/50 p-4 space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Settings</span>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <ChevronRight className="w-3 h-3 ml-auto" />
                )}
              </button>
            ))}
            
            <div className="pt-4 border-t border-border mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetSettings}
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === "ai" && (
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-3 block">AI Model</label>
                        <div className="space-y-2">
                          {aiModels.map(model => (
                            <button
                              key={model.id}
                              onClick={() => onUpdateSetting("aiModel", model.id)}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                                settings.aiModel === model.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/40"
                              )}
                            >
                              <Sparkles className={cn(
                                "w-4 h-4",
                                settings.aiModel === model.id ? "text-primary" : "text-muted-foreground"
                              )} />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{model.name}</div>
                                <div className="text-xs text-muted-foreground">{model.desc}</div>
                              </div>
                              {settings.aiModel === model.id && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Temperature</label>
                          <span className="text-xs text-muted-foreground font-mono">{settings.temperature}</span>
                        </div>
                        <Slider
                          value={[settings.temperature * 100]}
                          onValueChange={([v]) => onUpdateSetting("temperature", v / 100)}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Precise</span>
                          <span>Creative</span>
                        </div>
                      </div>

                      <SettingToggle
                        label="Stream Responses"
                        description="Show AI responses as they generate"
                        checked={settings.streamResponses}
                        onChange={(v) => onUpdateSetting("streamResponses", v)}
                      />
                    </div>
                  )}

                  {activeTab === "editor" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Font Size</label>
                          <span className="text-xs text-muted-foreground font-mono">{settings.fontSize}px</span>
                        </div>
                        <Slider
                          value={[settings.fontSize]}
                          onValueChange={([v]) => onUpdateSetting("fontSize", v)}
                          min={10}
                          max={24}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Tab Size</label>
                          <span className="text-xs text-muted-foreground font-mono">{settings.tabSize}</span>
                        </div>
                        <Slider
                          value={[settings.tabSize]}
                          onValueChange={([v]) => onUpdateSetting("tabSize", v)}
                          min={2}
                          max={8}
                          step={2}
                          className="w-full"
                        />
                      </div>

                      <SettingToggle
                        label="Word Wrap"
                        description="Wrap long lines in the editor"
                        checked={settings.wordWrap}
                        onChange={(v) => onUpdateSetting("wordWrap", v)}
                      />
                      <SettingToggle
                        label="Line Numbers"
                        description="Show line numbers in the gutter"
                        checked={settings.showLineNumbers}
                        onChange={(v) => onUpdateSetting("showLineNumbers", v)}
                      />
                      <SettingToggle
                        label="Minimap"
                        description="Show code minimap on the side"
                        checked={settings.showMinimap}
                        onChange={(v) => onUpdateSetting("showMinimap", v)}
                      />
                    </div>
                  )}

                  {activeTab === "ui" && (
                    <div className="space-y-6">
                      <SettingToggle
                        label="Animations"
                        description="Enable smooth transitions and animations"
                        checked={settings.animationsEnabled}
                        onChange={(v) => onUpdateSetting("animationsEnabled", v)}
                      />
                      <SettingToggle
                        label="Compact Mode"
                        description="Reduce padding and spacing for more content"
                        checked={settings.compactMode}
                        onChange={(v) => onUpdateSetting("compactMode", v)}
                      />
                      <SettingToggle
                        label="Activity Log"
                        description="Track and display recent actions"
                        checked={settings.showActivityLog}
                        onChange={(v) => onUpdateSetting("showActivityLog", v)}
                      />
                      <SettingToggle
                        label="Auto-Save Conversations"
                        description="Automatically save chat sessions"
                        checked={settings.autoSaveConversations}
                        onChange={(v) => onUpdateSetting("autoSaveConversations", v)}
                      />
                    </div>
                  )}

                  {activeTab === "analysis" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Max Files</label>
                          <span className="text-xs text-muted-foreground font-mono">{settings.maxFilesToAnalyze}</span>
                        </div>
                        <Slider
                          value={[settings.maxFilesToAnalyze]}
                          onValueChange={([v]) => onUpdateSetting("maxFilesToAnalyze", v)}
                          min={10}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <SettingToggle
                        label="Include Comments"
                        description="Send code comments to AI for context"
                        checked={settings.includeComments}
                        onChange={(v) => onUpdateSetting("includeComments", v)}
                      />
                      <SettingToggle
                        label="Complexity Warnings"
                        description="Show alerts for complex code areas"
                        checked={settings.showComplexityWarnings}
                        onChange={(v) => onUpdateSetting("showComplexityWarnings", v)}
                      />
                      <SettingToggle
                        label="Deep Analysis"
                        description="More thorough but slower analysis"
                        checked={settings.deepAnalysis}
                        onChange={(v) => onUpdateSetting("deepAnalysis", v)}
                      />
                    </div>
                  )}

                  {activeTab === "privacy" && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-info" />
                          <span className="text-sm font-medium text-info">Privacy First</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your code is processed in real-time and never stored on our servers. 
                          All analysis happens through secure API calls.
                        </p>
                      </div>

                      <SettingToggle
                        label="Usage Analytics"
                        description="Help improve CodeSense with anonymous usage data"
                        checked={settings.sendAnalytics}
                        onChange={(v) => onUpdateSetting("sendAnalytics", v)}
                      />
                      <SettingToggle
                        label="Persist History"
                        description="Save conversation history in local storage"
                        checked={settings.persistHistory}
                        onChange={(v) => onUpdateSetting("persistHistory", v)}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default SettingsPanel;
