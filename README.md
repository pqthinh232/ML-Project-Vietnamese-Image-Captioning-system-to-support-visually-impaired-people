# ML-Project-Vietnamese-Image-Captioning-system-to-support-visually-impaired-people

## 📊 Dataset
Do kích thước tệp lớn, toàn bộ tập dữ liệu hình ảnh và nhãn được lưu trữ trên **Hugging Face**.

- **Link Dataset:** https://huggingface.co/datasets/pqthinh232/HCMUS-Vietnamese-Image-captioning-for-visually-impaired
- **Quy mô:** 8.000 ảnh (40.000 mẫu sau khi flattened).
- **Cấu trúc:** Train (80%) - Validation (10%) - Test (10%).
- **Chủ đề:** Giao thông đường phố, phương tiện công cộng và không gian nội thất.

### Cách tải dữ liệu để huấn luyện:
```python
from datasets import load_dataset
dataset = load_dataset("pqthinh232/HCMUS-Vietnamese-Image-captioning-for-visually-impaired")
```

---

### Chú thích các file

Dựa trên ảnh của bạn, hãy phân loại như sau:

*   **Thư mục `data_preparation/scripts/`:**
    *   `rename_images.py`: Giúp chuẩn hóa ID ảnh.
    *   `check_image_error.py`: Đảm bảo data sạch.
    *   `image_to_pdf.py`: Script chuyển đổi ảnh vào pdf để tiện cho việc gán nhãn tự động trên Google NotebookLM.
*   **Thư mục `data_preparation/prompts/`:**
    *   `annotation_prompt_street + transport.txt`: Chứa nội dung prompt sử dụng để gán nhãn tự động cho ảnh chủ đề giao thông trên NotebookLM.
    *   `annotation_prompt_house.txt`: Chứa nội dung prompt sử dụng để gán nhãn tự động cho ảnh chủ đề trong nhà trên NotebookLM.
*   `eda+preprocess images.ipynb`: Chứa các biểu đồ phân tích size ảnh và resize cho phù hợp, lược bỏ thông tin không cần thiết trong ảnh để tối ưu dung lương khi upload data lên **HuggingFace**.
*   `upload_dataset_to_HF.ipynb`: Code thực hiện đưa dataset lên **HuggingFace** để thuận tiện load data trong quá trình đánh giá (evaluate) và finetuning.

---

## Ứng dụng Web (Web Application)

Hệ thống đã được tích hợp thành một ứng dụng web hoàn chỉnh để người dùng có thể dễ dàng trải nghiệm trực tiếp. Để sử dụng, vui lòng thực hiện tuần tự theo các bước dưới đây:

### Bước 1: Khởi chạy Backend Server (Mô hình AI) trên Google Colab

Để hệ thống có thể xử lý hình ảnh và tự động sinh mô tả, bạn cần khởi chạy Backend Server trước. Do mô hình khá nặng, chúng tôi khuyến nghị chạy trên Google Colab:

1. **Mở tệp notebook:** Tải tệp `blind-assistant-app/backend/app_project_ML.ipynb` lên [Google Colab](https://colab.research.google.com/) (hoặc mở trực tiếp nếu bạn đã liên kết với Github).
2. **Cấu hình GPU (Quan trọng):** Trên thanh menu của Colab, chọn **Runtime (Thời gian chạy)** > **Change runtime type (Thay đổi loại thời gian chạy)**. Tại mục *Hardware accelerator*, hãy chọn **T4 GPU** và nhấn Save.
3. **Khởi chạy Server:** Chọn **Runtime** > **Run all (Chạy tất cả)** để tiến hành cài đặt thư viện, tải mô hình và chạy server.
4. **Lấy API Endpoint:** Khi cell cuối cùng chạy hoàn tất, hệ thống sẽ cung cấp một đường dẫn public URL (ví dụ thông qua ngrok hoặc localtunnel). Bạn sẽ cần copy đường dẫn này để kết nối với Frontend ở Bước 2.

### Bước 2: Truy cập hoặc cài đặt Frontend

Sau khi Backend đã chạy thành công và có đường dẫn API, bạn có thể trải nghiệm giao diện web theo 1 trong 2 cách sau:

#### Cách 2A: Truy cập trực tiếp ứng dụng đã triển khai (Khuyên dùng)
- **Truy cập ứng dụng tại:** [https://blind-assistant-ml.netlify.app/](https://blind-assistant-ml.netlify.app/)
- *Lưu ý: Dán đường dẫn API public lấy từ Colab vào cài đặt trên giao diện web (nếu có) để kết nối với backend.*

#### Cách 2B: Chạy Frontend trên máy cá nhân (Local)
Nếu bạn muốn chạy trực tiếp mã nguồn giao diện (frontend) trên máy tính của mình, hãy làm theo các bước sau:

1. **Yêu cầu hệ thống:** Đảm bảo máy tính của bạn đã cài đặt [Node.js](https://nodejs.org/).
2. **Mở terminal/command prompt** và di chuyển vào thư mục chứa code frontend:
   ```bash
   cd blind-assistant-app/frontend
   ```
3. **Cài đặt các thư viện phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```
4. **Khởi chạy ứng dụng (Development Server):**
   ```bash
   npm run dev
   ```
5. **Sử dụng:** Sau khi chạy lệnh thành công, terminal sẽ cung cấp một đường dẫn local (thường là `http://localhost:3000/`). Bạn chỉ cần mở đường dẫn này trên trình duyệt web, cung cấp đường dẫn API từ Colab và bắt đầu sử dụng.

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