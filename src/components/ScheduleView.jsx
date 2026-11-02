import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Clock, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { DEFAULT_TEMPLATES } from '../lib/storage';
import { playSoftClick, playSuccessChord } from '../lib/audio';

export default function ScheduleView() {
  const [activeTab, setActiveTab] = useState('weekday'); // 'weekday', 'saturday', 'sunday'
  const [templates, setTemplates] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates');
      if (res.data && res.data.length > 0) {
        setTemplates(res.data);
      } else {
        setTemplates(DEFAULT_TEMPLATES);
      }
    } catch {
      setTemplates(DEFAULT_TEMPLATES);
    }
  };

  const handleSyncServerTemplates = async () => {
    playSoftClick();
    try {
      setSyncing(true);
      const res = await api.post('/templates/seed');
      if (res.data && res.data.templates) {
        setTemplates(res.data.templates);
      } else {
        setTemplates(DEFAULT_TEMPLATES);
      }
      playSuccessChord();
      setToastMsg('Đã đồng bộ mẫu chuẩn 20h30 lên Server thành công!');
      setTimeout(() => setToastMsg(null), 3500);
    } catch {
      setTemplates(DEFAULT_TEMPLATES);
      setToastMsg('Đã áp dụng mẫu chuẩn 20h30 cục bộ!');
      setTimeout(() => setToastMsg(null), 3500);
    } finally {
      setSyncing(false);
    }
  };

  const weekdayTemplate = templates.find(t => t.dayOfWeek === 1) || DEFAULT_TEMPLATES[0];
  const saturdayTemplate = templates.find(t => t.dayOfWeek === 6) || DEFAULT_TEMPLATES[1];
  const sundayTemplate = templates.find(t => t.dayOfWeek === 0) || DEFAULT_TEMPLATES[2];

  const currentDisplay = 
    activeTab === 'saturday' 
      ? saturdayTemplate 
      : activeTab === 'sunday' 
      ? sundayTemplate 
      : weekdayTemplate;

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors animate-slide-up overflow-hidden">
      {toastMsg && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-2.5 px-4 text-center text-xs sm:text-sm flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Banner */}
      <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                Sprint 02/11 – 06/12/2026
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                Target 120/180
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Lộ Trình Pomodoro Chi Tiết Từng Ngày
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Phân bổ khoa học 25 phút học tập trung – 5 phút thư giãn, nghỉ dài 15 phút sau mỗi 4 phiên (Tối bắt đầu 20:30).
            </p>
          </div>

          <button
            onClick={handleSyncServerTemplates}
            disabled={syncing}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 shadow-sm transition-all"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ mẫu 20h30'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('weekday')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'weekday'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200/70 dark:border-slate-700'
            }`}
          >
            ⚡ Thứ 2 đến Thứ 6 (8 Pomodoro = 4h)
          </button>

          <button
            onClick={() => setActiveTab('saturday')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'saturday'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-400/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200/70 dark:border-slate-700'
            }`}
          >
            🎯 Thứ 7 (Thi thử Đề 1 + Chữa đề)
          </button>

          <button
            onClick={() => setActiveTab('sunday')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'sunday'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200/70 dark:border-slate-700'
            }`}
          >
            🏆 Chủ Nhật (Thi thử Đề 2 + Lấp lỗ hổng)
          </button>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="p-6 sm:p-8">
        {/* Day overview summary */}
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/35 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            {activeTab === 'weekday' && (
              <span>🌅 Sáng: 07:00 – 08:00 (2 Pomo) • 🧘 Reset: 20:00 – 20:30 • 🌙 Tối: 20:30 – 23:35 (6 Pomo)</span>
            )}
            {activeTab === 'saturday' && (
              <span>📝 Thi thử lúc 13:00 (105p + 50p) • 🔍 Chữa chi tiết 11 Pomodoro (Tối 20:30 – 23:35)</span>
            )}
            {activeTab === 'sunday' && (
              <span>🌅 Sáng ôn tập & thi thử Đề 2 • 🔍 Chiều chữa đề + Tối 20:30 – 23:20 Lấp lỗ hổng (14 Pomo)</span>
            )}
          </div>
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/60 self-start sm:self-auto">
            {currentDisplay?.items?.length || 0} mốc thời gian
          </span>
        </div>

        {/* Timeline list */}
        <div className="relative pl-4 sm:pl-6 border-l-2 border-indigo-200 dark:border-slate-800 space-y-3.5">
          {currentDisplay?.items?.map((item, index) => {
            const isBreak = !!item.isBreak;

            return (
              <div
                key={index}
                className={`relative p-4 sm:p-4.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${
                  isBreak
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm'
                }`}
              >
                {/* Timeline Dot */}
                <span
                  className={`absolute -left-[23px] sm:-left-[31px] top-6 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                    isBreak ? 'bg-emerald-400' : 'bg-indigo-600 ring-4 ring-indigo-500/15'
                  }`}
                />

                {/* Time Badge */}
                <div className="flex sm:flex-col items-center sm:items-start justify-between sm:w-28 flex-shrink-0">
                  <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-sm sm:text-base flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {item.time}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                    {item.durationMinutes} phút
                  </span>
                </div>

                {/* Session tag & content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {item.pomoSession && (
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        isBreak 
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' 
                          : 'bg-indigo-600 text-white shadow-sm'
                      }`}>
                        {item.pomoSession}
                      </span>
                    )}

                    {isBreak && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Nghỉ ngơi & Tái tạo năng lượng ☕
                      </span>
                    )}
                  </div>

                  <p className={`text-sm sm:text-[15px] font-bold leading-relaxed ${
                    isBreak ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'
                  }`}>
                    {item.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
