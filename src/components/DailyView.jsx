import React, { useState, useEffect, useCallback } from 'react';
import { format, getDay, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, ChevronRight, Check, Play, Clock, Sparkles, Plus, 
  RotateCcw, Pencil, Trash2, X, Sun, Sunset, Moon, CalendarCheck
} from 'lucide-react';
import api from '../lib/api';
import { playSuccessChord, playSoftClick } from '../lib/audio';
import { generateLocalTasksForDate } from '../lib/storage';
import { completionMessages } from '../data/quotes';

const CATEGORY_MAP = {
  vocab: { 
    label: 'Flashcard / Từ vựng', 
    bg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/70',
    accent: 'bg-indigo-500'
  },
  flashcard: { 
    label: 'Flashcard / Anki', 
    bg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/70',
    accent: 'bg-indigo-500'
  },
  'moji-goi': { 
    label: 'Moji-Goi (Từ vựng/Kanji)', 
    bg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/70',
    accent: 'bg-sky-500'
  },
  bunpou: { 
    label: 'Bunpou (Ngữ pháp)', 
    bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/70',
    accent: 'bg-purple-500'
  },
  dokkai: { 
    label: 'Dokkai (Đọc hiểu)', 
    bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/70',
    accent: 'bg-emerald-500'
  },
  choukai: { 
    label: 'Choukai (Nghe hiểu)', 
    bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/70',
    accent: 'bg-amber-500'
  },
  mock_exam: { 
    label: 'Thi thử (Mock Exam)', 
    bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/70',
    accent: 'bg-rose-500'
  },
  review: { 
    label: 'Tổng kết / Lỗi sai', 
    bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/70',
    accent: 'bg-blue-500'
  },
  break: { 
    label: 'Nghỉ ngơi & Reset ☕', 
    bg: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    accent: 'bg-slate-300 dark:bg-slate-600'
  }
};

export default function DailyView({ 
  currentDate, 
  onPrevDay, 
  onNextDay, 
  onToday,
  onStartPomodoro,
  activeTaskId,
  externalCompletedTask
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'focus', 'break'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ 
    time: '20:30', 
    content: '', 
    durationMinutes: 25, 
    category: 'bunpou', 
    pomoSession: 'Pomo Tự chọn' 
  });
  const [editingTask, setEditingTask] = useState(null);
  const [celebrationToast, setCelebrationToast] = useState(null);

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const dayOfWeek = getDay(currentDate);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/date/${dateStr}`);
      if (res.data && res.data.length > 0) {
        setTasks(res.data);
      } else {
        const local = generateLocalTasksForDate(dateStr, dayOfWeek);
        setTasks(local);
      }
    } catch {
      const cached = localStorage.getItem(`tasks_${dateStr}`);
      if (cached) {
        setTasks(JSON.parse(cached));
      } else {
        const local = generateLocalTasksForDate(dateStr, dayOfWeek);
        setTasks(local);
      }
    } finally {
      setLoading(false);
    }
  }, [dateStr, dayOfWeek]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTask = useCallback(async (task, forceComplete = false) => {
    const nextCompleted = forceComplete ? true : !task.completed;
    playSoftClick();

    setTasks((prev) => {
      const updated = prev.map(t => 
        t._id === task._id ? { ...t, completed: nextCompleted } : t
      );
      localStorage.setItem(`tasks_${dateStr}`, JSON.stringify(updated));
      return updated;
    });

    if (nextCompleted) {
      playSuccessChord();
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // ignore
      }
      const randomMsg = completionMessages[Math.floor(Math.random() * completionMessages.length)];
      setCelebrationToast(randomMsg);
      setTimeout(() => setCelebrationToast(null), 4000);
    }

    try {
      if (String(task._id).startsWith('local_')) {
        return;
      }
      await api.patch(`/tasks/${task._id}/toggle`, {
        completed: nextCompleted
      });
    } catch {
      // ignore
    }
  }, [dateStr]);

  // Listen to external task completion from PomodoroTimer
  useEffect(() => {
    if (externalCompletedTask && externalCompletedTask._id) {
      toggleTask(externalCompletedTask, true);
    }
  }, [externalCompletedTask, toggleTask]);

  const handleResetSchedule = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn tải lại lịch trình chuẩn JLPT N2 (Tối 20h30) cho ngày này?')) return;
    try {
      setLoading(true);
      const res = await api.post(`/tasks/reset/${dateStr}`);
      if (res.data && res.data.length > 0) {
        setTasks(res.data);
      } else {
        const local = generateLocalTasksForDate(dateStr, dayOfWeek);
        setTasks(local);
      }
      localStorage.removeItem(`tasks_${dateStr}`);
      setCelebrationToast('Đã đồng bộ lại lịch trình chuẩn 20h30! ⚡');
      setTimeout(() => setCelebrationToast(null), 3000);
    } catch {
      const local = generateLocalTasksForDate(dateStr, dayOfWeek);
      setTasks(local);
      localStorage.setItem(`tasks_${dateStr}`, JSON.stringify(local));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.content.trim()) return;

    const taskObj = {
      date: dateStr,
      time: newTask.time,
      content: newTask.content.trim(),
      category: newTask.category,
      pomoSession: newTask.pomoSession || 'Pomo Tự chọn',
      durationMinutes: Number(newTask.durationMinutes) || 25,
      isBreak: newTask.category === 'break',
      completed: false
    };

    try {
      const res = await api.post('/tasks', taskObj);
      setTasks([...tasks, res.data].sort((a, b) => a.time.localeCompare(b.time)));
    } catch {
      const localTask = { ...taskObj, _id: `local_${Date.now()}` };
      const updated = [...tasks, localTask].sort((a, b) => a.time.localeCompare(b.time));
      setTasks(updated);
      localStorage.setItem(`tasks_${dateStr}`, JSON.stringify(updated));
    }

    setNewTask({ time: '20:30', content: '', durationMinutes: 25, category: 'bunpou', pomoSession: 'Pomo Tự chọn' });
    setShowAddModal(false);
  };

  const handleOpenEdit = (task) => {
    playSoftClick();
    setEditingTask({
      _id: task._id,
      time: task.time || '20:30',
      content: task.content || '',
      category: task.category || 'bunpou',
      pomoSession: task.pomoSession || '',
      durationMinutes: task.durationMinutes || 25,
      isBreak: !!task.isBreak,
      notes: task.notes || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.content.trim()) return;
    playSoftClick();

    const updatedData = {
      time: editingTask.time,
      content: editingTask.content.trim(),
      category: editingTask.category,
      pomoSession: editingTask.pomoSession.trim(),
      durationMinutes: Number(editingTask.durationMinutes) || 25,
      isBreak: editingTask.category === 'break' || !!editingTask.isBreak,
      notes: editingTask.notes?.trim() || ''
    };

    const updatedTasks = tasks.map(t => 
      t._id === editingTask._id ? { ...t, ...updatedData } : t
    ).sort((a, b) => a.time.localeCompare(b.time));
    setTasks(updatedTasks);
    localStorage.setItem(`tasks_${dateStr}`, JSON.stringify(updatedTasks));

    setCelebrationToast('Đã cập nhật phiên học thành công! ✨');
    setTimeout(() => setCelebrationToast(null), 3000);

    try {
      if (!String(editingTask._id).startsWith('local_')) {
        await api.put(`/tasks/${editingTask._id}`, updatedData);
      }
    } catch {
      // ignore
    }

    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhiệm vụ này khỏi lịch hôm nay?')) return;
    playSoftClick();

    const updatedTasks = tasks.filter(t => t._id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem(`tasks_${dateStr}`, JSON.stringify(updatedTasks));

    try {
      if (!String(taskId).startsWith('local_')) {
        await api.delete(`/tasks/${taskId}`);
      }
    } catch {
      // ignore
    }

    if (editingTask && editingTask._id === taskId) {
      setEditingTask(null);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filterType === 'focus') return !t.isBreak;
    if (filterType === 'break') return !!t.isBreak;
    return true;
  });

  const focusTasks = tasks.filter(t => !t.isBreak);
  const completedFocusTasks = focusTasks.filter(t => t.completed);
  const progressPercent = focusTasks.length > 0 
    ? Math.round((completedFocusTasks.length / focusTasks.length) * 100) 
    : 0;

  const totalFocusMinutes = completedFocusTasks.reduce((sum, t) => sum + (t.durationMinutes || 25), 0);

  // Group filteredTasks by session time of day
  const getPeriodKey = (timeStr = '07:00') => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (isNaN(hour) || hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const PERIOD_META = {
    morning: {
      title: 'Ca Sáng • Khởi Động Phản Xạ',
      subtitle: '07:00 – 08:30',
      icon: Sun,
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      iconColor: 'text-amber-500'
    },
    afternoon: {
      title: 'Ca Chiều • Thi Thử & Chữa Đề Chuyên Sâu',
      subtitle: '13:00 – 18:00',
      icon: Sunset,
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
      iconColor: 'text-rose-500'
    },
    evening: {
      title: 'Ca Tối • Bứt Phá Trọng Tâm (Khung 20h30)',
      subtitle: '20:00 – 23:35',
      icon: Moon,
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
      iconColor: 'text-indigo-500'
    }
  };

  const groupedSections = ['morning', 'afternoon', 'evening']
    .map((key) => {
      const periodTasks = filteredTasks.filter((t) => getPeriodKey(t.time) === key);
      return {
        key,
        meta: PERIOD_META[key],
        items: periodTasks
      };
    })
    .filter((section) => section.items.length > 0);

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors overflow-hidden">
      {/* Toast Notification */}
      {celebrationToast && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white font-extrabold py-3 px-4 text-center text-xs sm:text-sm animate-slide-up flex items-center justify-center gap-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>{celebrationToast}</span>
        </div>
      )}

      {/* Date Header Bar */}
      <div className="px-5 py-5 sm:px-8 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
        {/* Navigation */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 w-full lg:w-auto justify-between lg:justify-start">
          <button
            onClick={onPrevDay}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-sm"
            title="Ngày trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white capitalize">
                {format(currentDate, "EEEE, dd/MM/yyyy", { locale: vi })}
              </span>
              {isToday(currentDate) ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
                  Hôm nay
                </span>
              ) : onToday ? (
                <button
                  onClick={onToday}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
                >
                  <CalendarCheck className="w-3 h-3" />
                  Về hôm nay
                </button>
              ) : null}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              {dayOfWeek === 6 
                ? '🎯 Thứ 7: Thi thử Đề 1 + Chữa đề chuyên sâu (11 Pomodoro • Tối 20h30)' 
                : dayOfWeek === 0 
                ? '🎯 Chủ Nhật: Thi thử Đề 2 + Lấp lỗ hổng (14 Pomodoro • Tối 20h30)' 
                : '⚡ Thứ 2 - Thứ 6: Luyện đề chuẩn 8 Pomodoro/ngày (Sáng 07:00 • Tối 20:30)'}
            </p>
          </div>

          <button
            onClick={onNextDay}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-sm"
            title="Ngày tiếp theo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={handleResetSchedule}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Nạp lại lịch trình chuẩn 20h30 cho ngày này"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Đồng bộ mẫu 20h30</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm phiên học</span>
          </button>
        </div>
      </div>

      {/* Progress Metric & Filter Bar */}
      <div className="px-5 py-4 sm:px-8 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Progress summary + linear bar */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl text-white flex flex-col items-center justify-center font-black shadow-md flex-shrink-0 p-2 ${
            progressPercent === 100
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20'
              : 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/20'
          }`}>
            <span className="text-sm sm:text-base leading-none">{progressPercent}%</span>
            <span className="text-[9px] font-bold opacity-80 uppercase mt-0.5">Xong</span>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
              <span>Hoàn thành {completedFocusTasks.length}/{focusTasks.length} phiên trọng tâm</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {totalFocusMinutes} phút tích lũy
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 self-end md:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất cả ({tasks.length})
          </button>
          <button
            onClick={() => setFilterType('focus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterType === 'focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎯 Phiên học ({focusTasks.length})
          </button>
          <button
            onClick={() => setFilterType('break')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterType === 'break'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ☕ Nghỉ ({tasks.filter(t => t.isBreak).length})
          </button>
        </div>
      </div>

      {/* Grouped Task Checklist Items */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-7">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-semibold animate-pulse flex flex-col items-center gap-2.5">
            <Clock className="w-7 h-7 animate-spin text-indigo-500" />
            <span>Đang tải danh sách lịch trình Pomodoro...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
            Không có nhiệm vụ nào trong bộ lọc này.
          </div>
        ) : (
          groupedSections.map((section) => {
            const PeriodIcon = section.meta.icon;
            const sectionFocus = section.items.filter(i => !i.isBreak);
            const sectionDone = sectionFocus.filter(i => i.completed);

            return (
              <div key={section.key} className="space-y-3">
                {/* Section Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${section.meta.badgeBg}`}>
                      <PeriodIcon className={`w-4 h-4 ${section.meta.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                        {section.meta.title}
                      </h4>
                    </div>
                  </div>

                  {sectionFocus.length > 0 && (
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                      {sectionDone.length}/{sectionFocus.length} Pomo xong
                    </span>
                  )}
                </div>

                {/* Section Cards */}
                <div className="space-y-2.5">
                  {section.items.map((task) => {
                    const catStyle = CATEGORY_MAP[task.category] || CATEGORY_MAP.bunpou;
                    const isDone = !!task.completed;
                    const isSelectedActive = activeTaskId && activeTaskId === task._id;

                    return (
                      <div
                        key={task._id}
                        className={`group relative rounded-2xl p-4 sm:px-5 sm:py-4 border transition-all duration-200 flex items-start sm:items-center justify-between gap-3.5 overflow-hidden ${
                          isSelectedActive
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                            : task.isBreak
                            ? 'bg-slate-50/70 dark:bg-slate-800/35 border-slate-200/70 dark:border-slate-800/80'
                            : isDone
                            ? 'bg-emerald-50/35 dark:bg-emerald-950/15 border-emerald-200/70 dark:border-emerald-900/40'
                            : 'bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600/80 hover:shadow-md'
                        }`}
                      >
                        {/* Left Color Accent Strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isDone ? 'bg-emerald-500' : catStyle.accent}`} />

                        {/* Left section: Checkbox & Meta */}
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1 pl-1">
                          {/* Interactive Checkbox */}
                          <button
                            onClick={() => toggleTask(task)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                              isDone
                                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25 scale-105'
                                : 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:scale-105'
                            }`}
                            title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                          >
                            {isDone && <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3]" />}
                          </button>

                          {/* Task details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                              {/* Time Pill */}
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-mono border border-indigo-200/60 dark:border-indigo-800/60">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                {task.time}
                              </span>

                              {/* Session Tag */}
                              {task.pomoSession && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                  task.isBreak
                                    ? 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    : 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-200'
                                }`}>
                                  {task.pomoSession}
                                </span>
                              )}

                              {/* Category Badge */}
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catStyle.bg}`}>
                                {catStyle.label}
                              </span>

                              {/* Duration */}
                              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                                • {task.durationMinutes || 25} phút
                              </span>
                            </div>

                            <div className={`text-sm sm:text-[15px] font-bold leading-relaxed transition-all ${
                              isDone
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : task.isBreak
                                ? 'text-slate-600 dark:text-slate-300'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}>
                              {task.content}
                            </div>

                            {task.notes && (
                              <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-medium italic mt-1 bg-indigo-50/50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-lg inline-block">
                                📌 {task.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right section: Action Buttons (Edit, Delete & Play) */}
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                            title="Chỉnh sửa nhiệm vụ này"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="hidden sm:inline-flex p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa nhiệm vụ này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Play in Pomodoro Button */}
                          <button
                            onClick={() => {
                              if (onStartPomodoro) {
                                onStartPomodoro(task);
                              }
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                              isSelectedActive
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                                : task.isBreak
                                ? 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white border border-indigo-200/80 dark:border-indigo-800 hover:border-transparent shadow-sm'
                            }`}
                            title="Bắt đầu phiên học với bộ đếm Pomodoro"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline">{isSelectedActive ? 'Đang chọn' : 'Bấm giờ'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-slide-up">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setEditingTask(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                  Chỉnh Sửa Phiên Học
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cập nhật thời gian, nội dung và phân loại bài học
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="text"
                    value={editingTask.time}
                    onChange={(e) => setEditingTask({ ...editingTask, time: e.target.value })}
                    placeholder="20:30"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Tên phiên / Nhãn
                  </label>
                  <input
                    type="text"
                    value={editingTask.pomoSession}
                    onChange={(e) => setEditingTask({ ...editingTask, pomoSession: e.target.value })}
                    placeholder="VD: Pomo 3, Thi thử 105p..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Nội dung nhiệm vụ
                </label>
                <textarea
                  value={editingTask.content}
                  onChange={(e) => setEditingTask({ ...editingTask, content: e.target.value })}
                  placeholder="Nội dung chi tiết..."
                  rows="3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Phân loại
                  </label>
                  <select
                    value={editingTask.category}
                    onChange={(e) => setEditingTask({ 
                      ...editingTask, 
                      category: e.target.value,
                      isBreak: e.target.value === 'break' 
                    })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="vocab">Flashcard / Từ vựng</option>
                    <option value="moji-goi">Moji-Goi (Kanji)</option>
                    <option value="bunpou">Bunpou (Ngữ pháp)</option>
                    <option value="dokkai">Dokkai (Đọc hiểu)</option>
                    <option value="choukai">Choukai (Nghe hiểu)</option>
                    <option value="mock_exam">Thi thử (Mock Exam)</option>
                    <option value="review">Tổng kết / Lỗi sai</option>
                    <option value="break">Nghỉ ngơi ☕</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    value={editingTask.durationMinutes}
                    onChange={(e) => setEditingTask({ ...editingTask, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Ghi chú riêng (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={editingTask.notes}
                  onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                  placeholder="Ghi chú thêm tài liệu, trang sách..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(editingTask._id)}
                  className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa task này</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-slide-up">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4">
              Thêm phiên Pomodoro mới
            </h3>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Giờ bắt đầu (HH:mm)
                </label>
                <input
                  type="text"
                  value={newTask.time}
                  onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                  placeholder="20:30"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Nội dung phiên học
                </label>
                <textarea
                  value={newTask.content}
                  onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
                  placeholder="Ví dụ: Làm 3 bài đọc hiểu đoạn trung Chuubun..."
                  rows="3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Phân loại
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="vocab">Flashcard / Từ vựng</option>
                    <option value="moji-goi">Moji-Goi (Kanji)</option>
                    <option value="bunpou">Bunpou (Ngữ pháp)</option>
                    <option value="dokkai">Dokkai (Đọc hiểu)</option>
                    <option value="choukai">Choukai (Nghe hiểu)</option>
                    <option value="mock_exam">Thi thử</option>
                    <option value="review">Tổng kết lỗi sai</option>
                    <option value="break">Nghỉ ngơi ☕</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    value={newTask.durationMinutes}
                    onChange={(e) => setNewTask({ ...newTask, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/30"
                >
                  Lưu phiên học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
