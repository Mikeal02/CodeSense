import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ModesSection from "@/components/ModesSection";
import ChatInterface from "@/components/ChatInterface";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import GitHubRepoSelector from "@/components/GitHubRepoSelector";
import { useCodebaseAnalysis } from "@/hooks/useCodebaseAnalysis";

const Index = () => {
  const [showGitHubSelector, setShowGitHubSelector] = useState(false);
  
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
  } = useCodebaseAnalysis();

  const handleSelectRepo = async (repoUrl: string) => {
    setShowGitHubSelector(false);
    await connectRepo(repoUrl);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onConnectRepo={uploadFolder} />
      <HeroSection 
        onSubmitRepo={connectRepo}
        onUploadFolder={uploadFolder}
        onLoadDemo={loadDemo}
        onOpenGitHubSelector={() => setShowGitHubSelector(true)}
        isLoading={isLoading}
        isConnected={!!codebase}
        repoName={codebase?.repoName}
      />
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
      />
      <FeaturesSection />
      <Footer />
      
      {showGitHubSelector && (
        <GitHubRepoSelector
          onSelectRepo={handleSelectRepo}
          onClose={() => setShowGitHubSelector(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Index;
