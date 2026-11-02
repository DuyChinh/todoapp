import React from 'react';
import { 
  Calendar, Timer, Trophy, BookMarked, ListTodo, 
  BarChart3, Flame, Moon, Sun, Download, X, Sparkles, Clock, ShieldCheck
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
  const navGroups = [
    {
      title: 'Lộ trình hằng ngày',
      items: [
        { id: 'daily', icon: Calendar, label: 'Lịch hôm nay', subtitle: 'Checklist & Tiến độ', badge: 'HÔM NAY', badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
        { id: 'timer', icon: Timer, label: 'Đồng hồ Pomodoro', subtitle: '25p Focus • Đề 105p/50p', badge: 'SMART', badgeColor: 'bg-rose-500 text-white' },
        { id: 'schedule', icon: ListTodo, label: 'Lịch mẫu tuần', subtitle: 'Khung giờ chuẩn 20h30', badge: null },
      ]
    },
    {
      title: 'Đánh giá & Ghi chép',
      items: [
        { id: 'mock', icon: Trophy, label: 'Điểm thi thử', subtitle: 'Theo dõi mục tiêu 120+', badge: '120/180', badgeColor: 'bg-amber-500 text-white' },
        { id: 'errors', icon: BookMarked, label: 'Sổ tay lỗi sai', subtitle: 'Flashcard & Bẫy đề thi', badge: 'ÔN SÁNG', badgeColor: 'bg-emerald-500 text-white' },
        { id: 'stats', icon: BarChart3, label: 'Thống kê tiến độ', subtitle: 'Chuỗi ngày & Hiệu suất', badge: null },
      ]
    },
    {
      title: 'Năng lượng & Khoa học',
      items: [
        { id: 'quotes', icon: Flame, label: 'Trạm tiếp lửa', subtitle: 'Dopamine Reset & Động lực', badge: 'HOT', badgeColor: 'bg-orange-500 text-white' },
      ]
    }
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
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/90 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 shadow-xl shadow-slate-900/5 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Logo & Branding */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 rounded-2xl blur opacity-60 group-hover:opacity-90 transition duration-300" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex flex-col items-center justify-center shadow-lg flex-shrink-0 border border-white/20">
                  <span className="text-[9px] font-black text-rose-100 tracking-widest leading-none font-jp">合格</span>
                  <span className="text-white font-black text-lg tracking-tight leading-tight">N2</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    JLPT N2 SPRINT
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-500/15 to-indigo-500/15 dark:from-rose-500/25 dark:to-indigo-500/25 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-rose-500" />
                    TARGET 120
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                    06/12
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Grouped Vertical Navigation Menu */}
        <div className="px-3.5 py-4 space-y-5 overflow-y-auto flex-1 scrollbar-none">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {group.title}
              </div>

              {group.items.map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative w-full px-3.5 py-2.5 rounded-2xl text-left flex items-center justify-between gap-2.5 transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-400/40'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {/* Active Left Pill Bar */}
                    {isActive && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-white/90" />
                    )}

                    <div className={`flex items-center gap-3 min-w-0 ${isActive ? 'pl-1' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        isActive
                          ? 'bg-white/20 text-white shadow-inner'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-105'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs sm:text-[13px] font-bold truncate leading-tight ${
                          isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                        }`}>
                          {item.label}
                        </div>
                        <div className={`text-[10px] truncate mt-0.5 ${
                          isActive ? 'text-indigo-100/90 font-medium' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex-shrink-0 ${
                        isActive
                          ? 'bg-white/25 text-white border border-white/20'
                          : item.badgeColor || 'bg-rose-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Daily Time Slot Quick Card */}
          <div className="mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-800/60 dark:to-indigo-950/30 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Khung giờ cố định
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-mono">
                8 Pomo/ngày
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block font-semibold">🌅 Ca Sáng</span>
                <span className="font-black text-slate-700 dark:text-slate-200 font-mono">07:00 - 08:00</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block font-semibold">🌙 Ca Tối</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono">20:30 - 23:35</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Proverb, Theme Switch & Backup */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3 bg-slate-50/70 dark:bg-slate-900/60">
          {/* Japanese Proverb Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-rose-50/60 dark:from-indigo-950/50 dark:via-purple-950/30 dark:to-rose-950/30 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-indigo-900 dark:text-indigo-200 text-xs block truncate font-jp">
                継続は力なり
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate block">
                Kiên trì bền bỉ chính là sức mạnh
              </span>
            </div>
          </div>

          {/* Action buttons grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 transition-all shadow-sm"
              title="Đổi giao diện sáng/tối"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Giao diện Sáng</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Giao diện Tối</span>
                </>
              )}
            </button>

            {/* Backup Button */}
            <button
              onClick={onOpenBackup}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 transition-all shadow-sm"
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
