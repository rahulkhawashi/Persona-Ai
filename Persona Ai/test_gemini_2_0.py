import os
from google import genai
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

print("Testing Gemini 2.0 Flash...")
try:
    response = client.models.generate_content(
        model='gemini-pro-latest',
        contents='Hello, respond with "READY"'
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error with gemini-2.0-flash: {e}")
