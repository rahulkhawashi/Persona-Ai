"""
Quick test for Gemini API
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY or GEMINI_API_KEY == 'your-api-key-here':
    print("ERROR: Gemini API key not configured!")
    exit(1)

genai.configure(api_key=GEMINI_API_KEY)

print("Testing Gemini API...")
print("-" * 50)

try:
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("What is 2 + 2? Answer in one sentence.")
    print("✓ API Working!")
    print(f"\nResponse: {response.text}")
except Exception as e:
    print(f"ERROR: {e}")
