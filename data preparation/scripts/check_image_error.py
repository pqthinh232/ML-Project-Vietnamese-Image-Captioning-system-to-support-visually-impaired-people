import json


# đọc file json
with open("output.json", "r", encoding="utf-8") as f:
    data = json.load(f)


# ===== PHẦN 1: CHECK ẢNH THIẾU =====
image_numbers = []


for item in data:
    filename = item["image"]
    number = int(filename.split(".")[0])
    image_numbers.append(number)


image_numbers = sorted(image_numbers)


min_id = image_numbers[0]
max_id = image_numbers[-1]


full_set = set(range(min_id, max_id + 1))
current_set = set(image_numbers)


missing = sorted(full_set - current_set)


print("Số lượng ảnh hiện có:", len(image_numbers))
print("Khoảng:", min_id, "->", max_id)
print("Số lượng ảnh thiếu:", len(missing))


print("\nDanh sách ảnh thiếu:")
for num in missing:
    print(f"{num:05d}.jpg")




# ===== PHẦN 2: THỐNG KÊ CAPTION =====


caption_lengths = []
all_captions = []


for item in data:
    for cap in item["captions"]:
        text = cap["caption"]
        length = len(text)  # độ dài theo số ký tự
        caption_lengths.append(length)
        all_captions.append(text)


# ngắn nhất
min_len = min(caption_lengths)
shortest_caption = all_captions[caption_lengths.index(min_len)]


# dài nhất
max_len = max(caption_lengths)
longest_caption = all_captions[caption_lengths.index(max_len)]


# trung bình
avg_len = sum(caption_lengths) / len(caption_lengths)


# in kết quả
print("\n===== THỐNG KÊ CAPTION =====")
print("Tổng số caption:", len(caption_lengths))
print("Độ dài ngắn nhất:", min_len)
print("Caption ngắn nhất:", shortest_caption)


print("\nĐộ dài dài nhất:", max_len)
print("Caption dài nhất:", longest_caption)


print("\nĐộ dài trung bình:", round(avg_len, 2))

