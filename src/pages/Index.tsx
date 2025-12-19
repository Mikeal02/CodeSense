import { useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ModesSection from "@/components/ModesSection";
import ChatInterface from "@/components/ChatInterface";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [activeMode, setActiveMode] = useState("overview");
  const [repoConnected, setRepoConnected] = useState(false);

  const handleSubmitRepo = (url: string) => {
    toast.success("Repository connected! Analyzing codebase...");
    setRepoConnected(true);
  };

  const handleConnectRepo = () => {
    toast.info("Connect your GitHub repository to get started");
  };

  const handleSelectMode = (mode: string) => {
    setActiveMode(mode);
    if (!repoConnected) {
      toast.info("Connect a repository first to use this mode");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onConnectRepo={handleConnectRepo} />
      <HeroSection onSubmitRepo={handleSubmitRepo} />
      <ModesSection activeMode={activeMode} onSelectMode={handleSelectMode} />
      <ChatInterface isActive={repoConnected} />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
