import React from 'react';
import { 
  Calendar, Timer, Trophy, BookMarked, ListTodo, 
  BarChart3, Flame, Moon, Sun, Download, X, Sparkles 
} from 'lucide-react';

export default function Sidebar({ 
  currentView, 
  onSelectView, 
  isDarkMode, 
  onToggleDarkMode, 
  onOpenBackup, 
  isOpenMobile, 
  onCloseMobile 
}) {
  const navItems = [
    { id: 'daily', icon: Calendar, label: 'Lịch hôm nay', badge: null },
    { id: 'timer', icon: Timer, label: 'Đồng hồ Pomodoro', badge: 'SMART', badgeColor: 'bg-rose-500' },
    { id: 'mock', icon: Trophy, label: 'Điểm thi thử', badge: 'MỚI', badgeColor: 'bg-amber-500' },
    { id: 'errors', icon: BookMarked, label: 'Sổ tay lỗi sai', badge: 'GHI NHANH', badgeColor: 'bg-emerald-500' },
    { id: 'schedule', icon: ListTodo, label: 'Lịch mẫu tuần', badge: null },
    { id: 'stats', icon: BarChart3, label: 'Thống kê tiến độ', badge: null },
    { id: 'quotes', icon: Flame, label: 'Trạm tiếp lửa', badge: null },
  ];

  const handleNavClick = (id) => {
    onSelectView(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 lg:w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Logo & Branding */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 flex-shrink-0">
                <span className="text-white font-black text-lg tracking-tight">N2</span>
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  JLPT N2 SPRINT
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                    TARGET 180
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    06/12/2026
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Vertical Navigation Menu */}
        <div className="p-3.5 space-y-1.5 overflow-y-auto flex-1 scrollbar-none">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menu chức năng
          </div>

          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between gap-3 transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white flex-shrink-0 ${
                    isActive ? 'bg-white/20' : item.badgeColor || 'bg-rose-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom: Proverb, Theme Switch & Backup */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Mini proverb pill */}
          <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center gap-2 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 animate-pulse" />
            <div className="min-w-0">
              <span className="font-bold text-indigo-700 dark:text-indigo-300 text-[11px] block truncate">
                継続は力なり
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                Kiên trì là sức mạnh
              </span>
            </div>
          </div>

          {/* Action buttons grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title="Đổi giao diện sáng/tối"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{isDarkMode ? 'Sáng' : 'Tối'}</span>
            </button>

            {/* Backup Button */}
            <button
              onClick={onOpenBackup}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title="Sao lưu / Khôi phục dữ liệu"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>Sao lưu</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
