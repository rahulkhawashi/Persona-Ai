from config import settings
import google.generativeai as genai
import os

# Configure using a hypothetical key from env if online fallback is enabled
if settings.USE_ONLINE_FALLBACK:
    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key:
        genai.configure(api_key=api_key)

async def generate_response_fallback(prompt: str, history: list) -> str:
    if not settings.USE_ONLINE_FALLBACK:
        return "Online fallback is disabled."
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error with online fallback: {str(e)}"
