import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ModesSection from "@/components/ModesSection";
import ChatInterface from "@/components/ChatInterface";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import GitHubRepoSelector from "@/components/GitHubRepoSelector";
import RecentReposPanel from "@/components/RecentReposPanel";
import CommandPalette from "@/components/CommandPalette";
import SettingsPanel from "@/components/SettingsPanel";
import NotificationCenter from "@/components/NotificationCenter";
import ActivityTimeline from "@/components/ActivityTimeline";
import ConversationManager from "@/components/ConversationManager";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import FileDiffView from "@/components/FileDiffView";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import { useCodebaseAnalysis } from "@/hooks/useCodebaseAnalysis";
import { useRecentRepos, RecentRepo } from "@/hooks/useRecentRepos";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/hooks/useSettings";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useConversations } from "@/hooks/useConversations";
import { useNotifications } from "@/hooks/useNotifications";
import { usePerformanceMetrics } from "@/hooks/usePerformanceMetrics";

const Index = () => {
  const [showGitHubSelector, setShowGitHubSelector] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedFileFromPalette, setSelectedFileFromPalette] = useState<string | undefined>();
  const [showStats, setShowStats] = useState(false);
  const [showCodeSearch, setShowCodeSearch] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSplitView, setShowSplitView] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDiffView, setShowDiffView] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();
  const { recentRepos, addRecentRepo, removeRecentRepo, clearRecentRepos } = useRecentRepos();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { activities, addActivity, clearActivities } = useActivityLog();
  const { notifications, unreadCount, addNotification, removeNotification, markAsRead, markAllAsRead, clearAll: clearNotifications } = useNotifications();
  const { conversations, activeConversation, activeConversationId, setActiveConversationId, createConversation, updateConversation, deleteConversation, togglePin, addTag, removeTag, clearAll: clearConversations } = useConversations();
  const { getStats, clearEntries, startTimer, endTimer } = usePerformanceMetrics();
  
  const {
    codebase,
    isLoading,
    messages,
    activeMode,
    connectRepo,
    uploadFolder,
    loadDemo,
    selectMode,
    askQuestion,
    githubToken,
    updateGithubToken,
  } = useCodebaseAnalysis();

  // Track repos when connected
  useEffect(() => {
    if (codebase) {
      addRecentRepo({
        name: codebase.repoName,
        url: codebase.source === "github" ? `https://github.com/${codebase.repoName}` : "",
        source: codebase.source,
        fileCount: codebase.files.length,
      });
      addActivity("repo_connected", `Connected to ${codebase.repoName}`, `${codebase.files.length} files loaded`);
      addNotification("success", "Repository Connected", `${codebase.repoName} loaded with ${codebase.files.length} files`);
    }
  }, [codebase?.repoName]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectRepo = async (repoUrl: string) => {
    setShowGitHubSelector(false);
    const timerId = startTimer("repo_connect");
    await connectRepo(repoUrl);
    endTimer(timerId);
  };

  const handleSelectRecentRepo = async (repo: RecentRepo) => {
    if (repo.source === "github" && repo.url) {
      await connectRepo(repo.url);
    } else if (repo.source === "demo") {
      loadDemo();
    }
  };

  const handleSelectMode = (mode: string) => {
    selectMode(mode);
    addActivity("mode_selected", `Selected ${mode} mode`);
  };

  const handleAskQuestion = (question: string) => {
    const timerId = startTimer("ai_analysis");
    askQuestion(question);
    addActivity("question_asked", question.slice(0, 60));
    // Note: timer ends naturally when loading completes
    setTimeout(() => endTimer(timerId), 100);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    addActivity("theme_changed", `Switched to ${isDarkMode ? 'light' : 'dark'} mode`);
  };

  return (
    <div className="min-h-screen bg-background noise-overlay">
      <Header 
        onConnectRepo={uploadFolder} 
        githubToken={githubToken}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        unreadNotifications={unreadCount}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenActivityLog={() => setShowActivityLog(true)}
        onOpenConversations={() => setShowConversations(true)}
        onOpenAnalytics={() => setShowAnalytics(true)}
        onOpenDiffView={() => setShowDiffView(true)}
        onOpenPerformance={() => setShowPerformance(true)}
        isConnected={!!codebase}
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSection 
          onSubmitRepo={connectRepo}
          onUploadFolder={uploadFolder}
          onLoadDemo={loadDemo}
          onOpenGitHubSelector={() => setShowGitHubSelector(true)}
          isLoading={isLoading}
          isConnected={!!codebase}
          repoName={codebase?.repoName}
          githubToken={githubToken}
          onUpdateGithubToken={updateGithubToken}
        />
      </motion.div>
      
      {!codebase && recentRepos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 sm:px-6 -mt-4 sm:-mt-8 mb-6 sm:mb-8 relative z-10"
        >
          <RecentReposPanel
            repos={recentRepos}
            onSelectRepo={handleSelectRecentRepo}
            onRemoveRepo={removeRecentRepo}
            onClearAll={clearRecentRepos}
            className="max-w-xl mx-auto"
          />
        </motion.div>
      )}
      
      <ModesSection 
        activeMode={activeMode} 
        onSelectMode={handleSelectMode}
        isConnected={!!codebase}
      />
      <ChatInterface 
        isActive={!!codebase}
        messages={messages}
        onSendMessage={handleAskQuestion}
        isLoading={isLoading}
        repoName={codebase?.repoName}
        files={codebase?.files || []}
        selectedFileFromPalette={selectedFileFromPalette}
        onClearSelectedFile={() => setSelectedFileFromPalette(undefined)}
      />
      <FeaturesSection />
      <Footer />
      
      {showGitHubSelector && (
        <GitHubRepoSelector
          onSelectRepo={handleSelectRepo}
          onClose={() => setShowGitHubSelector(false)}
          isLoading={isLoading}
          githubToken={githubToken || undefined}
        />
      )}

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        files={codebase?.files || []}
        onSelectFile={(path) => setSelectedFileFromPalette(path)}
        onOpenSearch={() => setShowCodeSearch(true)}
        onOpenBookmarks={() => setShowBookmarks(true)}
        onOpenExport={() => setShowExport(true)}
        onOpenShortcuts={() => setShowShortcuts(true)}
        onOpenSplitView={() => setShowSplitView(true)}
        onOpenStats={() => setShowStats(true)}
        onToggleTheme={handleToggleTheme}
        isDarkMode={isDarkMode}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
        onResetSettings={resetSettings}
      />

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onRemove={removeNotification}
        onClearAll={clearNotifications}
      />

      <ActivityTimeline
        isOpen={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        activities={activities}
        onClear={clearActivities}
      />

      <ConversationManager
        isOpen={showConversations}
        onClose={() => setShowConversations(false)}
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onDelete={deleteConversation}
        onTogglePin={togglePin}
        onRename={(id, name) => updateConversation(id, { name })}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onClearAll={clearConversations}
        onNew={() => {
          if (codebase) {
            createConversation(codebase.repoName, activeMode);
          }
        }}
      />

      <AnalyticsDashboard
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        files={codebase?.files || []}
      />

      <FileDiffView
        isOpen={showDiffView}
        onClose={() => setShowDiffView(false)}
        files={codebase?.files || []}
      />

      <PerformanceMonitor
        isOpen={showPerformance}
        onClose={() => setShowPerformance(false)}
        stats={getStats()}
        onClear={clearEntries}
      />
    </div>
  );
};

export default Index;
