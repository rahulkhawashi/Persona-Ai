"""Quick test - just greeting and one Gemini query"""
import subprocess
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import google.generativeai as genai
from dotenv import load_dotenv
import warnings

warnings.filterwarnings("ignore")
load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def speak(text):
    """Use PowerShell for TTS"""
    if not text or not str(text).strip():
        return
    text = str(text)[:500]
    print(f"[SPEAKING] {text[:100]}...")
    escaped_text = text.replace("'", "''").replace('"', '\"')
    ps_code = f"""Add-Type -AssemblyName System.Speech
    $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $speak.Volume = 100
    $speak.Rate = 0
    $speak.Speak('{escaped_text}')"""
    subprocess.run(['powershell', '-Command', ps_code], capture_output=True, timeout=30)

# Test
print("[TEST] Greeting...")
speak("Good Evening, I am Persona AI")

print("[TEST] Asking Gemini...")
model = genai.GenerativeModel('gemini-2.5-flash')
response = model.generate_content("What is AI in one sentence?")
answer = response.text
print(f"Gemini: {answer}")
speak(answer)

print("[SUCCESS] Test complete!")
