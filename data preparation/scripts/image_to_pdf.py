import os
from PIL import Image, ImageDraw, ImageFont


def images_to_pdf_custom(folder_path, output_pdf, start_index=50, count=50):
    # --- CẤU HÌNH TẠI ĐÂY ---
    font_size = 40          # Chỉnh cỡ chữ to nhỏ tùy ý
    bg_width = 400          # Độ dài của nền trắng
    bg_height = 80          # Độ cao của nền trắng
    text_color = (255, 0, 0) # Màu chữ (Đỏ)
    bg_color = (255, 255, 255) # Màu nền (Trắng)
    # -----------------------


    valid_extensions = ('.jpg', '.jpeg', '.png', '.bmp')
    files = sorted([f for f in os.listdir(folder_path) if f.lower().endswith(valid_extensions)])
    files_to_process = files[start_index : start_index + count]


    if not files_to_process:
        print("Không tìm thấy ảnh.")
        return


    # Thử tải font chữ, nếu không có sẽ dùng font mặc định
    try:
        # Windows thường có font Arial ở đường dẫn này
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
        print("Không tìm thấy font Arial, đang dùng font mặc định.")


    pdf_pages = []
    for filename in files_to_process:
        img_path = os.path.join(folder_path, filename)
        img = Image.open(img_path).convert("RGB")
        draw = ImageDraw.Draw(img)
       
        # 1. Vẽ nền trắng (x0, y0, x1, y1)
        # x1 = bg_width, y1 = bg_height
        draw.rectangle([0, 0, bg_width, bg_height], fill=bg_color)
       
        # 2. Vẽ chữ với font và cỡ chữ đã chọn
        label = f"FILE: {filename}"
        draw.text((20, 15), label, fill=text_color, font=font)
       
        pdf_pages.append(img)


    if pdf_pages:
        pdf_pages[0].save(output_pdf, save_all=True, append_images=pdf_pages[1:], optimize=True, quality=80)
        print(f"Đã lưu {len(pdf_pages)} ảnh vào {output_pdf}")


# Sử dụng đường dẫn r"" để tránh lỗi
folder = r"D:\Hoc\Hoc_o_truong\HK8\ML\project\data\archive\za_traffic_2020\traffic_train\images"
images_to_pdf_custom(folder, "ket_qua_tuy_chinh.pdf")

