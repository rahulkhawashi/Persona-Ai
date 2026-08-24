"""
Test file to verify Gemini API is working correctly
Run this before running the full voice assistant
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY or GEMINI_API_KEY == 'your-api-key-here':
    print("❌ ERROR: Gemini API key not configured!")
    print("Please add your API key to the .env file")
    exit(1)

print("✓ Loading Gemini API...")
try:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✓ Gemini API configured successfully!")
except Exception as e:
    print(f"❌ Error configuring Gemini API: {e}")
    exit(1)

def test_gemini(query):
    """Test Gemini API with a sample query"""
    try:
        print(f"\n📝 Testing query: '{query}'")
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(query)
        answer = response.text
        print(f"✓ Response received!")
        print(f"\n🤖 Gemini AI Response:\n{answer}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("PERSONA AI - Gemini API Test")
    print("=" * 60)
    
    # Test 1: Simple question
    print("\n--- Test 1: Simple Question ---")
    if not test_gemini("What is Python?"):
        exit(1)
    
    # Test 2: Math question
    print("\n--- Test 2: Math Question ---")
    if not test_gemini("What is 2 + 2?"):
        exit(1)
    
    # Test 3: General knowledge
    print("\n--- Test 3: General Knowledge ---")
    if not test_gemini("Tell me about machine learning"):
        exit(1)
    
    # Test 4: User input
    print("\n--- Test 4: Custom Question ---")
    user_question = input("Enter your question (or press Enter to skip): ").strip()
    if user_question:
        test_gemini(user_question)
    
    print("\n" + "=" * 60)
    print("✓ All tests completed successfully!")
    print("You can now run: python persona-ai.py")
    print("=" * 60)
