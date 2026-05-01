import io
import time
import torch

from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
from qwen_vl_utils import process_vision_info


MODEL_ID = "pqthinh232/HCMUS-Qwen2-VL-2B-Instruct-Vietnamese-Image-Captioning-for-blind-E2"

device = "cuda" if torch.cuda.is_available() else "cpu"


print("Loading model...")

model = Qwen2VLForConditionalGeneration.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16,
    device_map="auto"
)

processor = AutoProcessor.from_pretrained(
    MODEL_ID,
    min_pixels=128 * 28 * 28,
    max_pixels=384 * 28 * 28
)

model.eval()

print("Model loaded successfully!")


app = FastAPI(
    title="Blind Assistant Backend",
    description="API nhận ảnh và trả mô tả tiếng Việt cho người khiếm thị",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DEFAULT_PROMPT = (
    "Viết đúng một câu ngắn bằng tiếng Việt, mô tả vật cản hoặc tình huống nguy hiểm chính "
    "trong ảnh và đưa ra hướng dẫn di chuyển an toàn cho người khiếm thị. "
    "Không giải thích thêm."
)


def resize_image(image: Image.Image, max_side: int = 768) -> Image.Image:
    width, height = image.size

    if max(width, height) <= max_side:
        return image

    scale = max_side / max(width, height)
    new_width = int(width * scale)
    new_height = int(height * scale)

    return image.resize((new_width, new_height))


def generate_caption(image: Image.Image, prompt: str = DEFAULT_PROMPT) -> str:
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "image": image,
                },
                {
                    "type": "text",
                    "text": prompt,
                },
            ],
        }
    ]

    text = processor.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    image_inputs, video_inputs = process_vision_info(messages)

    inputs = processor(
        text=[text],
        images=image_inputs,
        videos=video_inputs,
        padding=True,
        return_tensors="pt"
    ).to(device)

    with torch.inference_mode():
        generated_ids = model.generate(
            **inputs,
            max_new_tokens=50,
            do_sample=False
        )

    generated_ids_trimmed = [
        output_ids[len(input_ids):]
        for input_ids, output_ids in zip(inputs.input_ids, generated_ids)
    ]

    output_text = processor.batch_decode(
        generated_ids_trimmed,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=False
    )[0]

    return output_text.strip()


@app.get("/")
def root():
    return {
        "message": "Blind Assistant Backend is running",
        "model": MODEL_ID
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "cuda": torch.cuda.is_available(),
        "device": device,
        "model_loaded": model is not None
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    start_time = time.time()

    if file.content_type is None or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File gửi lên phải là ảnh."
        )

    try:
        image_bytes = await file.read()

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = resize_image(image, max_side=768)

        caption = generate_caption(image)
        
        if not caption:
            caption = "Không thể xác định rõ vật cản trong ảnh, bạn hãy di chuyển chậm và kiểm tra xung quanh."

        latency = time.time() - start_time

        return {
            "success": True,
            "caption": caption,
            "latency_seconds": round(latency, 3)
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )