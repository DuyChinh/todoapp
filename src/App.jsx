import React, { useState, useEffect } from 'react';
import { subDays, addDays } from 'date-fns';
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
import { Menu, Sun, Moon } from 'lucide-react';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('daily'); // 'daily', 'timer', 'mock', 'errors', 'schedule', 'stats', 'quotes'
  const [activeTask, setActiveTask] = useState(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleStartPomodoroWithTask = (task) => {
    setActiveTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const VIEW_TITLES = {
    daily: 'Lịch hôm nay',
    timer: 'Đồng hồ Pomodoro',
    mock: 'Bảng theo dõi điểm thi thử',
    errors: 'Sổ tay lỗi sai & từ mới',
    schedule: 'Lịch mẫu chuẩn tuần',
    stats: 'Thống kê tiến độ',
    quotes: 'Trạm tiếp lửa động lực',
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 font-sans selection:bg-rose-500/30 selection:text-rose-900 dark:selection:text-rose-100 text-slate-800 dark:text-slate-100 transition-colors duration-300">
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
      <div className="md:pl-64 lg:pl-72 flex flex-col min-h-screen min-w-0 transition-all duration-300">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-30 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
                N2
              </span>
              <span className="font-black text-sm text-slate-900 dark:text-white truncate">
                {VIEW_TITLES[view]}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            aria-label="Đổi giao diện sáng/tối"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
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
                onCompleteActiveTask={() => {
                  // Task completed
                }} 
              />

              <DailyView
                currentDate={currentDate}
                onPrevDay={() => setCurrentDate(subDays(currentDate, 1))}
                onNextDay={() => setCurrentDate(addDays(currentDate, 1))}
                onStartPomodoro={handleStartPomodoroWithTask}
              />
            </div>
          )}

          {/* Standalone Pomodoro Timer View */}
          {view === 'timer' && (
            <div className="max-w-2xl mx-auto">
              <PomodoroTimer 
                activeTask={activeTask} 
                onCompleteActiveTask={() => {}} 
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
