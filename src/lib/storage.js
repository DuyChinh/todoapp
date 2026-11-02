// Storage & offline sync helper with initial JLPT N2 data fallback

export const DEFAULT_TEMPLATES = [
  {
    dayOfWeek: 1,
    dayLabel: "Thứ 2",
    items: [
      { time: "07:00", content: "Pomo 1: Quét Flashcard/Anki từ vựng & Kanji đã lưu từ tối hôm trước", pomoSession: "Pomo 1", durationMinutes: 25, category: "vocab", isBreak: false },
      { time: "07:25", content: "Nghỉ: Nghe 1 bài nhạc khởi động ngày mới 🎵", pomoSession: "Nghỉ ngắn", durationMinutes: 5, category: "break", isBreak: true },
      { time: "07:30", content: "Pomo 2: Làm nhanh 25–30 câu trắc nghiệm Từ vựng/Kanji (Moji-Goi) kích hoạt phản xạ", pomoSession: "Pomo 2", durationMinutes: 25, category: "moji-goi", isBreak: false },
      { time: "07:55", content: "Nghỉ: Đọc vài trang sách hoặc chuẩn bị đi làm/đi học 📚", pomoSession: "Nghỉ ngắn", durationMinutes: 5, category: "break", isBreak: true },
      { time: "20:00", content: "Pomo 3: Ôn 5–7 mẫu Ngữ pháp N2 + làm bài tập Mondai 7, 8 (Ngữ pháp câu & dấu sao)", pomoSession: "Pomo 3", durationMinutes: 25, category: "bunpou", isBreak: false },
      { time: "20:25", content: "Nghỉ: Nghe 1 bài nhạc không lời hoặc J-Pop thư giãn 🎧", pomoSession: "Nghỉ ngắn", durationMinutes: 5, category: "break", isBreak: true },
      { time: "20:30", content: "Pomo 4: Luyện Đọc hiểu (Dokkai): 3 bài đoạn ngắn (Tankibun) + 1 bài tìm kiếm thông tin", pomoSession: "Pomo 4", durationMinutes: 25, category: "dokkai", isBreak: false },
      { time: "20:55", content: "Nghỉ: Đọc 2–3 trang sách nhẹ nhàng, thư giãn mắt 🌱", pomoSession: "Nghỉ ngắn", durationMinutes: 5, category: "break", isBreak: true },
      { time: "21:00", content: "Pomo 5: Luyện Đọc hiểu: 1 bài đoạn trung (Chuubun) hoặc đoạn dài (Choubun) + phân tích kỹ câu sai", pomoSession: "Pomo 5", durationMinutes: 25, category: "dokkai", isBreak: false },
      { time: "21:25", content: "Nghỉ: Nghe 1 bài nhạc, đứng dậy vươn vai thư giãn gân cốt 🧘", pomoSession: "Nghỉ ngắn", durationMinutes: 5, category: "break", isBreak: true },
      { time: "21:30", content: "Pomo 6: Luyện Nghe hiểu (Choukai): Tập trung Mondai 1, 2 (nghe nắm ý chính và chi tiết)", pomoSession: "Pomo 6", durationMinutes: 25, category: "choukai", isBreak: false },
      { time: "21:55", content: "Nghỉ giải lao dài (15 phút): Đọc sách, uống nước, cho não bộ nghỉ sâu sau 4 phiên tối ☕", pomoSession: "Nghỉ dài 15p", durationMinutes: 15, category: "break", isBreak: true },
      { time: "22:10", content: "Pomo 7: Luyện Nghe hiểu: Mondai 3, 4 (phản xạ nhanh) + đọc script và nhại lại (shadowing)", pomoSession: "Pomo 7", durationMinutes: 25, category: "choukai", isBreak: false },
      { time: "22:35", content: "Nghỉ: Nghe 1 bài nhạc Acoustic nhẹ nhàng 🎶", pomoSession: "Nghỉ ngắn", durationMinutes: 5, category: "break", isBreak: true },
      { time: "22:40", content: "Pomo 8: Tổng hợp toàn bộ từ mới, cấu trúc sai trong buổi tối vào sổ/Anki để sáng mai ôn ở Pomo 1", pomoSession: "Pomo 8", durationMinutes: 25, category: "review", isBreak: false }
    ]
  },
  {
    dayOfWeek: 6,
    dayLabel: "Thứ 7 (Thi thử Đề 1 + Chữa đề)",
    items: [
      { time: "13:00", content: "Thi thử Đề 1: Bấm giờ làm bài Kiến thức ngôn ngữ + Đọc hiểu (105 phút) chuẩn áp lực thi", pomoSession: "Thi thử 105p", durationMinutes: 105, category: "mock_exam", isBreak: false },
      { time: "14:45", content: "Nghỉ dài (15 phút): Nghe 2–3 bài nhạc, đi lại thư giãn đầu óc 🌿", pomoSession: "Nghỉ dài 15p", durationMinutes: 15, category: "break", isBreak: true },
      { time: "15:00", content: "Thi thử Đề 1: Bấm giờ làm bài Nghe hiểu (50 phút) tập trung cao độ", pomoSession: "Thi thử 50p", durationMinutes: 50, category: "mock_exam", isBreak: false },
      { time: "15:50", content: "Nghỉ ngơi & Chấm điểm (15 phút): Chấm điểm tổng quát cả 3 phần 📝", pomoSession: "Chấm điểm 15p", durationMinutes: 15, category: "break", isBreak: true },
      { time: "16:05", content: "Pomo 1: Chữa chi tiết phần Từ vựng – Chữ Hán trong đề", pomoSession: "Pomo 1", durationMinutes: 25, category: "moji-goi", isBreak: false },
      { time: "16:35", content: "Pomo 2: Chữa chi tiết phần Ngữ pháp trong đề", pomoSession: "Pomo 2", durationMinutes: 25, category: "bunpou", isBreak: false },
      { time: "17:05", content: "Pomo 3: Chữa Đọc hiểu (Đoạn ngắn + Đoạn trung)", pomoSession: "Pomo 3", durationMinutes: 25, category: "dokkai", isBreak: false },
      { time: "17:35", content: "Pomo 4: Chữa Đọc hiểu (Đoạn dài + So sánh A-B)", pomoSession: "Pomo 4", durationMinutes: 25, category: "dokkai", isBreak: false },
      { time: "18:05", content: "Pomo 5: Chữa Nghe hiểu (Mondai 1 & Mondai 2)", pomoSession: "Pomo 5", durationMinutes: 25, category: "choukai", isBreak: false },
      { time: "18:30", content: "Nghỉ ăn tối, tắm rửa, thư giãn hoàn toàn (90 phút) 🍱", pomoSession: "Nghỉ tối", durationMinutes: 90, category: "break", isBreak: true },
      { time: "20:00", content: "Pomo 6: Chữa Nghe hiểu (Mondai 3, 4, 5) cùng script", pomoSession: "Pomo 6", durationMinutes: 25, category: "choukai", isBreak: false },
      { time: "20:30", content: "Pomo 7: Shadowing lại các đoạn hội thoại khó trong đề", pomoSession: "Pomo 7", durationMinutes: 25, category: "choukai", isBreak: false },
      { time: "21:00", content: "Pomo 8: Rút trích toàn bộ từ vựng/ngữ pháp mới từ đề Thứ 7 vào Flashcard", pomoSession: "Pomo 8", durationMinutes: 25, category: "review", isBreak: false },
      { time: "21:25", content: "Nghỉ dài 15 phút: Đọc sách hoặc nghe nhạc nhẹ 🎵", pomoSession: "Nghỉ dài 15p", durationMinutes: 15, category: "break", isBreak: true },
      { time: "21:40", content: "Pomo 9 & 10: Luyện chuyên sâu dạng bài bị mất nhiều điểm nhất trong đề chiều", pomoSession: "Pomo 9 & 10", durationMinutes: 55, category: "review", isBreak: false },
      { time: "22:40", content: "Pomo 11: Ôn lại Flashcard trong ngày", pomoSession: "Pomo 11", durationMinutes: 25, category: "flashcard", isBreak: false }
    ]
  },
  {
    dayOfWeek: 0,
    dayLabel: "Chủ Nhật (Thi thử Đề 2 + Lấp lỗ hổng)",
    items: [
      { time: "07:00", content: "Pomo 1 & 2: Tổng ôn toàn bộ từ vựng/Kanji đã tích lũy từ Thứ 2 đến Thứ 7", pomoSession: "Pomo 1 & 2", durationMinutes: 55, category: "flashcard", isBreak: false },
      { time: "08:00", content: "Ăn sáng, nghỉ ngơi nạp năng lượng (30 phút) 🍳", pomoSession: "Nghỉ sáng", durationMinutes: 30, category: "break", isBreak: true },
      { time: "08:30", content: "Thi thử Đề 2: Làm bài Từ vựng, Ngữ pháp, Đọc hiểu (105 phút liền mạch)", pomoSession: "Thi thử 105p", durationMinutes: 105, category: "mock_exam", isBreak: false },
      { time: "10:15", content: "Nghỉ giải lao 15 phút, nghe nhạc thư thái ☕", pomoSession: "Nghỉ dài 15p", durationMinutes: 15, category: "break", isBreak: true },
      { time: "10:30", content: "Thi thử Đề 2: Làm bài Nghe hiểu (50 phút liền mạch)", pomoSession: "Thi thử 50p", durationMinutes: 50, category: "mock_exam", isBreak: false },
      { time: "11:20", content: "Chấm điểm nhanh, ăn trưa, ngủ trưa phục hồi thể lực 🍜", pomoSession: "Nghỉ trưa", durationMinutes: 130, category: "break", isBreak: true },
      { time: "13:30", content: "Pomo 1 & 2: Chữa kỹ Từ vựng & Ngữ pháp Đề 2", pomoSession: "Pomo 1 & 2", durationMinutes: 55, category: "moji-goi", isBreak: false },
      { time: "14:30", content: "Pomo 3 & 4: Chữa kỹ Đọc hiểu Đề 2", pomoSession: "Pomo 3 & 4", durationMinutes: 55, category: "dokkai", isBreak: false },
      { time: "15:25", content: "Nghỉ dài 15 phút: Uống trà, thư giãn mắt 🍵", pomoSession: "Nghỉ dài 15p", durationMinutes: 15, category: "break", isBreak: true },
      { time: "15:40", content: "Pomo 5, 6 & 7: Chữa kỹ Nghe hiểu Đề 2 + nghe lại các câu bẫy", pomoSession: "Pomo 5, 6 & 7", durationMinutes: 85, category: "choukai", isBreak: false },
      { time: "17:10", content: "Pomo 8: Thống kê bảng điểm 2 đề cuối tuần, so sánh tiến độ", pomoSession: "Pomo 8", durationMinutes: 25, category: "review", isBreak: false },
      { time: "17:35", content: "Nghỉ ngơi, ăn tối, vận động nhẹ nhàng 🏃", pomoSession: "Nghỉ tối", durationMinutes: 145, category: "break", isBreak: true },
      { time: "20:00", content: "Pomo 9 & 10: Tổng ôn các nhóm Ngữ pháp N2 dễ nhầm lẫn (tương đồng ý nghĩa)", pomoSession: "Pomo 9 & 10", durationMinutes: 55, category: "bunpou", isBreak: false },
      { time: "21:00", content: "Pomo 11 & 12: Tổng ôn Từ vựng theo chủ đề / Khiêm nhường ngữ - Tôn kính ngữ hay gặp trong Nghe", pomoSession: "Pomo 11 & 12", durationMinutes: 55, category: "vocab", isBreak: false },
      { time: "22:00", content: "Pomo 13: Đọc lướt lại toàn bộ sổ tay lỗi sai của cả tuần", pomoSession: "Pomo 13", durationMinutes: 25, category: "review", isBreak: false },
      { time: "22:30", content: "Pomo 14: Chuẩn bị tài liệu, đề cương cho Thứ 2 tuần mới và đi ngủ đúng giờ 💤", pomoSession: "Pomo 14", durationMinutes: 25, category: "review", isBreak: false }
    ]
  }
];

// Fallback generator for a specific date if offline
export function generateLocalTasksForDate(dateStr, dayOfWeek) {
  let template = DEFAULT_TEMPLATES.find(t => t.dayOfWeek === dayOfWeek);
  if (!template) {
    // If Tuesday-Friday, use weekday template (dayOfWeek 1)
    template = DEFAULT_TEMPLATES[0];
  }

  return template.items.map((item, idx) => ({
    _id: `local_${dateStr}_${idx}_${Date.now()}`,
    date: dateStr,
    time: item.time,
    content: item.content,
    pomoSession: item.pomoSession,
    durationMinutes: item.durationMinutes,
    category: item.category,
    isBreak: item.isBreak,
    completed: false
  }));
}

// Export all app data as JSON
export function exportAppData() {
  const data = {
    exportedAt: new Date().toISOString(),
    theme: localStorage.getItem('theme'),
    soundEnabled: localStorage.getItem('sound_enabled'),
    tasksCache: localStorage.getItem('n2_tasks_cache'),
    mockExams: localStorage.getItem('n2_mock_exams'),
    errorLogs: localStorage.getItem('n2_error_logs'),
    pomoState: localStorage.getItem('n2_pomo_state')
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `JLPT_N2_Sprint_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import app data from JSON
export function importAppData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.theme) localStorage.setItem('theme', data.theme);
    if (data.soundEnabled) localStorage.setItem('sound_enabled', data.soundEnabled);
    if (data.tasksCache) localStorage.setItem('n2_tasks_cache', data.tasksCache);
    if (data.mockExams) localStorage.setItem('n2_mock_exams', data.mockExams);
    if (data.errorLogs) localStorage.setItem('n2_error_logs', data.errorLogs);
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}

