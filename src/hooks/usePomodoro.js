import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { playBell, playBreakChime, playSoftClick } from '../lib/audio';
import { relaxationTips, completionMessages } from '../data/quotes';

export const MODES = {
  FOCUS: { id: 'FOCUS', label: 'Tập trung (Focus)', shortLabel: 'Focus 25p', duration: 25 * 60, isBreak: false, color: 'indigo' },
  SHORT_BREAK: { id: 'SHORT_BREAK', label: 'Nghỉ ngắn (5p)', shortLabel: 'Nghỉ 5p', duration: 5 * 60, isBreak: true, color: 'emerald' },
  LONG_BREAK: { id: 'LONG_BREAK', label: 'Nghỉ dài (15p)', shortLabel: 'Nghỉ dài 15p', duration: 15 * 60, isBreak: true, color: 'amber' },
  MOCK_105: { id: 'MOCK_105', label: 'Thi thử Ngôn ngữ + Đọc (105p)', shortLabel: 'Đề 105p', duration: 105 * 60, isBreak: false, color: 'rose' },
  MOCK_50: { id: 'MOCK_50', label: 'Thi thử Nghe hiểu (50p)', shortLabel: 'Nghe 50p', duration: 50 * 60, isBreak: false, color: 'purple' }
};

const ORIGINAL_TITLE = typeof document !== 'undefined' ? document.title : '';

const pad = (n) => String(n).padStart(2, '0');
export const formatTime = (secs) => `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`;

function notify(title, body) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const n = new Notification(title, { body, icon: '/favicon.svg', tag: 'pomodoro-timer', requireInteraction: false });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // Some browsers only allow notifications via service worker — ignore
  }
}

/**
 * Pomodoro state lives at App level so it survives in-app tab switches, and is
 * driven by an absolute end timestamp (not by counting ticks) so it stays
 * accurate when the browser throttles background tabs.
 */
export function usePomodoro(activeTask) {
  const [currentMode, setCurrentMode] = useState(MODES.FOCUS);
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(() => Number(localStorage.getItem('n2_pomo_count') || 0));
  const [randomTip, setRandomTip] = useState(relaxationTips[0]);
  const [encouragement, setEncouragement] = useState('');

  const endAtRef = useRef(0);
  const tickRef = useRef(() => {});

  const setMode = useCallback((mode) => {
    setIsRunning(false);
    setCurrentMode(mode);
    setTimeLeft(mode.duration);
    if (mode.isBreak) {
      setRandomTip(relaxationTips[Math.floor(Math.random() * relaxationTips.length)]);
    }
    playSoftClick();
  }, []);

  // Sync when activeTask changes
  useEffect(() => {
    if (!activeTask) return;
    if (activeTask.durationMinutes === 105) setMode(MODES.MOCK_105);
    else if (activeTask.durationMinutes === 50) setMode(MODES.MOCK_50);
    else if (activeTask.isBreak) setMode(activeTask.durationMinutes >= 15 ? MODES.LONG_BREAK : MODES.SHORT_BREAK);
    else setMode(MODES.FOCUS);
  }, [activeTask, setMode]);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  }, []);

  const handleTimerComplete = useCallback((natural = false) => {
    setIsRunning(false);

    if (!currentMode.isBreak) {
      playBell();
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);
      localStorage.setItem('n2_pomo_count', String(newCount));
      triggerConfetti();
      setEncouragement(completionMessages[Math.floor(Math.random() * completionMessages.length)]);
      if (natural) notify('⏰ Hết giờ tập trung!', `Bạn vừa hoàn thành ${currentMode.shortLabel}. Nghỉ ngơi một chút nhé!`);
      setMode(newCount % 4 === 0 ? MODES.LONG_BREAK : MODES.SHORT_BREAK);
    } else {
      playBreakChime();
      setEncouragement('Hết giờ nghỉ! Hãy sẵn sàng cho phiên Pomodoro tiếp theo 🚀');
      if (natural) notify('☕ Hết giờ nghỉ!', 'Sẵn sàng cho phiên Pomodoro tiếp theo 🚀');
      setMode(MODES.FOCUS);
    }
  }, [currentMode, completedSessions, setMode, triggerConfetti]);

  // Always points to the latest closure so the timer source never goes stale
  useEffect(() => {
    tickRef.current = () => {
      const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        setTimeLeft(0);
        handleTimerComplete(true);
      } else {
        setTimeLeft(remaining);
      }
    };
  }, [handleTimerComplete]);

  // Tick source: Web Worker (not throttled in background tabs), fallback to setInterval
  useEffect(() => {
    if (!isRunning) return undefined;

    const tick = () => tickRef.current();
    let worker = null;
    let url = null;
    let interval = null;

    try {
      url = URL.createObjectURL(new Blob(['setInterval(() => postMessage(0), 500)'], { type: 'text/javascript' }));
      worker = new Worker(url);
      worker.onmessage = tick;
    } catch {
      interval = setInterval(tick, 500);
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (worker) worker.terminate();
      if (url) URL.revokeObjectURL(url);
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Browser tab title: show only the countdown while running
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} ${currentMode.isBreak ? '☕' : '🎯'} ${currentMode.shortLabel}`;
    } else {
      document.title = ORIGINAL_TITLE;
    }
  }, [isRunning, timeLeft, currentMode]);

  useEffect(() => () => { document.title = ORIGINAL_TITLE; }, []);

  const toggleTimer = () => {
    playSoftClick();
    if (!isRunning) {
      endAtRef.current = Date.now() + timeLeft * 1000;
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      } catch {
        // ignore
      }
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    playSoftClick();
    setIsRunning(false);
    setTimeLeft(currentMode.duration);
  };

  const skipTimer = () => {
    playSoftClick();
    handleTimerComplete(false);
  };

  const adjustTime = (deltaSeconds) => {
    playSoftClick();
    const next = Math.max(60, Math.min(180 * 60, timeLeft + deltaSeconds));
    if (isRunning) endAtRef.current = Date.now() + next * 1000;
    setTimeLeft(next);
  };

  return {
    currentMode, timeLeft, isRunning, completedSessions, randomTip, encouragement,
    setEncouragement, setMode, toggleTimer, resetTimer, skipTimer, adjustTime, triggerConfetti
  };
}
