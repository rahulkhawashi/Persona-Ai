import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

client = genai.Client(api_key=api_key)

print("Listing available models...")
try:
    # In the new SDK, it's client.models.list()
    for model in client.models.list():
        print(f"Name: {model.name}")
except Exception as e:
    print(f"Error: {e}")
