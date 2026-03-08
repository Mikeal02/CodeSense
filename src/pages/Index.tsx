import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ModesSection from "@/components/ModesSection";
import ChatInterface from "@/components/ChatInterface";
import FeaturesSection from "@/components/FeaturesSection";
import SocialProofSection from "@/components/SocialProofSection";
import Footer from "@/components/Footer";
import GitHubRepoSelector from "@/components/GitHubRepoSelector";
import CommandPalette from "@/components/CommandPalette";
import StatusBar from "@/components/StatusBar";
import FloatingDock from "@/components/FloatingDock";
import Breadcrumbs from "@/components/Breadcrumbs";
import TerminalBanner from "@/components/TerminalBanner";
import OnboardingOverlay from "@/components/OnboardingOverlay";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import CustomCursor from "@/components/CustomCursor";
import ErrorBoundary from "@/components/ErrorBoundary";
import ConfettiExplosion from "@/components/ConfettiExplosion";
import { useCodebaseAnalysis } from "@/hooks/useCodebaseAnalysis";
import { useRecentRepos, RecentRepo } from "@/hooks/useRecentRepos";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/hooks/useSettings";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useConversations } from "@/hooks/useConversations";
import { useNotifications } from "@/hooks/useNotifications";
import { usePerformanceMetrics } from "@/hooks/usePerformanceMetrics";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useShareReport } from "@/hooks/useShareReport";
import { useRepoInsights } from "@/hooks/useRepoInsights";
import { usePersistentSessions } from "@/hooks/usePersistentSessions";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// Lazy-load heavy workspace panels
const RecentReposPanel = lazy(() => import("@/components/RecentReposPanel"));
const SettingsPanel = lazy(() => import("@/components/SettingsPanel"));
const NotificationCenter = lazy(() => import("@/components/NotificationCenter"));
const ActivityTimeline = lazy(() => import("@/components/ActivityTimeline"));
const ConversationManager = lazy(() => import("@/components/ConversationManager"));
const AnalyticsDashboard = lazy(() => import("@/components/AnalyticsDashboard"));
const FileDiffView = lazy(() => import("@/components/FileDiffView"));
const PerformanceMonitor = lazy(() => import("@/components/PerformanceMonitor"));
const CodeReviewPanel = lazy(() => import("@/components/CodeReviewPanel"));
const DependencyScanner = lazy(() => import("@/components/DependencyScanner"));

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
  const [showCodeReview, setShowCodeReview] = useState(false);
  const [showDepScanner, setShowDepScanner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();
  const { recentRepos, addRecentRepo, removeRecentRepo, clearRecentRepos } = useRecentRepos();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { activities, addActivity, clearActivities } = useActivityLog();
  const { notifications, unreadCount, addNotification, removeNotification, markAsRead, markAllAsRead, clearAll: clearNotifications } = useNotifications();
  const { conversations, activeConversation, activeConversationId, setActiveConversationId, createConversation, updateConversation, deleteConversation, togglePin, addTag, removeTag, clearAll: clearConversations } = useConversations();
  const { getStats, clearEntries, startTimer, endTimer } = usePerformanceMetrics();
  const { history: searchHistory, addEntry: addSearchEntry } = useSearchHistory();
  const onboarding = useOnboarding();
  const { shareReport, isSharing } = useShareReport();
  const repoInsights = useRepoInsights();
  const { sessions, saveSession, updateSession, activeSessionId, setActiveSessionId } = usePersistentSessions();
  const { play: playSound } = useSoundEffects();
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

  // Track repos and persist sessions when connected
  useEffect(() => {
    if (codebase) {
      // Play connect sound + confetti
      playSound("connect");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      addRecentRepo({
        name: codebase.repoName,
        url: codebase.source === "github" ? `https://github.com/${codebase.repoName}` : "",
        source: codebase.source,
        fileCount: codebase.files.length,
      });
      addActivity("repo_connected", `Connected to ${codebase.repoName}`, `${codebase.files.length} files loaded`);
      addNotification("success", "Repository Connected", `${codebase.repoName} loaded with ${codebase.files.length} files`);
      
      // Save persistent session
      saveSession({
        repo_name: codebase.repoName,
        source: codebase.source,
        active_mode: activeMode,
        messages: [],
        bookmarks: [],
        settings: null,
        file_count: codebase.files.length,
      });

      if (codebase.source === "github") {
        repoInsights.fetchInsights(codebase.repoName, githubToken);
      }
    }
  }, [codebase?.repoName]);

  // Persist messages to session when they change
  useEffect(() => {
    if (activeSessionId && messages.length > 0) {
      updateSession(activeSessionId, {
        messages: messages.map(m => ({ id: m.id, role: m.role, content: m.content })),
        active_mode: activeMode,
      });
    }
  }, [messages.length, activeMode]);

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setShowActivityLog(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAnalytics(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowPerformance(true);
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
    setTimeout(() => endTimer(timerId), 100);
  };

  const handleToggleTheme = (e?: React.MouseEvent | MouseEvent) => {
    toggleTheme(e);
    addActivity("theme_changed", `Switched to ${isDarkMode ? 'light' : 'dark'} mode`);
  };

  const handleShareReport = () => {
    if (!codebase) return;
    const fileSummary = codebase.files.map(f => ({
      path: f.path,
      lines: f.content.split("\n").length,
      extension: f.path.split(".").pop() || "other",
    }));
    shareReport({
      repoName: codebase.repoName,
      activeMode,
      messages: messages.map(m => ({ id: m.id, role: m.role, content: m.content })),
      fileSummary,
    });
    addActivity("report_shared", `Shared report for ${codebase.repoName}`);
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh noise-overlay pb-7 overflow-x-clip">
      {/* Elite effects */}
      <CustomCursor />
      <CursorGlow />
      <ScrollProgress />
      <ConfettiExplosion active={showConfetti} />

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
        onOpenCodeReview={() => setShowCodeReview(true)}
        onOpenDepScanner={() => setShowDepScanner(true)}
        isConnected={!!codebase}
      />

      {/* Breadcrumbs - shown when connected */}
      <AnimatePresence>
        {codebase && (
          <motion.div
            className="pt-14 sm:pt-16"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Breadcrumbs
              repoName={codebase.repoName}
              activeMode={activeMode}
              isConnected={!!codebase}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div>
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
          files={codebase?.files}
          repoInsights={repoInsights}
        />
      </div>
      
      <AnimatePresence mode="popLayout">
        {!codebase && recentRepos.length > 0 && (
          <motion.div
            key="recent-repos"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="container mx-auto px-4 sm:px-6 -mt-4 sm:-mt-8 mb-6 sm:mb-8 relative z-10"
          >
            <Suspense fallback={null}>
              <RecentReposPanel
                repos={recentRepos}
                onSelectRepo={handleSelectRecentRepo}
                onRemoveRepo={removeRecentRepo}
                onClearAll={clearRecentRepos}
                className="max-w-xl mx-auto"
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div>
        <ModesSection 
          activeMode={activeMode} 
          onSelectMode={handleSelectMode}
          isConnected={!!codebase}
        />
      </div>

      <AnimatePresence mode="wait">
        {!!codebase && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <ErrorBoundary fallbackMessage="Chat interface encountered an error. Try refreshing.">
              <ChatInterface 
                isActive={!!codebase}
                messages={messages}
                onSendMessage={handleAskQuestion}
                isLoading={isLoading}
                repoName={codebase?.repoName}
                files={codebase?.files || []}
                selectedFileFromPalette={selectedFileFromPalette}
                onClearSelectedFile={() => setSelectedFileFromPalette(undefined)}
                onShareReport={handleShareReport}
                isSharing={isSharing}
              />
            </ErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>
      <SocialProofSection />
      <FeaturesSection />
      <Footer />

      {/* Status Bar */}
      <StatusBar
        isConnected={!!codebase}
        repoName={codebase?.repoName}
        fileCount={codebase?.files.length || 0}
        activeMode={activeMode}
        isLoading={isLoading}
        isDarkMode={isDarkMode}
        messageCount={messages.length}
        performanceScore={getStats().averageDuration ? Math.min(100, Math.round(1000 / (getStats().averageDuration || 1))) : undefined}
      />
      
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
        onSelectMode={handleSelectMode}
        activeMode={activeMode}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAnalytics={() => setShowAnalytics(true)}
        onOpenActivityLog={() => setShowActivityLog(true)}
        onOpenConversations={() => setShowConversations(true)}
        onOpenDiffView={() => setShowDiffView(true)}
        onOpenPerformance={() => setShowPerformance(true)}
        onStartOnboarding={onboarding.restart}
        isConnected={!!codebase}
      />

      <Suspense fallback={null}>
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

        <CodeReviewPanel
          isOpen={showCodeReview}
          onClose={() => setShowCodeReview(false)}
          files={codebase?.files || []}
        />

        <DependencyScanner
          isOpen={showDepScanner}
          onClose={() => setShowDepScanner(false)}
          files={codebase?.files || []}
        />
      </Suspense>

      <FloatingDock
        isConnected={!!codebase}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onOpenCodeReview={() => setShowCodeReview(true)}
        onOpenDepScanner={() => setShowDepScanner(true)}
        onOpenAnalytics={() => setShowAnalytics(true)}
        onOpenDiffView={() => setShowDiffView(true)}
        onOpenConversations={() => setShowConversations(true)}
      />

      <TerminalBanner
        isLoading={isLoading}
        repoName={codebase?.repoName}
        fileCount={codebase?.files.length}
        isConnected={!!codebase}
      />

      {/* Onboarding Overlay */}
      <OnboardingOverlay
        isActive={onboarding.isActive}
        step={onboarding.step}
        currentStep={onboarding.currentStep}
        totalSteps={onboarding.totalSteps}
        progress={onboarding.progress}
        onNext={onboarding.next}
        onPrev={onboarding.prev}
        onSkip={onboarding.skip}
      />
    </div>
  );
};

export default Index;
