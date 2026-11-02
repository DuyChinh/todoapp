import React from 'react';
import { Quote, PlayCircle, Sparkles, Flame } from 'lucide-react';
import { quotes } from '../data/quotes';

export default function QuotesView() {
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors animate-slide-up overflow-hidden">
      <div className="p-6 sm:p-10 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Tinh Thần Quyết Tâm N2
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">
          Trạm Tiếp Lửa & Động Lực (やる気ステーション)
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
          "Kỷ luật là tự do. Mỗi giọt mồ hôi khi giải đề hôm nay là nụ cười hạnh phúc ngày 06/12/2026."
        </p>
      </div>

      <div className="p-6 sm:p-10 space-y-10">
        {/* Videos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="p-3 bg-slate-800 text-white font-bold text-xs flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-indigo-400" />
              <span>Tiktok radio #2 - Cố lên mỗi ngày</span>
            </div>
            <div className="aspect-video w-full">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/W7ArfxnnNKM" 
                title="Tiktok radio// Tổng hợp những câu nói hay, ý nghĩa, tạo động lực #2" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="p-3 bg-slate-800 text-white font-bold text-xs flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-indigo-400" />
              <span>Tuyển tập câu nói truyền cảm hứng</span>
            </div>
            <div className="aspect-video w-full">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/yY6R4ADZpmY" 
                title="Những câu nói hay, tạo động lực cho mọi người." 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="p-3 bg-slate-800 text-white font-bold text-xs flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-indigo-400" />
              <span>TS. Huỳnh Anh Bình - Nỗ lực vượt bậc</span>
            </div>
            <div className="aspect-video w-full">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/OEocWeeM-Gs" 
                title="NHỮNG CÂU NÓI TẠO ĐỘNG LỰC CỦA TS. HUỲNH ANH BÌNH" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Japanese & Vietnamese Wisdom Quotes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {quotes.map((q, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 relative group"
            >
              <Quote className="absolute top-4 right-4 w-10 h-10 text-indigo-100 dark:text-indigo-950/60 pointer-events-none" />
              
              <div className="relative z-10 space-y-2">
                <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {q.jp}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                  "{q.vi}"
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>— {q.author}</span>
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
