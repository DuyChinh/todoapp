import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Clock } from 'lucide-react';
import { DEFAULT_TEMPLATES } from '../lib/storage';

export default function ScheduleView() {
  const [activeTab, setActiveTab] = useState('weekday'); // 'weekday', 'saturday', 'sunday'
  const [templates, setTemplates] = useState([]);

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
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors animate-slide-up overflow-hidden">
      {/* Banner */}
      <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-600 text-white">
                Sprint 02/11 – 06/12/2026
              </span>
              <span className="text-xs font-bold text-slate-500">Mục tiêu đỗ N2</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Lộ Trình Pomodoro Chi Tiết Từng Ngày
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Phân bổ khoa học 25 phút học tập trung – 5 phút thư giãn, nghỉ dài 15 phút sau mỗi 4 phiên.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('weekday')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'weekday'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/40'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            ⚡ Thứ 2 đến Thứ 6 (8 Pomodoro = 4h)
          </button>

          <button
            onClick={() => setActiveTab('saturday')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'saturday'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-400/40'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            🎯 Thứ 7 (Thi thử Đề 1 + Chữa đề)
          </button>

          <button
            onClick={() => setActiveTab('sunday')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'sunday'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400/40'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            🏆 Chủ Nhật (Thi thử Đề 2 + Lấp lỗ hổng)
          </button>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="p-6 sm:p-8">
        {/* Day overview summary */}
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between text-xs sm:text-sm">
          <div className="font-bold text-indigo-900 dark:text-indigo-200">
            {activeTab === 'weekday' && (
              <span>🌅 Buổi sáng: 07:00 – 08:00 (2 Pomo) • 🌙 Buổi tối: 20:00 – 23:05 (6 Pomo)</span>
            )}
            {activeTab === 'saturday' && (
              <span>📝 Thi thử lúc 13:00 (105p + 50p) • 🔍 Chữa chi tiết 11 Pomodoro lúc 16:05 – 23:05</span>
            )}
            {activeTab === 'sunday' && (
              <span>🌅 Sáng ôn tập & thi thử Đề 2 • 🔍 Chiều và tối chữa chi tiết + Lấp lỗ hổng (14 Pomo)</span>
            )}
          </div>
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
            {currentDisplay?.items?.length || 0} mốc thời gian
          </span>
        </div>

        {/* Timeline list */}
        <div className="space-y-3">
          {currentDisplay?.items?.map((item, index) => {
            const isBreak = !!item.isBreak;

            return (
              <div
                key={index}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  isBreak
                    ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm'
                }`}
              >
                {/* Time Badge */}
                <div className="flex-shrink-0 w-24 sm:w-28 text-left">
                  <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-sm sm:text-base flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {item.time}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 block mt-0.5">
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
                          : 'bg-indigo-600 text-white'
                      }`}>
                        {item.pomoSession}
                      </span>
                    )}

                    {isBreak && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Nghỉ ngơi thư giãn ☕
                      </span>
                    )}
                  </div>

                  <p className={`text-sm sm:text-base font-semibold leading-relaxed ${
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
