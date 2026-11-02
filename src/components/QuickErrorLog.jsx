import React, { useState, useEffect } from 'react';
import { 
  BookMarked, Plus, Search, CheckCircle2, Trash2, Sun, 
  Layers, List, Eye, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import api from '../lib/api';
import { playSuccessChord, playSoftClick } from '../lib/audio';

const ERROR_CATEGORIES = [
  { id: 'all', label: 'Tất cả', badge: 'bg-slate-100 text-slate-700' },
  { id: 'vocab', label: 'Từ vựng (Goi)', badge: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  { id: 'kanji', label: 'Chữ Hán (Kanji)', badge: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
  { id: 'grammar', label: 'Ngữ pháp (Bunpou)', badge: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { id: 'reading', label: 'Đọc hiểu (Dokkai)', badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { id: 'listening', label: 'Nghe hiểu (Choukai)', badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' }
];

export default function QuickErrorLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'need_review', 'reviewed'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [displayMode, setDisplayMode] = useState('list'); // 'list' | 'flashcard'
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [form, setForm] = useState({
    term: '',
    meaning: '',
    exampleOrNote: '',
    category: 'vocab'
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/error-logs');
      setLogs(res.data);
    } catch {
      const cached = localStorage.getItem('n2_error_logs');
      if (cached) {
        setLogs(JSON.parse(cached));
      } else {
        const sampleLogs = [
          {
            _id: 'sample_err_1',
            term: '〜を皮切りに (〜wo kawakiri ni)',
            meaning: 'Bắt đầu với... và mở rộng liên tiếp ra nhiều hành động tiếp theo',
            exampleOrNote: 'Hay nhầm với 〜を機に (nhân dịp). Thường dùng cho các chuỗi sự kiện tích cực.',
            category: 'grammar',
            reviewedMorning: false,
            date: '2026-11-02'
          },
          {
            _id: 'sample_err_2',
            term: '脆弱 (ぜいじゃく - Zeijaku)',
            meaning: 'Yếu ớt, mỏng manh, dễ bị tổn thương (ví dụ bảo mật hệ thống yếu)',
            exampleOrNote: 'Nhầm âm Hán tự Thúy với Hựu.',
            category: 'kanji',
            reviewedMorning: true,
            date: '2026-11-01'
          }
        ];
        setLogs(sampleLogs);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLog = async (e) => {
    e.preventDefault();
    if (!form.term.trim() || !form.meaning.trim()) return;
    playSoftClick();

    const payload = {
      term: form.term.trim(),
      meaning: form.meaning.trim(),
      exampleOrNote: form.exampleOrNote.trim(),
      category: form.category,
      reviewedMorning: false,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await api.post('/error-logs', payload);
      const updated = [res.data, ...logs];
      setLogs(updated);
      localStorage.setItem('n2_error_logs', JSON.stringify(updated));
    } catch {
      const localItem = { ...payload, _id: `local_err_${Date.now()}` };
      const updated = [localItem, ...logs];
      setLogs(updated);
      localStorage.setItem('n2_error_logs', JSON.stringify(updated));
    }

    setForm({ term: '', meaning: '', exampleOrNote: '', category: 'vocab' });
    setShowAddForm(false);
  };

  const handleToggleReview = async (log) => {
    playSoftClick();
    const nextStatus = !log.reviewedMorning;
    const updated = logs.map(l => l._id === log._id ? { ...l, reviewedMorning: nextStatus } : l);
    setLogs(updated);
    localStorage.setItem('n2_error_logs', JSON.stringify(updated));

    if (nextStatus) {
      playSuccessChord();
    }

    try {
      if (!String(log._id).startsWith('local_') && !String(log._id).startsWith('sample_')) {
        await api.patch(`/error-logs/${log._id}/toggle-review`, { reviewedMorning: nextStatus });
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mục ghi chú này?')) return;
    playSoftClick();

    const updated = logs.filter(l => l._id !== id);
    setLogs(updated);
    localStorage.setItem('n2_error_logs', JSON.stringify(updated));

    try {
      if (!String(id).startsWith('local_') && !String(id).startsWith('sample_')) {
        await api.delete(`/error-logs/${id}`);
      }
    } catch {
      // ignore
    }
  };

  // Filter & Search
  const filteredLogs = logs.filter(item => {
    if (filterCat !== 'all' && item.category !== filterCat) return false;
    if (reviewFilter === 'need_review' && item.reviewedMorning) return false;
    if (reviewFilter === 'reviewed' && !item.reviewedMorning) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTerm = item.term?.toLowerCase().includes(q);
      const matchMeaning = item.meaning?.toLowerCase().includes(q);
      const matchNote = item.exampleOrNote?.toLowerCase().includes(q);
      if (!matchTerm && !matchMeaning && !matchNote) return false;
    }

    return true;
  });

  const pendingReviewCount = logs.filter(l => !l.reviewedMorning).length;
  const activeCard = filteredLogs[Math.min(cardIndex, Math.max(0, filteredLogs.length - 1))];

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors animate-slide-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                  Sổ Tay Lỗi Sai & Flashcard
                </h3>
                {pendingReviewCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    {pendingReviewCount} cần ôn Pomo 1
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Ghi nhanh từ mới & bẫy đề thi buổi tối (Pomo 8) để quét Flashcard vào 07:00 sáng hôm sau (Pomo 1).
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher & Add Button */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                playSoftClick();
                setDisplayMode('list');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                displayMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Danh sách</span>
            </button>
            <button
              onClick={() => {
                playSoftClick();
                setDisplayMode('flashcard');
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                displayMode === 'flashcard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Lật Flashcard</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Đóng' : 'Ghi lỗi mới'}</span>
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleCreateLog} className="my-6 p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Thuật ngữ / Kanji / Mẫu ngữ pháp làm sai
              </label>
              <input
                type="text"
                value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                placeholder="Ví dụ: 〜を皮切りに, 脆弱 (ぜいじゃく)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-jp"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Phân loại
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="vocab">Từ vựng (Goi)</option>
                <option value="kanji">Chữ Hán (Kanji)</option>
                <option value="grammar">Ngữ pháp (Bunpou)</option>
                <option value="reading">Đọc hiểu (Dokkai)</option>
                <option value="listening">Nghe hiểu (Choukai)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Nghĩa đúng & Giải thích
            </label>
            <input
              type="text"
              value={form.meaning}
              onChange={(e) => setForm({ ...form, meaning: e.target.value })}
              placeholder="Giải thích chi tiết lý do và cách dịch đúng..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Ngữ cảnh câu sai / Bẫy đề thi (Không bắt buộc)
            </label>
            <textarea
              value={form.exampleOrNote}
              onChange={(e) => setForm({ ...form, exampleOrNote: e.target.value })}
              placeholder="Ghi chú ngữ cảnh bẫy hoặc câu ví dụ làm sai trong đề..."
              rows="2"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
            >
              Lưu vào sổ tay
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 my-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm từ vựng, Kanji, mẫu ngữ pháp, bẫy..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800 border border-transparent focus:border-indigo-400 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <button
            onClick={() => setReviewFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reviewFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Tất cả ({logs.length})
          </button>
          <button
            onClick={() => setReviewFilter('need_review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reviewFilter === 'need_review'
                ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            🌅 Cần ôn ({pendingReviewCount})
          </button>
          <button
            onClick={() => setReviewFilter('reviewed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reviewFilter === 'reviewed'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            ✅ Đã thuộc
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6 overflow-x-auto pb-1">
        {ERROR_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setFilterCat(cat.id);
              setCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
              filterCat === cat.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FLASHCARD REVIEW MODE */}
      {displayMode === 'flashcard' ? (
        filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
            Không có thẻ Flashcard nào trong bộ lọc này.
          </div>
        ) : activeCard ? (
          <div className="max-w-xl mx-auto my-4 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-2">
              <span>Thẻ {Math.min(cardIndex + 1, filteredLogs.length)} / {filteredLogs.length}</span>
              <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Nhấn vào thẻ để lật xem nghĩa
              </span>
            </div>

            {/* Interactive Flashcard */}
            <div
              onClick={() => {
                playSoftClick();
                setIsFlipped(!isFlipped);
              }}
              className={`cursor-pointer min-h-[260px] rounded-3xl p-8 border-2 transition-all duration-300 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden ${
                isFlipped
                  ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border-indigo-500/40'
                  : 'bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 border-indigo-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              <span className="absolute top-4 left-5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-400/30">
                {activeCard.category}
              </span>

              <span className={`absolute top-4 right-5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeCard.reviewedMorning
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
              }`}>
                {activeCard.reviewedMorning ? 'Đã thuộc ✅' : 'Cần ôn Pomo 1 ⚡'}
              </span>

              {!isFlipped ? (
                <div className="space-y-4 my-4">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-jp leading-snug">
                    {activeCard.term}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-full">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chạm để xem giải thích & bẫy đề thi</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 my-2 max-w-md animate-slide-up">
                  <div className="text-sm font-bold text-indigo-300 font-jp">
                    {activeCard.term}
                  </div>
                  <div className="text-lg sm:text-xl font-black text-white leading-relaxed">
                    👉 {activeCard.meaning}
                  </div>
                  {activeCard.exampleOrNote && (
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-xs text-amber-200 italic">
                      💡 {activeCard.exampleOrNote}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Flashcard Controls */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  playSoftClick();
                  setCardIndex((prev) => (prev - 1 + filteredLogs.length) % filteredLogs.length);
                  setIsFlipped(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Thẻ trước</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleReview(activeCard)}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all ${
                  activeCard.reviewedMorning
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{activeCard.reviewedMorning ? 'Đánh dấu chưa thuộc' : 'Đã thuộc mục này!'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSoftClick();
                  setCardIndex((prev) => (prev + 1) % filteredLogs.length);
                  setIsFlipped(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <span>Thẻ tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null
      ) : (
        /* LIST VIEW MODE */
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-slate-400 animate-pulse">Đang nạp sổ tay lỗi sai...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
              Không tìm thấy mục lỗi sai nào phù hợp.
            </div>
          ) : (
            filteredLogs.map(log => {
              const isReviewed = !!log.reviewedMorning;
              const catInfo = ERROR_CATEGORIES.find(c => c.id === log.category) || ERROR_CATEGORIES[1];

              return (
                <div
                  key={log._id}
                  className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3.5 ${
                    isReviewed
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                      : 'bg-white dark:bg-slate-800/90 border-amber-200/90 dark:border-amber-900/50 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  {/* Checkbox toggle review status */}
                  <button
                    onClick={() => handleToggleReview(log)}
                    className={`mt-1 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isReviewed
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm'
                        : 'border-2 border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                    }`}
                    title={isReviewed ? 'Đã ôn vào Pomo 1 sáng' : 'Chưa ôn - Click để đánh dấu đã ôn'}
                  >
                    {isReviewed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </button>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white font-jp">
                        {log.term}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border ${catInfo.badge}`}>
                        {catInfo.label}
                      </span>

                      {isReviewed ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <Sun className="w-3 h-3" /> Đã ôn sáng
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                          ⚡ Cần ôn Pomo 1
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-slate-400 ml-auto">
                        {log.date}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">
                      👉 {log.meaning}
                    </p>

                    {log.exampleOrNote && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        💡 {log.exampleOrNote}
                      </p>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteLog(log._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex-shrink-0"
                    title="Xóa mục này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
