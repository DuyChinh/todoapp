import React from 'react';
import { Quote, PlayCircle, Sparkles, Flame, Brain, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { quotes } from '../data/quotes';

export default function QuotesView() {
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-10 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Tinh Thần Quyết Tâm N2 & Khoa Học Não Bộ
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
        {/* NEW SECTION: Dopamine Reprogramming Protocol */}
        <section className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 shadow-2xl border border-indigo-500/30 relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Section Tag & Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-rose-400" />
                  KHOA HỌC NÃO BỘ • NEUROSCIENCE
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Dopamine Detox & Reset
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400 fill-amber-400 flex-shrink-0" />
                Lập Trình Lại Dopamine: Biến Việc Học Thành Điều Tự Muốn Làm
              </h3>
            </div>

            {/* Core Principle Quote Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold leading-relaxed text-indigo-100">
              💡 <strong>Cơ chế sinh học:</strong> Não bộ không phân biệt giữa học tập và giải trí mà chỉ ưu tiên hoạt động nào mang lại <span className="text-amber-300 font-bold">dopamine (cảm giác mong chờ phần thưởng)</span> nhanh, dễ và tốn ít năng lượng nhất. Thay vì ép buộc bản thân chống lại cơ chế tự nhiên này, bạn có thể <span className="text-emerald-300 font-bold">"lập trình lại" hệ thống phần thưởng của não</span> để biến việc học thành điều bản thân tự muốn làm.
            </div>

            {/* 3 Steps Protocol Cards */}
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-indigo-300 mb-3 flex items-center gap-1.5">
                <span>Quy trình 3 bước thực hiện</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-400/60 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-600/40 text-indigo-300 font-black text-sm flex items-center justify-center border border-indigo-400/30">
                        1
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-800 text-indigo-300 border border-slate-700">
                        30 phút trước học
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white mb-2 group-hover:text-indigo-300 transition-colors">
                      Giảm dopamine trước khi học
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Ngồi yên hoặc đi bộ nhẹ, <strong>tuyệt đối không dùng điện thoại, nghe nhạc hay trò chuyện</strong>. Sự buồn chán này giúp não rơi vào trạng thái <em>"đói" kích thích</em>, khiến việc đọc sách ngay sau đó trở nên hấp dẫn hơn.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Tạo trạng thái "đói" kích thích
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-400/60 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-xl bg-purple-600/40 text-purple-300 font-black text-sm flex items-center justify-center border border-purple-400/30">
                        2
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-800 text-purple-300 border border-slate-700">
                        2 phút trước bắt đầu
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white mb-2 group-hover:text-purple-300 transition-colors">
                      Tạo kỳ vọng phần thưởng
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Nhắm mắt và <strong>hình dung cảm giác nhẹ nhõm, thỏa mãn</strong> khi hiểu bài hoặc giải xong đề để kích thích não tiết dopamine tự nhiên ngay trước khi bắt đầu bấm giờ.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Kích hoạt dopamine kỳ vọng
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-400/60 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-xl bg-emerald-600/40 text-emerald-300 font-black text-sm flex items-center justify-center border border-emerald-400/30">
                        3
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-800 text-emerald-300 border border-slate-700">
                        Trong suốt phiên học
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white mb-2 group-hover:text-emerald-300 transition-colors">
                      Gắn phần thưởng nhỏ lúc học
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Học theo <strong>chu kỳ 25 phút Pomodoro</strong>, nghỉ 2–5 phút bằng các vận động nhẹ (uống nước, duỗi người, không chạm điện thoại) và <strong>tự khen ngợi bản thân</strong> sau mỗi phiên để não liên kết việc học với cảm giác chiến thắng.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-bold text-rose-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> Liên kết với cảm giác chiến thắng
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones / Core Tips */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-indigo-500/20">
              <div className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Lưu ý cốt lõi để thành công
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-1">
                  <div className="font-black text-rose-300 flex items-center gap-1.5">
                    <span>🛑 Vượt qua 3 ngày đầu:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Đây là giai đoạn khó chịu nhất vì não liên tục đòi hỏi nguồn dopamine nhanh từ mạng xã hội, thông báo điện thoại hay video ngắn.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                  <div className="font-black text-emerald-300 flex items-center gap-1.5">
                    <span>🚀 Điểm bùng phát (Từ ngày 4–5):</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Mức dopamine cơ bản được thiết lập lại (reset), giúp bạn tìm thấy niềm vui tự nhiên từ những tiến bộ nhỏ trong học tập mà không còn cảm giác nặng nề hay bị ép buộc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Motivation Videos */}
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Video Nạp Năng Lượng & Động Lực
          </h3>

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
        </div>

        {/* Japanese & Vietnamese Wisdom Quotes Grid */}
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Quote className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Tục Ngữ & Triết Lý Chiến Binh Nhật Bản (格言)
          </h3>

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
    </div>
  );
}
