import React from 'react';
import { Quote, PlayCircle } from 'lucide-react';
import { quotes } from '../data/quotes';

export default function QuotesView() {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 dark:border-slate-800/50 overflow-hidden animate-slide-up transition-colors duration-300">
      <div className="p-8 sm:p-10 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 dark:from-slate-800/50 to-white dark:to-slate-900 transition-colors">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-2 transition-colors">Trạm Năng Lượng</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Những câu nói tiếp thêm sức mạnh cho bạn trên con đường chinh phục mục tiêu.</p>
      </div>
      
      <div className="p-8 sm:p-10 space-y-10">
        
        {/* Video Động Lực */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 dark:bg-[#090E17] rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-100 dark:shadow-none relative group border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10 p-4 sm:p-6 flex items-end">
              <h3 className="text-white font-bold text-base flex items-center gap-2 drop-shadow-lg truncate">
                <PlayCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">Tiktok radio #2</span>
              </h3>
            </div>
            <div className="aspect-video w-full relative z-0">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/W7ArfxnnNKM" 
                title="Tiktok radio// Tổng hợp những câu nói hay, ý nghĩa, tạo động lực #2" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen>
              </iframe>
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-[#090E17] rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-100 dark:shadow-none relative group border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10 p-4 sm:p-6 flex items-end">
              <h3 className="text-white font-bold text-base flex items-center gap-2 drop-shadow-lg truncate">
                <PlayCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">Tuyển tập câu nói hay</span>
              </h3>
            </div>
            <div className="aspect-video w-full relative z-0">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/yY6R4ADZpmY" 
                title="Những câu nói hay, tạo động lực cho mọi người." 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen>
              </iframe>
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-[#090E17] rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-100 dark:shadow-none relative group border border-slate-200 dark:border-slate-800 transition-colors lg:col-span-1 md:col-span-2">
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10 p-4 sm:p-6 flex items-end">
              <h3 className="text-white font-bold text-base flex items-center gap-2 drop-shadow-lg truncate">
                <PlayCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">TS. Huỳnh Anh Bình</span>
              </h3>
            </div>
            <div className="aspect-video w-full relative z-0">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/OEocWeeM-Gs" 
                title="NHỮNG CÂU NÓI TẠO ĐỘNG LỰC CỦA TS. HUỲNH ANH BÌNH" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen>
              </iframe>
            </div>
          </div>
        </div>

        {/* Lưới Câu Nói */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {quotes.map((quote, idx) => (
            <div 
              key={idx} 
              className="bg-gradient-to-br from-white dark:from-slate-800 to-slate-50 dark:to-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 group relative overflow-hidden"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <Quote className="absolute -top-2 -left-2 w-16 h-16 text-indigo-100 dark:text-indigo-900/40 -rotate-12 group-hover:text-indigo-200 dark:group-hover:text-indigo-800/60 transition-colors duration-300" />
              <div className="relative z-10 flex items-center justify-center h-full min-h-[100px]">
                <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed text-[1.05rem] text-center transition-colors">
                  "{quote}"
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
