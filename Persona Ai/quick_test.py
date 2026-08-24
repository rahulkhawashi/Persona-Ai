"""
Quick test for Gemini API
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
print(f"Using API Key: {GEMINI_API_KEY[:5]}...{GEMINI_API_KEY[-5:]}")

if not GEMINI_API_KEY or GEMINI_API_KEY == 'your-api-key-here':
    print("ERROR: Gemini API key not configured!")
    exit(1)

genai.configure(api_key=GEMINI_API_KEY)

print("Testing Gemini API...")
print("-" * 50)

try:
    if hasattr(genai, 'GenerativeModel'):
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content("What is 2 + 2? Answer in one sentence.")
        print("✓ API Working!")
        print(f"\nResponse: {response.text}")
    elif hasattr(genai, 'generate_text'):
        response = genai.generate_text(model='gemini-2.0-flash', prompt="What is 2 + 2? Answer in one sentence.")
        print("✓ API Working!")
        print(f"\nResponse: {getattr(response, 'text', str(response))}")
    else:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(model='gemini-2.0-flash', contents="What is 2 + 2? Answer in one sentence.")
        print("✓ API Working!")
        print(f"\nResponse: {getattr(response, 'text', str(response))}")
except Exception as e:
    print(f"ERROR: {e}")
