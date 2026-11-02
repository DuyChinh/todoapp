import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, TrendingUp, Plus, Trash2, AlertOctagon, Sparkles } from 'lucide-react';
import api from '../lib/api';
import { playSuccessChord, playSoftClick } from '../lib/audio';

export default function MockExamTracker() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({
    testName: 'Đề thi thử 01 (Thứ 7 tuần 1)',
    date: new Date().toISOString().split('T')[0],
    vocabGrammarScore: 35,
    readingScore: 32,
    listeningScore: 38,
    notes: 'Chú ý bẫy Mondai 3 nghe hiểu, luyện shadowing thêm.'
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mock-exams');
      setExams(res.data);
    } catch {
      const cached = localStorage.getItem('n2_mock_exams');
      if (cached) {
        setExams(JSON.parse(cached));
      } else {
        const initial = [
          {
            _id: 'sample_1',
            testName: 'Đề thi thử N2 - Đề 1 (Chuẩn bị Sprint)',
            date: '2026-11-01',
            vocabGrammarScore: 32,
            readingScore: 28,
            listeningScore: 34,
            totalScore: 94,
            isFailedSection: false,
            passed: true,
            notes: 'Môn đọc đoạn dài còn hơi chậm, cần phân bổ thời gian tốt hơn.'
          }
        ];
        setExams(initial);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    playSoftClick();

    const vg = Number(form.vocabGrammarScore) || 0;
    const rd = Number(form.readingScore) || 0;
    const ls = Number(form.listeningScore) || 0;
    const total = vg + rd + ls;
    const isFailedSection = vg < 19 || rd < 19 || ls < 19;
    const passed = !isFailedSection && total >= 90;

    const payload = {
      testName: form.testName.trim(),
      date: form.date,
      vocabGrammarScore: vg,
      readingScore: rd,
      listeningScore: ls,
      totalScore: total,
      isFailedSection,
      passed,
      notes: form.notes.trim()
    };

    try {
      const res = await api.post('/mock-exams', payload);
      const updated = [res.data, ...exams];
      setExams(updated);
      localStorage.setItem('n2_mock_exams', JSON.stringify(updated));
      if (passed) playSuccessChord();
    } catch {
      const localExam = { ...payload, _id: `local_exam_${Date.now()}` };
      const updated = [localExam, ...exams];
      setExams(updated);
      localStorage.setItem('n2_mock_exams', JSON.stringify(updated));
      if (passed) playSuccessChord();
    }

    setShowAddForm(false);
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa kết quả bài thi này?')) return;
    playSoftClick();

    const updated = exams.filter(e => e._id !== id);
    setExams(updated);
    localStorage.setItem('n2_mock_exams', JSON.stringify(updated));

    try {
      if (!String(id).startsWith('local_') && !String(id).startsWith('sample_')) {
        await api.delete(`/mock-exams/${id}`);
      }
    } catch {
      // ignore
    }
  };

  const currentTotal = Number(form.vocabGrammarScore) + Number(form.readingScore) + Number(form.listeningScore);
  const currentHasFailedSection = Number(form.vocabGrammarScore) < 19 || Number(form.readingScore) < 19 || Number(form.listeningScore) < 19;
  const currentWillPass = !currentHasFailedSection && currentTotal >= 90;

  const bestScore = exams.length > 0 ? Math.max(...exams.map(e => e.totalScore || 0)) : 0;
  const passCount = exams.filter(e => e.passed).length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pass rate card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Đã thi thử</span>
            <Trophy className="w-5 h-5 text-amber-300" />
          </div>
          <div className="text-3xl font-black">{exams.length} <span className="text-base font-medium opacity-80">Đề thi</span></div>
          <div className="text-xs text-indigo-200 mt-1">
            Đạt chuẩn đỗ: <strong>{passCount}/{exams.length} đề ({exams.length > 0 ? Math.round((passCount/exams.length)*100) : 0}%)</strong>
          </div>
        </div>

        {/* Highest Score */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Điểm cao nhất</span>
            <TrendingUp className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="text-3xl font-black">{bestScore} <span className="text-base font-medium opacity-80">/ 180</span></div>
          <div className="text-xs text-emerald-100 mt-1">
            Chuẩn đỗ N2: <span className="font-bold underline">≥ 90/180 & không môn &lt; 19</span>
          </div>
        </div>

        {/* Target Benchmark */}
        <div className="bg-gradient-to-br from-rose-600 to-pink-600 rounded-3xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-100 uppercase tracking-wider">Mục tiêu Sprint</span>
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div className="text-3xl font-black">120+ <span className="text-base font-medium opacity-80">An toàn</span></div>
          <div className="text-xs text-rose-100 mt-1">
            Quyết tâm không điểm liệt bất kỳ phần nào
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Bảng Theo Dõi Điểm Thi Thử JLPT N2
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Nhập điểm sau mỗi buổi thi thử Thứ 7 & Chủ Nhật để theo dõi tiến độ bứt phá.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Đóng form' : '+ Nhập điểm đề mới'}</span>
          </button>
        </div>

        {/* Input Form */}
        {showAddForm && (
          <form onSubmit={handleCreateExam} className="my-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-5 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Tên đề thi
                </label>
                <input
                  type="text"
                  value={form.testName}
                  onChange={(e) => setForm({ ...form, testName: e.target.value })}
                  placeholder="Ví dụ: Đề thi thử 01 - Thứ 7..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Ngày làm bài
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Score 3 sections */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    1. Ngôn ngữ & Bunpou (0-60)
                  </label>
                  {Number(form.vocabGrammarScore) < 19 && (
                    <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                      Liệt (&lt;19)
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={form.vocabGrammarScore}
                  onChange={(e) => setForm({ ...form, vocabGrammarScore: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-lg font-black text-indigo-600 dark:text-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    2. Đọc hiểu Dokkai (0-60)
                  </label>
                  {Number(form.readingScore) < 19 && (
                    <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                      Liệt (&lt;19)
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={form.readingScore}
                  onChange={(e) => setForm({ ...form, readingScore: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-lg font-black text-emerald-600 dark:text-emerald-400 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    3. Nghe hiểu Choukai (0-60)
                  </label>
                  {Number(form.listeningScore) < 19 && (
                    <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                      Liệt (&lt;19)
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={form.listeningScore}
                  onChange={(e) => setForm({ ...form, listeningScore: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-lg font-black text-amber-600 dark:text-amber-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Live Calculation preview banner */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
              currentWillPass
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
            }`}>
              <div className="flex items-center gap-2.5">
                {currentWillPass ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0" />
                )}
                <div className="text-xs sm:text-sm font-bold">
                  {currentWillPass ? (
                    <span>🎉 ĐẠT CHUẨN ĐỖ N2 (Tổng điểm ≥ 90 và không bị điểm liệt môn nào)</span>
                  ) : currentHasFailedSection ? (
                    <span>⚠️ CẢNH BÁO: Bị điểm liệt (&lt; 19 điểm) ở ít nhất một môn! Không đạt chuẩn JLPT.</span>
                  ) : (
                    <span>⚠️ CHƯA ĐẠT: Tổng điểm &lt; 90/180. Cần bứt phá thêm ở các tuần tiếp theo!</span>
                  )}
                </div>
              </div>

              <div className="text-xl font-black">
                Tổng: {currentTotal} / 180
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Ghi chú đề thi / Bẫy làm sai
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Rút kinh nghiệm: Mondai nào mất nhiều điểm nhất, bẫy từ vựng..."
                rows="2"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
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
                Lưu kết quả thi thử
              </button>
            </div>
          </form>
        )}

        {/* Visual Progress Bar Chart of Past Exams */}
        {exams.length > 0 && (
          <div className="my-6 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Biểu Đồ Xu Hướng Điểm Qua Các Đề (Chuẩn Đỗ: 90 / 180)
            </h4>

            <div className="space-y-3">
              {exams.map((exam, idx) => {
                const isPassed = exam.passed;

                return (
                  <div key={exam._id || idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-md">
                        {exam.testName} <span className="text-slate-400 font-normal">({exam.date})</span>
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                          isPassed 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}>
                          {isPassed ? 'ĐẠT (合格)' : 'CHƯA ĐẠT'}
                        </span>
                        <span className="text-slate-800 dark:text-slate-100 font-black">{exam.totalScore}/180</span>
                      </div>
                    </div>

                    {/* Stacked bar: Ngôn ngữ, Đọc, Nghe */}
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex relative">
                      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-rose-500 z-10" title="Vạch chuẩn đỗ 90 điểm" />

                      <div 
                        style={{ width: `${(exam.vocabGrammarScore / 180) * 100}%` }} 
                        className="h-full bg-indigo-500" 
                        title={`Ngôn ngữ: ${exam.vocabGrammarScore}/60`}
                      />
                      <div 
                        style={{ width: `${(exam.readingScore / 180) * 100}%` }} 
                        className="h-full bg-emerald-500" 
                        title={`Đọc hiểu: ${exam.readingScore}/60`}
                      />
                      <div 
                        style={{ width: `${(exam.listeningScore / 180) * 100}%` }} 
                        className="h-full bg-amber-500" 
                        title={`Nghe hiểu: ${exam.listeningScore}/60`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Ngôn ngữ & Ngữ pháp
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Đọc hiểu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Nghe hiểu
              </span>
              <span className="flex items-center gap-1.5 ml-auto text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Vạch chuẩn đỗ (50% = 90 điểm)
              </span>
            </div>
          </div>
        )}

        {/* Exams Table / Cards */}
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Lịch sử đề thi thử ({exams.length})
          </h4>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Đang tải lịch sử điểm thi...</div>
          ) : exams.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              Chưa có kết quả thi thử nào. Hãy làm bài thi thử Thứ 7 & Chủ Nhật rồi nhập điểm tại đây nhé!
            </div>
          ) : (
            exams.map((exam) => (
              <div
                key={exam._id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                      {exam.testName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {exam.date}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      exam.passed 
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}>
                      {exam.passed ? 'ĐẠT CHUẨN ĐỖ 🎯' : 'CHƯA ĐẠT ⚠️'}
                    </span>
                  </div>

                  {/* Section Scores */}
                  <div className="grid grid-cols-3 gap-2 my-2 text-xs">
                    <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Ngôn ngữ</span>
                      <span className={`font-black text-sm ${exam.vocabGrammarScore < 19 ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {exam.vocabGrammarScore}/60 {exam.vocabGrammarScore < 19 && '(Liệt)'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Đọc hiểu</span>
                      <span className={`font-black text-sm ${exam.readingScore < 19 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {exam.readingScore}/60 {exam.readingScore < 19 && '(Liệt)'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Nghe hiểu</span>
                      <span className={`font-black text-sm ${exam.listeningScore < 19 ? 'text-rose-600' : 'text-amber-600 dark:text-amber-400'}`}>
                        {exam.listeningScore}/60 {exam.listeningScore < 19 && '(Liệt)'}
                      </span>
                    </div>
                  </div>

                  {exam.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1">
                      "{exam.notes}"
                    </p>
                  )}
                </div>

                <div className="flex md:flex-col items-center justify-between md:items-end gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng điểm</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                      {exam.totalScore} <span className="text-xs text-slate-400">/ 180</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteExam(exam._id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Xóa đề này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
