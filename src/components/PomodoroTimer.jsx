import React from 'react';
import { 
  Play, Pause, RotateCcw, SkipForward, Coffee, CheckCircle2, 
  Flame, Sparkles, Plus, Minus, Zap, Bell, BellOff 
} from 'lucide-react';
import { playSuccessChord } from '../lib/audio';
import { completionMessages } from '../data/quotes';
import { MODES } from '../hooks/usePomodoro';

export default function PomodoroTimer({ pomodoro, activeTask, onCompleteActiveTask }) {
  const {
    currentMode, timeLeft, isRunning, completedSessions, randomTip, encouragement,
    setEncouragement, notifPermission, enableNotifications, setMode, toggleTimer, resetTimer, skipTimer, adjustTime, triggerConfetti
  } = pomodoro;

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
  const progressPercent = Math.min(100, Math.max(0, ((currentMode.duration - timeLeft) / currentMode.duration) * 100));
  const cycleStep = completedSessions % 4;

  return (
    <div className="relative overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all">
      {/* Subtle ambient glow when timer is running */}
      {isRunning && (
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none opacity-25 transition-all duration-1000 ${
            currentMode.isBreak ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}
        />
      )}

      {/* Top Header Bar: Studio Label & Cycle Tracker */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            currentMode.isBreak
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
          }`}>
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                Smart Pomodoro Studio
              </h3>
              {isRunning && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Đang chạy
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Chu kỳ chuẩn: 4 phiên Focus 25p ➔ 1 phiên Nghỉ dài 15p
            </p>
          </div>
        </div>

        {/* 4-Pomodoro Cycle Progress Dots & Total Counter */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
          <div className="flex items-center gap-1.5" title="Chu kỳ 4 phiên Pomodoro trước khi nghỉ dài 15p">
            {[0, 1, 2, 3].map((dotIdx) => {
              const filled = dotIdx < cycleStep;
              return (
                <span
                  key={dotIdx}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    filled
                      ? 'bg-gradient-to-tr from-rose-500 to-indigo-500 scale-110 shadow-sm shadow-indigo-500/40'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              );
            })}
          </div>
          <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1 text-xs font-extrabold text-slate-700 dark:text-slate-200">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>{completedSessions} phiên</span>
          </div>
        </div>
      </div>

      {/* Browser notification permission */}
      {notifPermission === 'default' && (
        <button
          onClick={enableNotifications}
          className="relative z-10 w-full mb-5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors"
        >
          <Bell className="w-4 h-4" />
          Bấm để bật thông báo Chrome khi hết giờ
        </button>
      )}
      {notifPermission === 'denied' && (
        <div className="relative z-10 mb-5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <BellOff className="w-4 h-4 flex-shrink-0" />
          Thông báo đang bị chặn. Bấm biểu tượng ổ khóa cạnh thanh địa chỉ → Thông báo → Cho phép.
        </div>
      )}

      {/* Mode Selectors */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6">
        <button
          onClick={() => setMode(MODES.FOCUS)}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            currentMode.id === MODES.FOCUS.id
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400/30'
              : 'bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>🎯 Focus 25p</span>
        </button>

        <button
          onClick={() => setMode(MODES.SHORT_BREAK)}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            currentMode.id === MODES.SHORT_BREAK.id
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/30'
              : 'bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>☕ Nghỉ ngắn 5p</span>
        </button>

        <button
          onClick={() => setMode(MODES.LONG_BREAK)}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            currentMode.id === MODES.LONG_BREAK.id
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-400/30'
              : 'bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>🌿 Nghỉ dài 15p</span>
        </button>

        <div className="hidden sm:inline-block h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Mock Exam shortcuts */}
        <button
          onClick={() => setMode(MODES.MOCK_105)}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
            currentMode.id === MODES.MOCK_105.id
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400/30'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-100'
          }`}
          title="Thi thử Kiến thức ngôn ngữ + Đọc hiểu (105 phút)"
        >
          📝 Đề 105p
        </button>

        <button
          onClick={() => setMode(MODES.MOCK_50)}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
            currentMode.id === MODES.MOCK_50.id
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 ring-2 ring-purple-400/30'
              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-900/50 hover:bg-purple-100'
          }`}
          title="Thi thử Nghe hiểu (50 phút)"
        >
          🎧 Nghe 50p
        </button>
      </div>

      {/* Linked Task display banner */}
      {activeTask && (
        <div className="relative z-10 mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-indigo-50/90 dark:from-indigo-950/50 dark:via-slate-800/80 dark:to-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white flex-shrink-0 shadow-sm">
              {activeTask.pomoSession || 'Đang học'}
            </span>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">
                {activeTask.content}
              </div>
              {activeTask.time && (
                <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  Khung giờ: {activeTask.time} • Thời lượng: {activeTask.durationMinutes || 25} phút
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleManualCompleteTask}
            className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Hoàn thành phiên này</span>
          </button>
        </div>
      )}

      {/* Timer Circular Display & Controls */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 my-2">
        {/* Circular Ring */}
        <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <linearGradient id="breakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>

            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="43"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="6.5"
              fill="transparent"
            />

            {/* Animated Progress Ring */}
            <circle
              cx="50"
              cy="50"
              r="43"
              stroke={currentMode.isBreak ? 'url(#breakGrad)' : 'url(#focusGrad)'}
              strokeWidth="6.5"
              strokeDasharray="270.17"
              strokeDashoffset={270.17 - (270.17 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Inner Countdown Readout */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 mt-1.5 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60">
              {currentMode.shortLabel}
            </span>

            {/* Quick +/- 1 min adjusters */}
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => adjustTime(-60)}
                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
                title="Giảm 1 phút"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-bold text-slate-400">±1p</span>
              <button
                type="button"
                onClick={() => adjustTime(60)}
                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
                title="Thêm 1 phút"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Controls & Session Status */}
        <div className="flex flex-col items-center md:items-start space-y-4 max-w-sm">
          <div className="text-center md:text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Trạng thái phiên hiện tại
            </span>
            <h4 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {currentMode.label}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {currentMode.isBreak
                ? 'Hãy rời mắt khỏi màn hình, vươn vai và hít thở sâu để tái tạo năng lượng cho não bộ.'
                : 'Tắt thông báo điện thoại, tập trung 100% năng lượng giải quyết gọn mục tiêu phiên này.'}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/60 dark:border-slate-700"
              title="Đặt lại đồng hồ"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className={`px-8 py-3.5 rounded-2xl text-white font-black text-sm sm:text-base flex items-center gap-2.5 shadow-lg transition-all transform active:scale-95 ${
                isRunning
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/30'
                  : currentMode.isBreak
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30 ring-2 ring-indigo-400/30'
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
                  <span>BẮT ĐẦU NGAY</span>
                </>
              )}
            </button>

            <button
              onClick={skipTimer}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/60 dark:border-slate-700"
              title="Chuyển sang phiên tiếp theo"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Break suggestion card or encouragement */}
      {currentMode.isBreak ? (
        <div className="relative z-10 mt-5 p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Coffee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xs sm:text-sm">
            <div className="font-extrabold text-emerald-900 dark:text-emerald-200 mb-0.5">
              Gợi ý thư giãn không dùng điện thoại (Dopamine Reset):
            </div>
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">{randomTip}</p>
          </div>
        </div>
      ) : encouragement ? (
        <div className="relative z-10 mt-5 p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center gap-2 text-center text-xs sm:text-sm font-extrabold text-indigo-700 dark:text-indigo-300 animate-slide-up">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>{encouragement}</span>
        </div>
      ) : null}
    </div>
  );
}
