# phím. — Hiểu rồi chơi

Website học piano bằng tiếng Việt và tiếng Anh. Imported from the complete cloud website (version 6).

## Nội dung

- 12 bài học với hình khuông nhạc, câu hỏi giải thích và bài tập bàn phím.
- Bàn phím tương tác, chọn 1–3 quãng tám, hợp âm, gam và metronome.
- Happy Birthday gồm 4 đoạn để nghe và luyện từng nốt.
- Từ điển âm nhạc, chọn ngôn ngữ và hai biểu mẫu riêng để báo lỗi / góp ý cải tiến.

## Chạy trên máy

Không cần cài thư viện hoặc build. Trong thư mục dự án, chạy:

```sh
python3 -m http.server 8000
```

Mở http://localhost:8000. Nhấn vào trang để trình duyệt cho phép phát âm thanh.

## GitHub Pages

Sau khi merge pull request, mở repository Settings → Pages. Chọn Deploy from a branch, branch `main`, thư mục `/ (root)` và Save. GitHub sẽ hiển thị địa chỉ website khi triển khai hoàn tất.

## Chỉnh sửa

- `index.html`: khung trang và điều hướng.
- `styles.css`: giao diện và hiển thị trên điện thoại.
- `app.js`: tương tác, âm thanh, hình khuông nhạc và tiến độ.
- `curriculum.js`: nội dung bài học song ngữ và bài nhạc.
- `locales.js`: bản dịch giao diện và từ điển.
- `favicon.svg`: biểu tượng trang.

Tiến độ, sao, ngôn ngữ và cài đặt bàn phím được lưu trong localStorage của trình duyệt (`phim-piano-v1`); chưa có tài khoản hoặc đồng bộ giữa các thiết bị. Tiến độ trên tên miền cloud không tự chuyển sang tên miền GitHub Pages.

Âm thanh được tổng hợp bằng Web Audio API. Phần luyện bài nhạc kiểm tra thứ tự cao độ, chưa đánh giá nhịp hoặc kỹ thuật. Phản hồi mở Google Forms do chủ website cung cấp.

## Nguồn import

Bản cloud phiên bản 6, source commit `1e03a8d84a8d8e1806daa03f7b48c08c92bf1e92`. Sáu file website được giữ nguyên nội dung và chuyển từ `dist/` ra thư mục gốc để phục vụ trực tiếp trên GitHub Pages. Các lần sửa trong GitHub và Sites cần được đồng bộ chủ động.
