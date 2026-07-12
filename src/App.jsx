import React, { useState } from 'react';
import { subDays, addDays } from 'date-fns';
import DailyView from './components/DailyView';
import Statistics from './components/Statistics';
import ScheduleView from './components/ScheduleView';
import QuotesView from './components/QuotesView';
import { Calendar, BarChart3, ListTodo, Sparkles, Flame } from 'lucide-react';
import { quotes } from './data/quotes';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('daily'); // 'daily', 'stats', 'schedule', or 'quotes'

  const randomQuote = quotes[currentDate.getDate() % quotes.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-12 font-sans selection:bg-indigo-200">
      <header className="glass sticky top-0 z-20 border-b border-indigo-100/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-auto sm:h-20 flex flex-col sm:flex-row items-center justify-between gap-4 py-3 sm:py-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 max-w-sm hidden md:block">
              <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-700 tracking-tight leading-tight">
                Study Master
              </h1>
              <p className="text-xs font-medium text-slate-500 truncate">{randomQuote}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1 sm:gap-2 bg-slate-100/80 p-1 rounded-xl justify-center">
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
                    ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/50' 
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>
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
