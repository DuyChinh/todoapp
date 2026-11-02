import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, Download, Target } from 'lucide-react';
import { isSoundEnabled, toggleSound } from '../lib/audio';
import { quotes } from '../data/quotes';

// JLPT N2 Exam time: 08:00 AM on 06/12/2026
const EXAM_DATE = new Date(2026, 11, 6, 8, 0, 0); // Month is 0-indexed: 11 = December
// Sprint start time: 02/11/2026 00:00:00
const SPRINT_START = new Date(2026, 10, 2, 0, 0, 0); // 10 = November

export default function CountdownBanner({ onOpenBackup }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    function calculateTime() {
      const now = new Date();
      const diff = EXAM_DATE.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotate quote every 15s
  useEffect(() => {
    const qInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 15000);
    return () => clearInterval(qInterval);
  }, []);

  const handleToggleSound = () => {
    const updated = toggleSound();
    setSoundOn(updated);
  };

  // Sprint Progress calculation
  const totalSprintMs = EXAM_DATE.getTime() - SPRINT_START.getTime();
  const elapsedMs = Math.max(0, new Date().getTime() - SPRINT_START.getTime());
  const sprintProgressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalSprintMs) * 100)));
  const currentSprintDay = Math.min(35, Math.max(1, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)) + 1));

  const currentQuote = quotes[quoteIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-2xl border border-indigo-500/20 p-5 sm:p-7 mb-6">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Title & Control buttons */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-rose-500/20 flex-shrink-0">
            <span className="text-xl font-black text-white">N2</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                JLPT N2 SPRINT TRACKER
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                06/12/2026
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 font-medium">
              Lộ trình Pomodoro 34 ngày bứt phá mục tiêu 120/180
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              soundOn
                ? 'bg-indigo-600/30 border-indigo-400/40 text-indigo-200 hover:bg-indigo-600/50'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={soundOn ? 'Âm thanh: BẬT (Ấn để tắt)' : 'Âm thanh: TẮT (Ấn để bật)'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{soundOn ? 'Âm thanh' : 'Tắt âm'}</span>
          </button>

          {/* Backup / Restore */}
          <button
            onClick={onOpenBackup}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
            title="Sao lưu / Khôi phục dữ liệu JSON"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Sao lưu</span>
          </button>
        </div>
      </div>

      {/* Main Countdown grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-5">
        {[
          { label: 'NGÀY', value: timeLeft.days },
          { label: 'GIỜ', value: String(timeLeft.hours).padStart(2, '0') },
          { label: 'PHÚT', value: String(timeLeft.minutes).padStart(2, '0') },
          { label: 'GIÂY', value: String(timeLeft.seconds).padStart(2, '0') }
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-indigo-500/20 text-center relative overflow-hidden group hover:border-indigo-400/40 transition-colors"
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-100 tabular-nums">
              {item.value}
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-indigo-300/70 tracking-widest uppercase mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Sprint Progress bar & Motivational quote */}
      <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Progress bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-indigo-200 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              Tiến độ Sprint: Ngày {currentSprintDay}/35
            </span>
            <span className="text-rose-300">{sprintProgressPercent}% chặng đường</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 relative">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-lg shadow-rose-500/30"
              style={{ width: `${Math.max(4, sprintProgressPercent)}%` }}
            />
          </div>
        </div>

        {/* Motivational Quote banner */}
        <div className="sm:max-w-md bg-indigo-900/40 border border-indigo-400/20 rounded-xl px-3.5 py-2 flex items-center gap-2.5 text-xs text-indigo-100">
          <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 animate-pulse" />
          <div className="min-w-0 truncate">
            <span className="font-bold text-amber-200 mr-1.5">{currentQuote.jp}</span>
            <span className="opacity-80 truncate">{currentQuote.vi}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
