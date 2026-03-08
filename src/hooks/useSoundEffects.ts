import { useCallback, useRef } from "react";
import { useSettings } from "./useSettings";

type SoundType = "connect" | "mode-switch" | "analysis-done" | "click" | "success" | "error" | "notification";

const audioCtxRef = { current: null as AudioContext | null };

function getAudioContext(): AudioContext {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }
  return audioCtxRef.current;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.08) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

const soundMap: Record<SoundType, () => void> = {
  connect: () => {
    playTone(523.25, 0.12, "sine", 0.06);
    setTimeout(() => playTone(659.25, 0.12, "sine", 0.06), 80);
    setTimeout(() => playTone(783.99, 0.2, "sine", 0.05), 160);
  },
  "mode-switch": () => {
    playTone(440, 0.08, "triangle", 0.05);
    setTimeout(() => playTone(554.37, 0.1, "triangle", 0.04), 60);
  },
  "analysis-done": () => {
    playTone(587.33, 0.1, "sine", 0.05);
    setTimeout(() => playTone(783.99, 0.15, "sine", 0.05), 100);
    setTimeout(() => playTone(1046.5, 0.25, "sine", 0.04), 200);
  },
  click: () => {
    playTone(800, 0.04, "square", 0.02);
  },
  success: () => {
    playTone(523.25, 0.1, "sine", 0.05);
    setTimeout(() => playTone(783.99, 0.15, "sine", 0.04), 120);
  },
  error: () => {
    playTone(200, 0.15, "sawtooth", 0.04);
    setTimeout(() => playTone(150, 0.2, "sawtooth", 0.03), 120);
  },
  notification: () => {
    playTone(698.46, 0.08, "sine", 0.04);
    setTimeout(() => playTone(880, 0.12, "sine", 0.04), 100);
  },
};

export function useSoundEffects() {
  const { settings } = useSettings();
  const lastPlayedRef = useRef<number>(0);

  const play = useCallback((sound: SoundType) => {
    if (!settings.soundEffects) return;
    // Throttle: min 50ms between sounds
    const now = Date.now();
    if (now - lastPlayedRef.current < 50) return;
    lastPlayedRef.current = now;
    soundMap[sound]?.();
  }, [settings.soundEffects]);

  return { play };
}
