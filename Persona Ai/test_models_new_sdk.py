import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

print("Testing Gemini 1.5 Flash...")
try:
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents='Hello, respond with "READY"'
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error with gemini-1.5-flash: {e}")
    
    print("\nTrying gemini-1.5-flash-latest...")
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash-latest',
            contents='Hello, respond with "READY"'
        )
        print(f"Response: {response.text}")
    except Exception as e2:
        print(f"Error with gemini-1.5-flash-latest: {e2}")
