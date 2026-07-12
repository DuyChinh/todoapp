import React, { useState, useEffect } from 'react';
import { subDays, addDays } from 'date-fns';
import DailyView from './components/DailyView';
import Statistics from './components/Statistics';
import ScheduleView from './components/ScheduleView';
import QuotesView from './components/QuotesView';
import { Calendar, BarChart3, ListTodo, Sparkles, Flame, Moon, Sun } from 'lucide-react';
import { quotes } from './data/quotes';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('daily'); // 'daily', 'stats', 'schedule', or 'quotes'

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

  const randomQuote = quotes[currentDate.getDate() % quotes.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-12 font-sans selection:bg-indigo-200 dark:selection:bg-indigo-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <header className="glass dark:bg-slate-900/70 sticky top-0 z-20 border-b border-indigo-100/50 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-auto sm:h-20 flex flex-col sm:flex-row items-center justify-between gap-4 py-3 sm:py-0">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0 max-w-sm hidden md:block">
                <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-700 dark:from-indigo-400 dark:to-purple-400 tracking-tight leading-tight">
                  Study Master
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{randomQuote}</p>
              </div>
            </div>
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="sm:hidden p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center">
            <nav className="flex flex-wrap gap-1 sm:gap-2 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl justify-center transition-colors duration-300">
              {[
                { id: 'daily', icon: Calendar, label: 'Hôm nay' },
                { id: 'schedule', icon: ListTodo, label: 'Lịch' },
                { id: 'quotes', icon: Flame, label: 'Động lực' },
                { id: 'stats', icon: BarChart3, label: 'Thống kê' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    view === item.id 
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>
            {/* Desktop Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden sm:block p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        <div className="animate-slide-up">
          {view === 'daily' && (
            <DailyView 
              currentDate={currentDate} 
              onPrevDay={() => setCurrentDate(subDays(currentDate, 1))}
              onNextDay={() => setCurrentDate(addDays(currentDate, 1))}
            />
          )}
          {view === 'stats' && <Statistics />}
          {view === 'schedule' && <ScheduleView />}
          {view === 'quotes' && <QuotesView />}
        </div>
      </main>
    </div>
  );
}

export default App;
