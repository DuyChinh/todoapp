import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Download, Target, Flame, RefreshCw, Award } from 'lucide-react';
import { isSoundEnabled, toggleSound, playSoftClick } from '../lib/audio';
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

  const handleNextQuote = () => {
    playSoftClick();
    setQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  // Sprint Progress calculation
  const totalSprintMs = EXAM_DATE.getTime() - SPRINT_START.getTime();
  const elapsedMs = Math.max(0, new Date().getTime() - SPRINT_START.getTime());
  const sprintProgressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalSprintMs) * 100)));
  const currentSprintDay = Math.min(35, Math.max(1, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)) + 1));

  const currentQuote = quotes[quoteIndex];

  const countdownUnits = [
    { label: 'NGÀY CÒN LẠI', sub: 'Days', value: String(timeLeft.days).padStart(2, '0'), accent: 'from-rose-500 to-orange-500', textGrad: 'from-white via-rose-100 to-rose-200' },
    { label: 'GIỜ', sub: 'Hours', value: String(timeLeft.hours).padStart(2, '0'), accent: 'from-indigo-500 to-purple-500', textGrad: 'from-white via-indigo-100 to-indigo-200' },
    { label: 'PHÚT', sub: 'Minutes', value: String(timeLeft.minutes).padStart(2, '0'), accent: 'from-purple-500 to-pink-500', textGrad: 'from-white via-purple-100 to-purple-200' },
    { label: 'GIÂY', sub: 'Seconds', value: String(timeLeft.seconds).padStart(2, '0'), accent: 'from-emerald-400 to-teal-500', textGrad: 'from-emerald-200 via-teal-100 to-white' }
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white shadow-2xl shadow-indigo-950/25 border border-indigo-500/25 p-5 sm:p-7">
      {/* Decorative aurora glow orbs */}
      <div className="absolute -top-28 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -left-20 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Title, Target Badges & Control buttons */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-tr from-rose-500 to-indigo-500 rounded-2xl blur-sm opacity-70" />
            <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 flex flex-col items-center justify-center shadow-lg border border-white/25 p-2">
              <span className="text-[9px] font-black text-rose-100 tracking-widest uppercase font-jp leading-none">必勝</span>
              <span className="text-xl sm:text-2xl font-black text-white leading-tight">N2</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 font-jp">
                日本語能力試験 • 06/12/2026
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-rose-500/30 to-amber-500/30 text-amber-200 border border-amber-400/40 shadow-sm">
                <Award className="w-3 h-3 text-amber-300" />
                MỤC TIÊU: 120 / 180 ĐIỂM
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">
              Chiến Dịch Nước Rút Chinh Phục JLPT N2
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-indigo-200/80 font-semibold">
              <span>🎯 Từ vựng & Ngữ pháp: <strong className="text-white">40+/60</strong></span>
              <span className="text-indigo-500">•</span>
              <span>📖 Đọc hiểu: <strong className="text-white">40+/60</strong></span>
              <span className="text-indigo-500">•</span>
              <span>🎧 Nghe hiểu: <strong className="text-white">40+/60</strong></span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
              soundOn
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/25 shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={soundOn ? 'Âm thanh: BẬT (Ấn để tắt)' : 'Âm thanh: TẮT (Ấn để bật)'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundOn ? 'Âm báo: Bật' : 'Âm báo: Tắt'}</span>
          </button>

          {/* Backup / Restore */}
          <button
            onClick={onOpenBackup}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-2 transition-all backdrop-blur-md shadow-sm"
            title="Sao lưu / Khôi phục dữ liệu JSON"
          >
            <Download className="w-4 h-4 text-indigo-300" />
            <span className="hidden sm:inline">Backup Dữ Liệu</span>
          </button>
        </div>
      </div>

      {/* Main Countdown 4-Card Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-5">
        {countdownUnits.map((item, idx) => (
          <div
            key={idx}
            className="relative rounded-2xl bg-slate-900/75 backdrop-blur-xl p-3.5 sm:p-4 border border-white/10 hover:border-indigo-400/40 transition-all duration-300 group overflow-hidden shadow-inner"
          >
            {/* Top gradient accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.accent} opacity-85 group-hover:opacity-100 transition-opacity`} />

            <div className="flex flex-col items-center justify-center text-center">
              <div className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b ${item.textGrad} font-mono tabular-nums drop-shadow-sm`}>
                {item.value}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-indigo-200/90 tracking-wider uppercase">
                  {item.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: Sprint Progress bar & Interactive Motivational Quote */}
      <div className="relative z-10 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Progress bar (7 cols on lg) */}
        <div className="lg:col-span-6 space-y-2 bg-slate-900/50 rounded-2xl p-3.5 border border-white/10">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-indigo-100 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-rose-400" />
              <span>Chặng đường Sprint 35 ngày: <strong className="text-white">Ngày {currentSprintDay}/35</strong></span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-[11px]">
              {sprintProgressPercent}% hoàn thành
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/70 p-0.5 relative">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{ width: `${Math.max(5, sprintProgressPercent)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Motivational Quote banner (6 cols on lg) */}
        <button
          type="button"
          onClick={handleNextQuote}
          className="lg:col-span-6 w-full text-left bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-slate-900/60 hover:from-indigo-900/70 hover:to-purple-900/60 border border-indigo-400/25 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-indigo-100 transition-all group"
          title="Nhấn để đổi câu châm ngôn tiếp lửa"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 text-amber-300 fill-amber-300 group-hover:scale-110 transition-transform" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-amber-200 text-xs sm:text-sm truncate font-jp">
                {currentQuote.jp}
              </div>
              <div className="text-indigo-100/85 text-[11px] sm:text-xs font-medium truncate mt-0.5">
                "{currentQuote.vi}"
              </div>
            </div>
          </div>
          <RefreshCw className="w-3.5 h-3.5 text-indigo-300/60 group-hover:text-white group-hover:rotate-180 transition-all duration-300 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}
