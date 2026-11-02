import React, { useState } from 'react';
import { Download, Upload, X, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { exportAppData, importAppData } from '../lib/storage';

export default function BackupModal({ isOpen, onClose }) {
  const [jsonText, setJsonText] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportAppData();
    setStatusMsg({ type: 'success', text: 'Đã xuất file JSON thành công!' });
  };

  const handleImport = () => {
    if (!jsonText.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng dán nội dung JSON vào ô bên dưới' });
      return;
    }
    const ok = importAppData(jsonText);
    if (ok) {
      setStatusMsg({ type: 'success', text: 'Đã nhập dữ liệu thành công! Trang sẽ tải lại trong giây lát...' });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      setStatusMsg({ type: 'error', text: 'Dữ liệu JSON không hợp lệ' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-slide-up">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
              Sao Lưu & Khôi Phục Dữ Liệu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Xuất hoặc nhập dữ liệu Pomodoro, điểm thi thử và sổ tay lỗi sai dưới dạng JSON
            </p>
          </div>
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300' 
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300'
          }`}>
            {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Export Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Xuất file JSON</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Tải về máy tính hoặc điện thoại</div>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải backup</span>
            </button>
          </div>

          {/* Import Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Khôi phục từ chuỗi JSON
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Dán mã JSON đã sao lưu vào đây..."
              rows="4"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleImport}
              className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Khôi phục dữ liệu ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

