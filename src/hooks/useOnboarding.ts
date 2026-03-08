import { useState, useEffect, useCallback } from "react";

export interface OnboardingStep {
  id: string;
  target: string; // CSS selector
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right";
  action?: string; // optional action label
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    target: "[data-onboarding='logo']",
    title: "Welcome to CodeSense! 👋",
    description: "Let's take a quick tour of the most powerful codebase analysis tool. This will take about 30 seconds.",
    placement: "bottom",
  },
  {
    id: "connect-repo",
    target: "[data-onboarding='hero-input']",
    title: "Connect Your Repository",
    description: "Paste any GitHub URL here to instantly load and analyze your codebase. You can also upload a local folder or try the demo project.",
    placement: "bottom",
  },
  {
    id: "github-browse",
    target: "[data-onboarding='github-browse']",
    title: "Browse GitHub Repos",
    description: "Already have a GitHub token? Browse your repositories directly and select one to analyze.",
    placement: "bottom",
  },
  {
    id: "modes",
    target: "[data-onboarding='modes-section']",
    title: "Choose Analysis Modes",
    description: "11 specialized modes — from Project Overview to Interview Prep. Each mode gives you a different lens into your codebase.",
    placement: "top",
  },
  {
    id: "chat",
    target: "[data-onboarding='chat-interface']",
    title: "AI Chat Interface",
    description: "Ask anything about your code. The AI understands your entire codebase and responds with context-aware answers, code examples, and explanations.",
    placement: "top",
  },
  {
    id: "toolbar",
    target: "[data-onboarding='header-tools']",
    title: "Power Tools",
    description: "Access Analytics, File Comparison, Conversations, Activity Log, and Performance Monitor from the toolbar. Use Ctrl+K to open the Command Palette anytime.",
    placement: "bottom",
  },
  {
    id: "theme",
    target: "[data-onboarding='theme-toggle']",
    title: "Dark & Light Themes",
    description: "Switch between dark and light mode with a smooth animated transition. Your preference is saved automatically.",
    placement: "bottom",
  },
  {
    id: "status-bar",
    target: "[data-onboarding='status-bar']",
    title: "Status Bar",
    description: "Monitor connection status, file count, active mode, memory usage, and performance — all in real-time at the bottom.",
    placement: "top",
  },
];

const STORAGE_KEY = "codesense_onboarding_complete";

export function useOnboarding() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  // Auto-start on first visit after a brief delay
  useEffect(() => {
    if (!hasCompleted) {
      const timer = setTimeout(() => setIsActive(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCompleted]);

  const steps = ONBOARDING_STEPS;
  const step = steps[currentStep] || null;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const next = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      complete();
    }
  }, [currentStep, totalSteps]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    complete();
  }, []);

  const complete = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setHasCompleted(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const restart = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    setHasCompleted(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    isActive,
    currentStep,
    step,
    totalSteps,
    progress,
    next,
    prev,
    skip,
    complete,
    restart,
    hasCompleted,
  };
}
