import React, { useState, useEffect } from 'react';
import { subDays, addDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Sidebar from './components/Sidebar';
import CountdownBanner from './components/CountdownBanner';
import PomodoroTimer from './components/PomodoroTimer';
import DailyView from './components/DailyView';
import MockExamTracker from './components/MockExamTracker';
import QuickErrorLog from './components/QuickErrorLog';
import ScheduleView from './components/ScheduleView';
import Statistics from './components/Statistics';
import QuotesView from './components/QuotesView';
import BackupModal from './components/BackupModal';
import { Menu, Sun, Moon, Clock, Timer } from 'lucide-react';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('daily'); // 'daily', 'timer', 'mock', 'errors', 'schedule', 'stats', 'quotes'
  const [activeTask, setActiveTask] = useState(null);
  const [completedTaskEvent, setCompletedTaskEvent] = useState(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [nowTime, setNowTime] = useState(new Date());

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Live clock in top bar
  useEffect(() => {
    const t = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleStartPomodoroWithTask = (task) => {
    setActiveTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteActiveTask = (task) => {
    if (task) {
      setCompletedTaskEvent({ ...task, completedAt: Date.now() });
    }
  };

  const VIEW_META = {
    daily: { title: 'Lịch Hôm Nay & Pomodoro', jp: '今日の学習計画' },
    timer: { title: 'Đồng Hồ Pomodoro Chuyên Sâu', jp: 'ポモドーロ・タイマー' },
    mock: { title: 'Bảng Điểm Thi Thử JLPT N2', jp: '模擬試験の成績' },
    errors: { title: 'Sổ Tay Lỗi Sai & Flashcard', jp: '弱点克服ノート' },
    schedule: { title: 'Lịch Mẫu Chuẩn Tuần (Tối 20h30)', jp: '週間スケジュール' },
    stats: { title: 'Thống Kê Tiến Độ & Hiệu Suất', jp: '学習統計データ' },
    quotes: { title: 'Trạm Tiếp Lửa & Khoa Học Dopamine', jp: 'やる気ステーション' },
  };

  const currentMeta = VIEW_META[view] || VIEW_META.daily;

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 bg-grid-pattern font-sans selection:bg-rose-500/30 selection:text-rose-900 dark:selection:text-rose-100 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-x-hidden">
      {/* Ambient background decorative glow blobs */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left Sidebar (Desktop Fixed, Mobile Drawer) */}
      <Sidebar
        currentView={view}
        onSelectView={setView}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenBackup={() => setShowBackupModal(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Container (Pushed by Sidebar width on desktop) */}
      <div className="md:pl-72 flex flex-col min-h-screen min-w-0 transition-all duration-300 relative z-10">
        {/* Top Sticky Header Bar (Mobile & Desktop) */}
        <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="md:hidden w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-sm">
                N2
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {currentMeta.title}
                  </h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 font-jp">
                    {currentMeta.jp}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Header Controls: Live Clock & Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Active Task Pill if user is on another tab */}
            {activeTask && view !== 'daily' && view !== 'timer' && (
              <button
                onClick={() => setView('timer')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                <Timer className="w-3.5 h-3.5 animate-spin" />
                <span className="max-w-[160px] truncate">{activeTask.pomoSession}: {activeTask.content}</span>
              </button>
            )}

            {/* Live Clock Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                {format(nowTime, 'HH:mm:ss')}
              </span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                {format(nowTime, 'EEEE, dd/MM', { locale: vi })}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Đổi giao diện sáng/tối"
              title="Đổi giao diện Sáng / Tối"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Countdown Banner always visible at the top */}
          <CountdownBanner onOpenBackup={() => setShowBackupModal(true)} />

          {/* Daily Checklist & Active Pomodoro */}
          {view === 'daily' && (
            <div className="space-y-6">
              <PomodoroTimer 
                activeTask={activeTask} 
                onCompleteActiveTask={handleCompleteActiveTask} 
              />

              <DailyView
                currentDate={currentDate}
                onPrevDay={() => setCurrentDate(subDays(currentDate, 1))}
                onNextDay={() => setCurrentDate(addDays(currentDate, 1))}
                onToday={() => setCurrentDate(new Date())}
                onStartPomodoro={handleStartPomodoroWithTask}
                activeTaskId={activeTask?._id}
                externalCompletedTask={completedTaskEvent}
              />
            </div>
          )}

          {/* Standalone Pomodoro Timer View */}
          {view === 'timer' && (
            <div className="max-w-3xl mx-auto">
              <PomodoroTimer 
                activeTask={activeTask} 
                onCompleteActiveTask={handleCompleteActiveTask} 
              />
            </div>
          )}

          {/* Mock Exam Score Tracker View */}
          {view === 'mock' && <MockExamTracker />}

          {/* Quick Error Log Notebook View */}
          {view === 'errors' && <QuickErrorLog />}

          {/* Full Week Schedule View */}
          {view === 'schedule' && <ScheduleView />}

          {/* Statistics Progress View */}
          {view === 'stats' && <Statistics />}

          {/* Quotes Motivation View */}
          {view === 'quotes' && <QuotesView />}
        </main>
      </div>

      {/* Backup & Restore Modal */}
      <BackupModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} />
    </div>
  );
}

export default App;
