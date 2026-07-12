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
    <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 overflow-hidden animate-slide-up">
      <div className="p-8 sm:p-10 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Lịch Học Cố Định</h2>
        <p className="text-slate-500 font-medium">Khung giờ chuẩn được thiết lập tự động cho mỗi tuần.</p>
      </div>
      
      <div className="p-8 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template, idx) => (
            <div 
              key={template._id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden group"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors">
                <span className="font-extrabold text-slate-700 text-lg group-hover:text-indigo-700 transition-colors">
                  {dayNames[template.dayOfWeek]}
                </span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-xs font-bold text-slate-500 border border-slate-200">
                  {template.items.length}
                </div>
              </div>
              <div className="p-2">
                {template.items.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400 font-medium italic">
                    Nghỉ ngơi tự do 🌴
                  </div>
                ) : (
                  template.items.map((item, index) => (
                    <div key={index} className="px-4 py-3 flex gap-4 text-sm hover:bg-slate-50 rounded-xl transition-colors">
                      <span className="font-extrabold text-indigo-500 min-w-[60px] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {item.time}
                      </span>
                      <span className="text-slate-700 font-semibold">{item.content}</span>
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
