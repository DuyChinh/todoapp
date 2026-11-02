import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, SkipForward, Coffee, CheckCircle2, Flame } from 'lucide-react';
import { playBell, playBreakChime, playSuccessChord, playSoftClick } from '../lib/audio';
import { relaxationTips, completionMessages } from '../data/quotes';

const MODES = {
  FOCUS: { id: 'FOCUS', label: 'Tập trung (Focus)', duration: 25 * 60, isBreak: false },
  SHORT_BREAK: { id: 'SHORT_BREAK', label: 'Nghỉ ngắn (5p)', duration: 5 * 60, isBreak: true },
  LONG_BREAK: { id: 'LONG_BREAK', label: 'Nghỉ dài (15p)', duration: 15 * 60, isBreak: true },
  MOCK_105: { id: 'MOCK_105', label: 'Thi thử Ngôn ngữ + Đọc (105p)', duration: 105 * 60, isBreak: false },
  MOCK_50: { id: 'MOCK_50', label: 'Thi thử Nghe hiểu (50p)', duration: 50 * 60, isBreak: false }
};

export default function PomodoroTimer({ activeTask, onCompleteActiveTask }) {
  const [currentMode, setCurrentMode] = useState(MODES.FOCUS);
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(() => {
    return Number(localStorage.getItem('n2_pomo_count') || 0);
  });
  const [randomTip, setRandomTip] = useState(relaxationTips[0]);
  const [encouragement, setEncouragement] = useState('');

  const timerRef = useRef(null);

  const setMode = (mode) => {
    setIsRunning(false);
    setCurrentMode(mode);
    setTimeLeft(mode.duration);
    if (mode.isBreak) {
      const tip = relaxationTips[Math.floor(Math.random() * relaxationTips.length)];
      setRandomTip(tip);
    }
    playSoftClick();
  };

  // Sync when activeTask changes
  useEffect(() => {
    if (activeTask) {
      if (activeTask.durationMinutes === 105) {
        setMode(MODES.MOCK_105);
      } else if (activeTask.durationMinutes === 50) {
        setMode(MODES.MOCK_50);
      } else if (activeTask.isBreak) {
        if (activeTask.durationMinutes >= 15) {
          setMode(MODES.LONG_BREAK);
        } else {
          setMode(MODES.SHORT_BREAK);
        }
      } else {
        setMode(MODES.FOCUS);
      }
    }
  }, [activeTask]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (!currentMode.isBreak) {
      // Focus completed
      playBell();
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);
      localStorage.setItem('n2_pomo_count', String(newCount));

      // Trigger celebration
      triggerConfetti();
      const msg = completionMessages[Math.floor(Math.random() * completionMessages.length)];
      setEncouragement(msg);

      // Auto switch to break
      if (newCount % 4 === 0) {
        setMode(MODES.LONG_BREAK);
      } else {
        setMode(MODES.SHORT_BREAK);
      }
    } else {
      // Break completed
      playBreakChime();
      setEncouragement('Hết giờ nghỉ! Hãy sẵn sàng cho phiên Pomodoro tiếp theo 🚀');
      setMode(MODES.FOCUS);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, currentMode, completedSessions]);

  const toggleTimer = () => {
    playSoftClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    playSoftClick();
    setIsRunning(false);
    setTimeLeft(currentMode.duration);
  };

  const skipTimer = () => {
    playSoftClick();
    handleTimerComplete();
  };

  const handleManualCompleteTask = () => {
    triggerConfetti();
    playSuccessChord();
    const msg = completionMessages[Math.floor(Math.random() * completionMessages.length)];
    setEncouragement(msg);
    if (onCompleteActiveTask && activeTask) {
      onCompleteActiveTask(activeTask);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((currentMode.duration - timeLeft) / currentMode.duration) * 100;

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Mode Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6">
        <button
          onClick={() => setMode(MODES.FOCUS)}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentMode.id === MODES.FOCUS.id
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          🎯 Focus 25p
        </button>

        <button
          onClick={() => setMode(MODES.SHORT_BREAK)}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentMode.id === MODES.SHORT_BREAK.id
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          ☕ Nghỉ ngắn 5p
        </button>

        <button
          onClick={() => setMode(MODES.LONG_BREAK)}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentMode.id === MODES.LONG_BREAK.id
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          🌿 Nghỉ dài 15p
        </button>

        <div className="hidden sm:inline-block h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Mock Exam shortcuts */}
        <button
          onClick={() => setMode(MODES.MOCK_105)}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentMode.id === MODES.MOCK_105.id
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400/40'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100'
          }`}
          title="Thi thử Kiến thức ngôn ngữ + Đọc hiểu"
        >
          📝 Đề 105p
        </button>

        <button
          onClick={() => setMode(MODES.MOCK_50)}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentMode.id === MODES.MOCK_50.id
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 ring-2 ring-purple-400/40'
              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 hover:bg-purple-100'
          }`}
          title="Thi thử Nghe hiểu"
        >
          🎧 Nghe 50p
        </button>
      </div>

      {/* Linked Task display banner */}
      {activeTask && (
        <div className="mb-6 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase bg-indigo-600 text-white flex-shrink-0">
              {activeTask.pomoSession || 'Nhiệm vụ'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {activeTask.content}
            </span>
          </div>

          <button
            onClick={handleManualCompleteTask}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tích hoàn thành task
          </button>
        </div>
      )}

      {/* Timer Circular Display & Number */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* SVG Circular Progress */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`stroke-current transition-all duration-1000 ease-linear ${
                currentMode.isBreak ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'
              }`}
              strokeWidth="6"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Inner Content */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800 dark:text-slate-100 tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              {currentMode.label}
            </span>
            <div className="mt-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{completedSessions} phiên xong</span>
            </div>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-3 sm:gap-4 mt-6">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title="Đặt lại phiên này"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl text-white font-extrabold text-base flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 ring-2 ring-indigo-400/40'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>TẠM DỪNG</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>BẮT ĐẦU</span>
              </>
            )}
          </button>

          <button
            onClick={skipTimer}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title="Bỏ qua / Chuyển phiên tiếp theo"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Break suggestion card or encouragement */}
      {currentMode.isBreak ? (
        <div className="mt-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
          <Coffee className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
              Gợi ý nghỉ ngơi khoa học:
            </div>
            <p className="text-emerald-700 dark:text-emerald-400">{randomTip}</p>
          </div>
        </div>
      ) : encouragement ? (
        <div className="mt-5 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-center text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 animate-slide-up">
          {encouragement}
        </div>
      ) : null}
    </div>
  );
}
