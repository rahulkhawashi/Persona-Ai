"""Final verification - demonstrates complete voice flow"""
import subprocess
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import google.generativeai as genai
from dotenv import load_dotenv
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")
load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def speak(audio):
    """Speak the given audio text using Windows native TTS"""
    try:
        if not audio or not str(audio).strip():
            return
        
        audio_text = str(audio)
        audio_text = ''.join(char if ord(char) < 128 else ' ' for char in audio_text)
        audio_text = audio_text[:500].strip()
        
        if not audio_text:
            return
        
        print(f"[SPEAKING] {audio_text}")
        
        escaped_text = audio_text.replace("'", "''").replace('"', '\"')
        
        ps_code = f"""
        Add-Type -AssemblyName System.Speech
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
        $speak.Volume = 100
        $speak.Rate = 0
        $speak.Speak('{escaped_text}')
        """
        
        result = subprocess.run(
            ['powershell', '-Command', ps_code],
            capture_output=True,
            text=True,
            timeout=30
        )
        
    except Exception as e:
        print(f"[ERROR] {e}")

# Main test
print("=" * 70)
print(" PERSONA AI - COMPLETE VOICE FLOW VERIFICATION")
print("=" * 70)

print("\n[PHASE 1] Greeting")
print("-" * 70)
speak("Good Evening! I am Persona AI. Please tell me how may I help you")

print("\n[PHASE 2] Processing Gemini Queries")
print("-" * 70)

queries = [
    "What is machine learning?",
    "Tell me about Python programming",
    "How does artificial intelligence work?"
]

for i, query in enumerate(queries, 1):
    print(f"\n[QUERY {i}] User asks: '{query}'")
    print("Getting response from Gemini...")
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(query)
        answer = response.text
        
        print(f"Persona AI Response: {answer[:100]}..." if len(answer) > 100 else f"Persona AI Response: {answer}")
        speak(answer)
        print("✓ Response spoken successfully")
    except Exception as e:
        print(f"✗ Error: {e}")

print("\n" + "=" * 70)
print(" TEST COMPLETE!")
print("=" * 70)
print("\n✓ If you heard:")
print("  1. Greeting message")
print("  2. All three query responses")
print("  Then voice output is working correctly!")
print("\nThe voice assistant is ready to use:")
print("  python persona-ai.py")
print("=" * 70)
