import React from 'react';
import { Quote } from 'lucide-react';
import { quotes } from '../data/quotes';

export default function QuotesView() {
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 overflow-hidden animate-slide-up">
      <div className="p-8 sm:p-10 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Trạm Năng Lượng</h2>
        <p className="text-slate-500 font-medium">Những câu nói tiếp thêm sức mạnh cho bạn trên con đường chinh phục mục tiêu.</p>
      </div>
      
      <div className="p-8 sm:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {quotes.map((quote, idx) => (
            <div 
              key={idx} 
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 group relative overflow-hidden"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <Quote className="absolute -top-2 -left-2 w-16 h-16 text-indigo-100 -rotate-12 group-hover:text-indigo-200 transition-colors duration-300" />
              <div className="relative z-10 flex items-center justify-center h-full min-h-[100px]">
                <p className="text-slate-700 font-semibold leading-relaxed text-[1.05rem] text-center">
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
