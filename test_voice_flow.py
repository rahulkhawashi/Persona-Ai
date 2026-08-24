"""
Simulate Persona AI voice flow (for testing without microphone)
This mimics what persona-ai.py does but accepts typed input instead of voice
"""

import os
import sys

# Add project dir to path
sys.path.insert(0, r'd:\new chrome downloads\Persona Ai')

import pyttsx3
import google.generativeai as genai
from dotenv import load_dotenv
import memory
import warnings
import logging

# Suppress warnings
warnings.filterwarnings("ignore", category=FutureWarning)
logging.getLogger("google").setLevel(logging.ERROR)

# Load env
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

# Initialize TTS engine
engine = pyttsx3.init()
engine.setProperty('rate', 150)
voices = engine.getProperty('voices')
if voices:
    engine.setProperty('voice', voices[0].id)

def speak(audio):
    """Speak the given audio text"""
    try:
        if not audio or not str(audio).strip():
            print("[DEBUG] Empty audio, skipping speak")
            return
        
        audio_text = str(audio)[:500]
        print(f"[SPEAKING] {audio_text}")
        
        engine.say(audio_text)
        result = engine.runAndWait()
        
        if result is False:
            print("[DEBUG] Engine returned False - may indicate audio system issue")
    except Exception as e:
        print(f"[ERROR in speak()] {e}")
        print(f"[WARNING] Voice output failed, but text output should still show above")

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
        if 'quota' in err or '429' in err or 'exceeded' in err:
            print("Gemini API: quota exceeded or rate limit reached; please try later.")
            return "Sorry, Gemini API quota exceeded. Please try again later."
        else:
            print("Gemini API: an error occurred. Try again later.")
            return "Sorry, I couldn't process that request."

def main():
    print("=" * 70)
    print("PERSONA AI - Voice Test (Simulated Input)")
    print("=" * 70)
    print("\nThis simulates the voice assistant with typed input.")
    print("You should hear voice output for each response.\n")
    
    # Test 1: Greeting
    print("\n[TEST 1] Testing greeting with voice...")
    print("Simulating: wishMe()")
    speak("Good Evening!")
    speak("I am Persona. Please tell me how may I help you")
    
    # Test 2: Simple query
    print("\n[TEST 2] Testing Gemini response with voice...")
    print("Simulating user query: Who is the prime minister of India?")
    answer = askGemini("Who is the prime minister of India?")
    print(f"Persona AI Response: {answer}")
    speak(answer)
    
    # Test 3: Another query
    print("\n[TEST 3] Testing another Gemini response...")
    print("Simulating user query: What is Python?")
    answer = askGemini("What is Python?")
    print(f"Persona AI Response: {answer}")
    speak(answer)
    
    # Test 4: Memory
    print("\n[TEST 4] Testing memory with voice...")
    print("Remembering: I like coding")
    memory.remember("I like coding")
    speak("Okay, I will remember that.")
    
    print("\n" + "=" * 70)
    print("Test complete!")
    print("If you heard voice output for all tests above, voice is working!")
    print("=" * 70)

if __name__ == "__main__":
    main()
