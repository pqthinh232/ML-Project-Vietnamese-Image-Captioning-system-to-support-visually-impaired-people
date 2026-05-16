# Blind Assistant App

Ứng dụng web hỗ trợ người khiếm thị bằng mô hình học máy thị giác-ngôn ngữ.

## Ý tưởng

Người dùng mở web app trên điện thoại, chụp hoặc upload ảnh bối cảnh trước mặt. Ảnh được gửi đến backend FastAPI chạy mô hình Qwen2-VL fine-tuned tiếng Việt. Hệ thống trả về mô tả ngắn và lời khuyên an toàn, sau đó frontend đọc kết quả bằng Text-to-Speech.

## Cấu trúc thư mục

```text
blind-assistant-app/
├── backend/
├── frontend/
├── docs/
└── README.md