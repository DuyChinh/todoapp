import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Clock } from 'lucide-react';

const dayNames = {
  1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7', 0: 'Chủ Nhật'
};

export default function ScheduleView() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/templates');
        const sorted = res.data.sort((a, b) => {
          const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
          const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
          return dayA - dayB;
        });
        setTemplates(sorted);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-slate-400 font-medium animate-pulse">Đang tải lịch trình...</div>;
  }

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 dark:border-slate-800/50 overflow-hidden animate-slide-up transition-colors duration-300">
      <div className="p-8 sm:p-10 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 dark:from-slate-800/50 to-white dark:to-slate-900 transition-colors">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-2 transition-colors">Lịch Học Cố Định</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Khung giờ chuẩn được thiết lập tự động cho mỗi tuần.</p>
      </div>
      
      <div className="p-8 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template, idx) => (
            <div 
              key={template._id} 
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500 transition-all duration-300 overflow-hidden group"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between group-hover:bg-indigo-50/50 dark:group-hover:bg-slate-700/50 transition-colors">
                <span className="font-extrabold text-slate-700 dark:text-slate-200 text-lg group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  {dayNames[template.dayOfWeek]}
                </span>
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 transition-colors">
                  {template.items.length}
                </div>
              </div>
              <div className="p-2">
                {template.items.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 font-medium italic transition-colors">
                    Nghỉ ngơi tự do 🌴
                  </div>
                ) : (
                  template.items.map((item, index) => (
                    <div key={index} className="px-4 py-3 flex gap-4 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                      <span className="font-extrabold text-indigo-500 dark:text-indigo-400 min-w-[60px] flex items-center gap-1.5 transition-colors">
                        <Clock className="w-3.5 h-3.5" />
                        {item.time}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold transition-colors">{item.content}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
