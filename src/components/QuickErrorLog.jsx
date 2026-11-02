import React, { useState, useEffect } from 'react';
import { 
  BookMarked, Plus, Search, CheckCircle2, Trash2, Sun
} from 'lucide-react';
import api from '../lib/api';
import { playSuccessChord, playSoftClick } from '../lib/audio';

const ERROR_CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'vocab', label: 'Từ vựng (Goi)' },
  { id: 'kanji', label: 'Chữ Hán (Kanji)' },
  { id: 'grammar', label: 'Ngữ pháp (Bunpou)' },
  { id: 'reading', label: 'Đọc hiểu (Dokkai)' },
  { id: 'listening', label: 'Nghe hiểu (Choukai)' }
];

export default function QuickErrorLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'need_review', 'reviewed'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

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

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Sổ Tay Lỗi Sai & Từ Mới (弱点克服ノート)
            </h3>
            {pendingReviewCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                {pendingReviewCount} mục cần ôn Pomo 1
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Ghi nhanh từ vựng, ngữ pháp, bẫy đọc/nghe làm sai trong lúc học tối để quét lại ở Pomo 1 sáng hôm sau.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Đóng' : '+ Ghi chú lỗi mới'}</span>
        </button>
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm từ vựng, ngữ pháp, bẫy..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-400 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
          />
        </div>

        {/* Review status filters */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setReviewFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reviewFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setReviewFilter('need_review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reviewFilter === 'need_review'
                ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🌅 Cần ôn Pomo 1
          </button>
          <button
            onClick={() => setReviewFilter('reviewed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reviewFilter === 'reviewed'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ✅ Đã ôn
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5 overflow-x-auto pb-1">
        {ERROR_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              filterCat === cat.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error Logs List */}
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

            return (
              <div
                key={log._id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-start justify-between gap-3 ${
                  isReviewed
                    ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-800 border-amber-200/80 dark:border-amber-900/50 shadow-sm'
                }`}
              >
                {/* Checkbox toggle review status */}
                <button
                  onClick={() => handleToggleReview(log)}
                  className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    isReviewed
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40'
                  }`}
                  title={isReviewed ? 'Đã ôn vào Pomo 1 sáng' : 'Chưa ôn - Click để đánh dấu đã ôn'}
                >
                  {isReviewed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-black text-base sm:text-lg text-slate-800 dark:text-slate-100">
                      {log.term}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {log.category}
                    </span>

                    {isReviewed ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <Sun className="w-3 h-3" /> Đã ôn sáng
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        ⚡ Cần ôn Pomo 1
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 ml-auto">
                      {log.date}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    👉 {log.meaning}
                  </p>

                  {log.exampleOrNote && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      💡 {log.exampleOrNote}
                    </p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteLog(log._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex-shrink-0"
                  title="Xóa mục này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
