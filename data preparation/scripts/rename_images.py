import os


FOLDER_PATH = r"C:\Users\ADMIN\Documents\Chuyen Nganh\HK2\Nhập môn học máy\dataset\sidewalk_obstacles_2000"


def rename_images_in_folder():
    if not os.path.exists(FOLDER_PATH):
        print("Không tìm thấy thư mục. Vui lòng kiểm tra lại đường dẫn!")
        return


    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.bmp')
    files = [f for f in os.listdir(FOLDER_PATH) if f.lower().endswith(valid_extensions)]
   
    files.sort()


    print(f"Bắt đầu đổi tên cho {len(files)} file...")


    count = 1
    for filename in files:
        _, file_extension = os.path.splitext(filename)


        # Tên mới dạng 00001.jpg
        new_name = f"{count:05d}{file_extension}"


        old_file_path = os.path.join(FOLDER_PATH, filename)
        new_file_path = os.path.join(FOLDER_PATH, new_name)


        try:
            os.rename(old_file_path, new_file_path)
            count += 1
        except FileExistsError:
            print(f"[-] Bỏ qua: File '{new_name}' đã tồn tại.")
        except Exception as e:
            print(f"[-] Lỗi khi đổi tên file {filename}: {str(e)}")


    print(f"\nHoàn tất! Đã đổi tên thành công {count - 1} file ảnh.")


rename_images_in_folder()

