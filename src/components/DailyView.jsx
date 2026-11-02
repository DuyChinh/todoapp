import React, { useState, useEffect, useCallback } from 'react';
import { format, getDay, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, ChevronRight, Check, Play, Clock, Sparkles, Plus, 
  RotateCcw
} from 'lucide-react';
import api from '../lib/api';
import { playSuccessChord, playSoftClick } from '../lib/audio';
import { generateLocalTasksForDate } from '../lib/storage';
import { completionMessages } from '../data/quotes';

const CATEGORY_MAP = {
  vocab: { label: 'Flashcard / Từ vựng', bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  'moji-goi': { label: 'Moji-Goi (Từ vựng/Kanji)', bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
  bunpou: { label: 'Bunpou (Ngữ pháp)', bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  dokkai: { label: 'Dokkai (Đọc hiểu)', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  choukai: { label: 'Choukai (Nghe hiểu)', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  mock_exam: { label: 'Thi thử (Mock Exam)', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  review: { label: 'Tổng kết / Lỗi sai', bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  break: { label: 'Nghỉ ngơi ☕', bg: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' }
};

export default function DailyView({ currentDate, onPrevDay, onNextDay, onStartPomodoro }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'focus', 'break'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ time: '20:00', content: '', durationMinutes: 25, category: 'bunpou', pomoSession: 'Pomo Tự chọn' });
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

  const toggleTask = async (task) => {
    const nextCompleted = !task.completed;
    playSoftClick();

    // Optimistic update
    const updatedTasks = tasks.map(t => 
      t._id === task._id ? { ...t, completed: nextCompleted } : t
    );
    setTasks(updatedTasks);
    localStorage.setItem(`tasks_${dateStr}`, JSON.stringify(updatedTasks));

    // Celebration effect on check
    if (nextCompleted) {
      playSuccessChord();
      triggerConfetti();
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
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }
  };

  const handleResetSchedule = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn tải lại lịch trình chuẩn JLPT N2 cho ngày này?')) return;
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

    setNewTask({ time: '20:00', content: '', durationMinutes: 25, category: 'bunpou', pomoSession: 'Pomo Tự chọn' });
    setShowAddModal(false);
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

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors overflow-hidden">
      {/* Toast Notification */}
      {celebrationToast && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-2.5 px-4 text-center text-xs sm:text-sm animate-slide-up flex items-center justify-center gap-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>{celebrationToast}</span>
        </div>
      )}

      {/* Date Header Bar */}
      <div className="px-5 py-5 sm:px-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onPrevDay}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
            title="Ngày trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100">
                {format(currentDate, "EEEE, 'ngày' dd/MM/yyyy", { locale: vi })}
              </span>
              {isToday(currentDate) && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Hôm nay
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {dayOfWeek === 6 
                ? '🎯 Thứ 7: Thi thử Đề 1 + Chữa đề chuyên sâu (11 Pomodoro)' 
                : dayOfWeek === 0 
                ? '🎯 Chủ Nhật: Thi thử Đề 2 + Lấp lỗ hổng (14 Pomodoro)' 
                : '⚡ Thứ 2 - Thứ 6: Luyện đề chuẩn 8 Pomodoro/ngày (4 tiếng)'}
            </p>
          </div>

          <button
            onClick={onNextDay}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
            title="Ngày tiếp"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleResetSchedule}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Nạp lại nhiệm vụ theo mẫu"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Nạp lại mẫu</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm task</span>
          </button>
        </div>
      </div>

      {/* Progress Metric & Filter Bar */}
      <div className="px-5 py-4 sm:px-8 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Progress summary */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-500/20 flex-shrink-0">
            {progressPercent}%
          </div>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Đã xong {completedFocusTasks.length}/{focusTasks.length} phiên Pomodoro</span>
              {progressPercent === 100 && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">🎉 Hoàn thành 100%!</span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Đã tích lũy: <strong className="text-indigo-600 dark:text-indigo-400">{totalFocusMinutes} phút</strong> học tập trung
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-center">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tất cả ({tasks.length})
          </button>
          <button
            onClick={() => setFilterType('focus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            🎯 Pomodoro học ({focusTasks.length})
          </button>
          <button
            onClick={() => setFilterType('break')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'break'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            ☕ Nghỉ ngơi ({tasks.filter(t => t.isBreak).length})
          </button>
        </div>
      </div>

      {/* Task Checklist Items */}
      <div className="p-4 sm:p-6 space-y-3">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-medium animate-pulse flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Đang tải danh sách Pomodoro...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
            Không có nhiệm vụ nào trong mục này.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const catStyle = CATEGORY_MAP[task.category] || CATEGORY_MAP.bunpou;
            const isDone = !!task.completed;

            return (
              <div
                key={task._id}
                className={`group relative rounded-2xl p-4 sm:p-4.5 border transition-all duration-300 flex items-start sm:items-center justify-between gap-3.5 ${
                  task.isBreak
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                    : isDone
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/50 dark:border-emerald-900/50 shadow-sm'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                }`}
              >
                {/* Left section: Checkbox & Meta */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {/* Interactive Checkbox */}
                  <button
                    onClick={() => toggleTask(task)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 scale-105'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:scale-105'
                    }`}
                    title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                  >
                    {isDone && <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />}
                  </button>

                  {/* Task details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Time */}
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        {task.time}
                      </span>

                      {/* Session Tag */}
                      {task.pomoSession && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {task.pomoSession}
                        </span>
                      )}

                      {/* Category Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catStyle.bg}`}>
                        {catStyle.label}
                      </span>

                      {/* Duration */}
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {task.durationMinutes || 25}p
                      </span>
                    </div>

                    <div className={`text-sm sm:text-base font-semibold leading-relaxed transition-all ${
                      isDone
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {task.content}
                    </div>
                  </div>
                </div>

                {/* Right section: Play in Pomodoro Button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      if (onStartPomodoro) {
                        onStartPomodoro(task);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      task.isBreak
                        ? 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white border border-indigo-200 dark:border-indigo-800 hover:border-transparent shadow-sm'
                    }`}
                    title="Bắt đầu phiên học với bộ đếm Pomodoro"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Học ngay</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

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
                  placeholder="20:00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  placeholder="Ví dụ: Làm 3 bài đọc hiểu đoạn trung Choubun..."
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
