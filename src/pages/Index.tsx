import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ModesSection from "@/components/ModesSection";
import ChatInterface from "@/components/ChatInterface";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { useCodebaseAnalysis } from "@/hooks/useCodebaseAnalysis";

const Index = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header onConnectRepo={uploadFolder} />
      <HeroSection 
        onSubmitRepo={connectRepo}
        onUploadFolder={uploadFolder}
        onLoadDemo={loadDemo}
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
      />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
