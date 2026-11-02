import React, { useState, useEffect } from 'react';
import { subDays, addDays } from 'date-fns';
import CountdownBanner from './components/CountdownBanner';
import PomodoroTimer from './components/PomodoroTimer';
import DailyView from './components/DailyView';
import MockExamTracker from './components/MockExamTracker';
import QuickErrorLog from './components/QuickErrorLog';
import ScheduleView from './components/ScheduleView';
import Statistics from './components/Statistics';
import QuotesView from './components/QuotesView';
import BackupModal from './components/BackupModal';
import { 
  Calendar, Timer, Trophy, BookMarked, ListTodo, 
  BarChart3, Flame, Moon, Sun
} from 'lucide-react';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('daily'); // 'daily', 'timer', 'mock', 'errors', 'schedule', 'stats', 'quotes'
  const [activeTask, setActiveTask] = useState(null);
  const [showBackupModal, setShowBackupModal] = useState(false);

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

  const navItems = [
    { id: 'daily', icon: Calendar, label: 'Lịch hôm nay', badge: null },
    { id: 'timer', icon: Timer, label: 'Đồng hồ Pomodoro', badge: 'Smart' },
    { id: 'mock', icon: Trophy, label: 'Điểm thi thử', badge: 'Mới' },
    { id: 'errors', icon: BookMarked, label: 'Sổ tay lỗi sai', badge: 'Ghi nhanh' },
    { id: 'schedule', icon: ListTodo, label: 'Lịch mẫu tuần', badge: null },
    { id: 'stats', icon: BarChart3, label: 'Thống kê', badge: null },
    { id: 'quotes', icon: Flame, label: 'Tiếp lửa', badge: null },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 font-sans selection:bg-rose-500/30 selection:text-rose-900 dark:selection:text-rose-100 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Logo & App title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 flex-shrink-0">
              <span className="text-white font-black text-base sm:text-lg">N2</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                  JLPT N2 SPRINT
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Target 180
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                02/11/2026 – 06/12/2026 • 継続は力なり
              </p>
            </div>
          </div>

          {/* Right Header: Theme switch */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200 dark:border-slate-700"
              aria-label="Đổi giao diện sáng/tối"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-2.5 pt-1 overflow-x-auto scrollbar-none flex items-center gap-1.5 sm:gap-2">
          {navItems.map((item) => {
            const isActive = view === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/40'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8 space-y-6">
        {/* Countdown Banner always visible at top */}
        <CountdownBanner onOpenBackup={() => setShowBackupModal(true)} />

        {/* In 'daily' view, also show the Smart Pomodoro Timer on top */}
        {view === 'daily' && (
          <div className="space-y-6">
            <PomodoroTimer 
              activeTask={activeTask} 
              onCompleteActiveTask={() => {
                // Task completed in timer
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

        {view === 'timer' && (
          <div className="max-w-2xl mx-auto">
            <PomodoroTimer 
              activeTask={activeTask} 
              onCompleteActiveTask={() => {}} 
            />
          </div>
        )}

        {view === 'mock' && <MockExamTracker />}

        {view === 'errors' && <QuickErrorLog />}

        {view === 'schedule' && <ScheduleView />}

        {view === 'stats' && <Statistics />}

        {view === 'quotes' && <QuotesView />}
      </main>

      {/* Backup Modal */}
      <BackupModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} />
    </div>
  );
}

export default App;
