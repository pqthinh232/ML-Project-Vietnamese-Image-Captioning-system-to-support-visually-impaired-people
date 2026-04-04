# ML-Lab01-Vietnamese-Image-Captioning-system-to-support-visually-impaired-people

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