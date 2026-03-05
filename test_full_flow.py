"""Test the full voice assistant flow with simulated input"""
import subprocess
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import memory
import google.generativeai as genai
from dotenv import load_dotenv
import warnings
import logging

# Suppress warnings
warnings.filterwarnings("ignore", category=FutureWarning)
logging.getLogger('google.generativeai').setLevel(logging.ERROR)

# Load environment
load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def speak(audio):
    """Speak the given audio text using Windows native TTS"""
    try:
        if not audio or not str(audio).strip():
            print("[DEBUG] Empty audio, skipping speak")
            return
        
        audio_text = str(audio)
        audio_text = ''.join(char if ord(char) < 128 else ' ' for char in audio_text)
        audio_text = audio_text[:500].strip()
        
        if not audio_text:
            print("[DEBUG] Audio text empty after cleaning")
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
        
        if result.returncode != 0:
            print(f"[WARNING] PowerShell TTS returned code {result.returncode}")
            if result.stderr:
                print(f"[WARNING] Error: {result.stderr}")
                
    except Exception as e:
        print(f"[ERROR in speak()] {type(e).__name__}: {e}")

def askGemini(query):
    """Use Gemini API to answer user queries"""
    try:
        memories = memory.load_memories()
        if memories:
            mem_context = "User memories: " + "; ".join(memories[-10:])
            prompt = f"{mem_context}\n\n{query}"
        else:
            prompt = query

        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        answer = response.text
        return answer
    except Exception as e:
        err = str(e).lower()
        if 'quota' in err or '429' in err or 'exceeded' in err or 'rate-limit' in err or 'rate limit' in err:
            print("Gemini API: quota exceeded or rate limit reached; please try later.")
            return "Sorry, Gemini API quota exceeded. Please try again later."
        else:
            print("Gemini API: an error occurred. Try again later.")
            return "Sorry, I couldn't process that request."

# Run the flow test
print("=" * 60)
print("Voice Assistant Flow Test")
print("=" * 60)

print("\n[STEP 1] Greeting")
speak("Good Evening! I am Persona AI. Please tell me how may I help you")
print("\n[STEP 2] Simulating Gemini Query")
test_queries = [
    "What is artificial intelligence?",
    "Tell me a joke",
    "Explain machine learning"
]

for i, query in enumerate(test_queries, 1):
    print(f"\n[STEP 2.{i}] Query: {query}")
    answer = askGemini(query)
    print(f"Persona AI Response: {answer}")
    speak(answer)

print("\n" + "=" * 60)
print("Test Complete!")
print("=" * 60)
print("\nYou should have heard:")
print("1. Greeting message")
print("2. Responses to all three queries")
