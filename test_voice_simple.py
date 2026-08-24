#!/usr/bin/env python3
"""
Test Persona AI Voice Version
"""

import pyttsx3
import speech_recognition as sr
import datetime
import os
import subprocess
import google.generativeai as genai
from dotenv import load_dotenv
import memory
import warnings
import logging

# Suppress warnings
warnings.filterwarnings("ignore", category=FutureWarning)
logging.getLogger("google").setLevel(logging.ERROR)
logging.getLogger("google.generativeai").setLevel(logging.ERROR)

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'your-api-key-here')
genai.configure(api_key=GEMINI_API_KEY)

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

        print(f"\n🎤 Persona AI is speaking: {audio_text}")
        print("🔊 [Audio playing...]", end="", flush=True)

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

        print("\r" + " " * 50 + "\r", end="", flush=True)

        if result.returncode != 0:
            print(f"[WARNING] PowerShell TTS returned code {result.returncode}")

    except Exception as e:
        print(f"[ERROR in speak()] {type(e).__name__}: {e}")

def wishMe():
    hour = int(datetime.datetime.now().hour)
    if hour>=0 and hour<12:
        greeting = "Good Morning!"
    elif hour>=12 and hour<18:
        greeting = "Good Afternoon!"
    else:
        greeting = "Good Evening!"

    print(f"\n🤖 Persona AI: {greeting}")
    speak(greeting)

    intro = "I am Persona. Please tell me how may I help you"
    print(f"🤖 Persona AI: {intro}")
    speak(intro)

def takeCommand():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎧 Listening....")
        r.pause_threshold = 1
        audio = r.listen(source)

    try:
        print("Recognizing...")
        query = r.recognize_google(audio, language='en-in')
        print(f"👤 You said: {query}\n")
        return query
    except Exception as e:
        print("Say that again please...")
        return "None"

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
        return "Sorry, I couldn't process that request."

def processQuery(query):
    query_lower = query.lower()

    if 'time' in query_lower:
        strTime = datetime.datetime.now().strftime("%H:%M:%S")
        print(f"🕐 Current time: {strTime}")
        speak(f"Sir, the time is {strTime}")
        return True
    else:
        print(f"\n🤔 Thinking about: '{query}'")
        answer = askGemini(query)
        print(f"💭 Persona AI Response: {answer}")
        speak(answer)
        return True

if __name__ == "__main__":
    wishMe()

    while True:
        try:
            print("\n🎤 Listening for your command...")
            query = takeCommand()

            if not query or query.lower() == "none":
                continue

            should_continue = processQuery(query)
            if not should_continue:
                break

        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            speak("Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            speak("An error occurred. Please try again.")