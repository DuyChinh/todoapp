import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { format, parseISO } from 'date-fns';
import { Trophy, Flame, Target } from 'lucide-react';

export default function Statistics() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/tasks/stats`);
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  let streak = 0;
  for (let i = stats.length - 1; i >= 0; i--) {
    if (stats[i].total > 0 && stats[i].percentage === 100) {
      streak++;
    } else if (stats[i].total > 0) {
      break;
    }
  }

  const avgPerformance = stats.length > 0 
    ? Math.round(stats.reduce((acc, curr) => acc + curr.percentage, 0) / stats.length) 
    : 0;

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-400 to-rose-500 p-8 rounded-[2rem] shadow-xl shadow-orange-200/50 text-white flex items-center gap-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-200/50">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <Flame className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          <div>
            <div className="text-orange-100 font-bold uppercase tracking-wider text-xs mb-1">Chuỗi nỗ lực</div>
            <div className="text-4xl font-extrabold">{streak} <span className="text-xl font-medium opacity-80">Ngày</span></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-200/50 text-white flex items-center gap-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-200/50">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <Trophy className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          <div>
            <div className="text-indigo-100 font-bold uppercase tracking-wider text-xs mb-1">Hiệu suất 7 ngày</div>
            <div className="text-4xl font-extrabold">
              {avgPerformance}%
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800">Biểu đồ tiến độ</h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-medium animate-pulse">Đang tải dữ liệu...</div>
        ) : (
          <div className="flex items-end justify-between h-56 gap-2 sm:gap-4 mt-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full relative h-full flex items-end justify-center">
                  <div 
                    className="w-full max-w-[48px] bg-slate-100 rounded-2xl overflow-hidden relative"
                    style={{ height: '100%' }}
                  >
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-purple-500 transition-all duration-1000 ease-out group-hover:from-indigo-500 group-hover:to-purple-400"
                      style={{ height: `${stat.percentage}%`, minHeight: stat.percentage > 0 ? '8px' : '0' }}
                    ></div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -top-12 bg-slate-800 text-white text-sm font-bold py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-xl pointer-events-none z-10 whitespace-nowrap">
                    {stat.percentage}%
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  {format(parseISO(stat.date), 'EEE')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
