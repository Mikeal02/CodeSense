import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ModesSection from "@/components/ModesSection";
import ChatInterface from "@/components/ChatInterface";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import GitHubRepoSelector from "@/components/GitHubRepoSelector";
import RecentReposPanel from "@/components/RecentReposPanel";
import CommandPalette from "@/components/CommandPalette";
import { useCodebaseAnalysis } from "@/hooks/useCodebaseAnalysis";
import { useRecentRepos, RecentRepo } from "@/hooks/useRecentRepos";
import { useTheme } from "@/hooks/useTheme";

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
  
  const { isDarkMode, toggleTheme } = useTheme();
  const { recentRepos, addRecentRepo, removeRecentRepo, clearRecentRepos } = useRecentRepos();
  
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
    }
  }, [codebase?.repoName]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K: Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectRepo = async (repoUrl: string) => {
    setShowGitHubSelector(false);
    await connectRepo(repoUrl);
  };

  const handleSelectRecentRepo = async (repo: RecentRepo) => {
    if (repo.source === "github" && repo.url) {
      await connectRepo(repo.url);
    } else if (repo.source === "demo") {
      loadDemo();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onConnectRepo={uploadFolder} 
        githubToken={githubToken}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
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
      
      {/* Recent repos panel - show when not connected */}
      {!codebase && recentRepos.length > 0 && (
        <div className="container mx-auto px-6 -mt-8 mb-8 relative z-10">
          <RecentReposPanel
            repos={recentRepos}
            onSelectRepo={handleSelectRecentRepo}
            onRemoveRepo={removeRecentRepo}
            onClearAll={clearRecentRepos}
            className="max-w-xl mx-auto"
          />
        </div>
      )}
      
      <ModesSection 
        activeMode={activeMode} 
        onSelectMode={selectMode}
        isConnected={!!codebase}
      />
      <ChatInterface 
        isActive={!!codebase}
        messages={messages}
        onSendMessage={askQuestion}
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

      {/* Command Palette */}
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
        onToggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default Index;
