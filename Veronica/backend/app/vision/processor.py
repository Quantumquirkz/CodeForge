from openai import OpenAI
from app.core.config import settings
import base64

class VisionProcessor:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def analyze_image(self, image_path: str, prompt: str = "What is in this image?") -> str:
        """Analyzes an image using GPT-4o Vision."""
        if not settings.OPENAI_API_KEY:
            return "Vision capability disabled: OpenAI API Key missing."

        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        },
                    ],
                }
            ],
            max_tokens=300,
        )

        return response.choices[0].message.content

vision_processor = VisionProcessor()
