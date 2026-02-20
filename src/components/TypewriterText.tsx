import { useState, useEffect } from "react";

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  className?: string;
}

const TypewriterText = ({
  phrases,
  typingSpeed = 60,
  deletingSpeed = 30,
  pauseTime = 2000,
  className = "",
}: TypewriterTextProps) => {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];

    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(timer);
    }

    if (!isDeleting) {
      if (charIdx < current.length) {
        const timer = setTimeout(() => {
          setDisplayed(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        setIsPaused(true);
      }
    } else {
      if (charIdx > 0) {
        const timer = setTimeout(() => {
          setDisplayed(current.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        }, deletingSpeed);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setPhraseIdx((i) => (i + 1) % phrases.length);
      }
    }
  }, [charIdx, isDeleting, isPaused, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={className}>
      {displayed}
      <span className="inline-block w-0.5 h-[1em] bg-primary ml-0.5 animate-pulse align-middle" />
    </span>
  );
};

export default TypewriterText;
