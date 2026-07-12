import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, Target, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';

export default function DailyView({ currentDate, onPrevDay, onNextDay }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  useEffect(() => {
    fetchTasks();
  }, [dateStr]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/date/${dateStr}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task) => {
    setTasks(tasks.map(t => 
      t._id === task._id ? { ...t, completed: !t.completed } : t
    ));

    try {
      await api.patch(`/tasks/${task._id}/toggle`, {
        completed: !task.completed
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      fetchTasks();
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isAllDone = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 overflow-hidden relative">
      {isAllDone && (
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none z-0"></div>
      )}

      <div className="px-6 py-8 sm:p-8 border-b border-indigo-50 flex items-center justify-between relative z-10">
        <button onClick={onPrevDay} className="w-12 h-12 flex items-center justify-center hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-full transition-all bg-slate-50 shadow-sm border border-slate-100 hover:border-indigo-200">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {format(currentDate, 'EEEE')}
          </h2>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            {format(currentDate, 'MMMM d, yyyy')}
          </p>
        </div>
        <button onClick={onNextDay} className="w-12 h-12 flex items-center justify-center hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-full transition-all bg-slate-50 shadow-sm border border-slate-100 hover:border-indigo-200">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 py-8 sm:px-10 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 relative z-10 border-b border-indigo-50/50">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Mục tiêu hôm nay</div>
            <div className="text-3xl font-extrabold text-slate-800">
              {progress}% <span className="text-base font-semibold text-slate-500 tracking-normal">hoàn thành</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-100/50 px-4 py-2 rounded-xl border border-indigo-100">
            <Target className="w-4 h-4" />
            {completedCount} / {totalCount} Task
          </div>
        </div>
        <div className="w-full bg-slate-200/80 rounded-full h-4 overflow-hidden shadow-inner p-0.5">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden",
              isAllDone ? "bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
            )}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-10 space-y-4 relative z-10 bg-slate-50/30">
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-medium animate-pulse">Đang tải lịch trình...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-12">
              <span className="text-2xl">☕</span>
            </div>
            <h3 className="text-lg font-bold text-slate-700">Ngày nghỉ hoàn hảo!</h3>
            <p className="text-slate-500 font-medium">Không có task nào được lên lịch. Hãy dành thời gian thư giãn.</p>
          </div>
        ) : (
          tasks.map((task, idx) => (
            <div 
              key={task._id}
              onClick={() => toggleTask(task)}
              className={cn(
                "group flex items-start gap-4 sm:gap-6 p-5 sm:p-6 rounded-[1.5rem] cursor-pointer transition-all duration-300 animate-slide-up",
                task.completed 
                  ? "bg-white/40 shadow-sm border border-slate-200/50 opacity-70" 
                  : "bg-white shadow-md shadow-indigo-100/40 border border-indigo-50 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100/60"
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="mt-1 relative">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-400",
                  task.completed 
                    ? "bg-emerald-500 border-emerald-500 scale-110" 
                    : "border-slate-300 group-hover:border-indigo-400 bg-slate-50 group-hover:bg-indigo-50"
                )}>
                  <Check className={cn("w-4 h-4 text-white transition-transform duration-300", task.completed ? "scale-100" : "scale-0")} strokeWidth={4} />
                </div>
                {task.completed && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-[pulse-ring_1s_ease-out]"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className={cn(
                  "flex items-center gap-2 text-xs font-bold mb-2 uppercase tracking-wider transition-colors",
                  task.completed ? "text-slate-400" : "text-indigo-500"
                )}>
                  <Clock className="w-3.5 h-3.5" />
                  {task.time}
                </div>
                <div className="relative inline-block">
                  <span className={cn(
                    "text-lg sm:text-xl font-bold transition-all duration-300",
                    task.completed ? "text-slate-400" : "text-slate-800"
                  )}>
                    {task.content}
                  </span>
                  <span className={cn(
                    "absolute left-0 top-1/2 h-0.5 transition-all duration-300 ease-out rounded-full",
                    task.completed ? "w-full bg-slate-400" : "w-0 bg-transparent"
                  )}></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
