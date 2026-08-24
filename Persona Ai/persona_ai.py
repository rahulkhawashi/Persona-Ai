import pyttsx3
import speech_recognition as sr
import datetime
import wikipedia
import webbrowser
import os
import smtplib
import subprocess
import requests
import feedparser
import threading
import time
import re
from plyer import notification
# Import Gemini compatibility: support google.generativeai and google.genai
try:
    import google.generativeai as genai
except ImportError:
    from google import genai

from dotenv import load_dotenv
import memory
import warnings
import logging

# Suppress noisy FutureWarnings from google.generativeai and reduce logging
warnings.filterwarnings("ignore", category=FutureWarning)
logging.getLogger("google").setLevel(logging.ERROR)
logging.getLogger("google.generativeai").setLevel(logging.ERROR)

# Load environment variables
load_dotenv(override=True)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'your-api-key-here')

try:
    genai.configure(api_key=GEMINI_API_KEY)
except Exception:
    # some genai versions have Client() only
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception:
        gemini_client = None

# Note: pyttsx3 is initialized but we now use PowerShell for more reliable TTS
engine = pyttsx3.init()
engine.setProperty('rate', 150)

def speak(audio):
    """Speak the given audio text using Windows native TTS"""
    try:
        if not audio or not str(audio).strip():
            print("[DEBUG] Empty audio, skipping speak")
            return
        
        # Convert to string and remove problematic characters
        audio_text = str(audio)

        # Unicode normalizations
        audio_text = audio_text.replace('’', "'").replace('“', '"').replace('”', '"')
        audio_text = audio_text.replace('–', '-').replace('—', '-')

        # Remove emojis and non-ASCII chars (not safe for PowerShell TTS)
        audio_text = ''.join(char if 32 <= ord(char) < 127 else ' ' for char in audio_text)

        # Remove characters that PowerShell TTS pronounces as names (e.g., asterisk)
        dangerous_chars = set('*#@~`^|<>\\')
        audio_text = ''.join(' ' if c in dangerous_chars else c for c in audio_text)

        # Collapse multiple spaces
        import re
        audio_text = re.sub(r'\s+', ' ', audio_text).strip()

        # Limit length for TTS reliability
        audio_text = audio_text[:500].strip()

        if not audio_text:
            print("[DEBUG] Audio text empty after cleaning")
            return

        # Show speaking indicator in terminal
        print(f"\n[Persona AI] is speaking: {audio_text}")
        print("[Audio playing...]", end="", flush=True)
        
        # Escape quotes in the text for PowerShell
        escaped_text = audio_text.replace("'", "''").replace('"', '\"')
        
        # Use Windows native TTS via PowerShell (more reliable than pyttsx3)
        ps_code = f"""
        Add-Type -AssemblyName System.Speech
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
        $speak.Volume = 100
        $speak.Rate = 0
        $speak.Speak('{escaped_text}')
        """
        
        import subprocess
        result = subprocess.run(
            ['powershell', '-Command', ps_code],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        # Clear the audio playing indicator
        print("\r" + " " * 50 + "\r", end="", flush=True)
        
        if result.returncode != 0:
            print(f"[WARNING] PowerShell TTS returned code {result.returncode}")
            if result.stderr:
                print(f"[WARNING] Error: {result.stderr}")
                
    except Exception as e:
        print(f"[ERROR in speak()] {type(e).__name__}: {e}")
        print(f"[WARNING] Voice output failed, but text output should still show above")

def wishMe():
    hour = int(datetime.datetime.now().hour)
    if hour>=0 and hour<12:
        greeting = "Good Morning!"
    elif hour>=12 and hour<18:
        greeting = "Good Afternoon!"
    else:
        greeting = "Good Evening!" 

    print(f"\n[Persona AI]: {greeting}")
    speak(greeting)
    
    intro = "I am Persona. Please tell me how may I help you"
    print(f"[Persona AI]: {intro}")
    speak(intro) 

def takeCommand():
    # It takes microphone input from user and returns string output
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("[Listening]....")
        r.pause_threshold = 1
        audio = r.listen(source)

    try:
        print("Recognizing...")    
        query = r.recognize_google(audio, language='en-in') #Using google for voice recognition.
        print(f"You said: {query}\n")  #User query will be printed.

    except Exception as e:
        # print(e)    
        print("Say that again please...")   #Say that again will be printed in case of improper voice 
        return "None" #None string will be returned
    return query

def sendEmail(to, content):
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.login('khawshirb@jdcoem.ac.in', 'your-password')
        server.sendmail('ikharkarry@jdcoem.ac.in', to, content)
        server.close()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def askGemini(query):
    """Use Gemini API to answer user queries"""
    try:
        # Prepend short memory context if available
        memories = memory.load_memories()
        if memories:
            mem_context = "User memories: " + "; ".join(memories[-10:])
            prompt = f"{mem_context}\n\n{query}"
        else:
            prompt = query

        # Two possible APIs depending on installed package version
        if hasattr(genai, 'GenerativeModel'):
            model = genai.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content(prompt)
            answer = response.text
            return answer

        if 'gemini_client' in globals() and globals().get('gemini_client'):
            response = globals()['gemini_client'].models.generate_content(model='gemini-2.0-flash', contents=prompt)
            return getattr(response, 'text', str(response))

        if hasattr(genai, 'generate_text'):
            response = genai.generate_text(model='gemini-2.0-flash', prompt=prompt)
            return getattr(response, 'text', str(response))

        if hasattr(genai, 'client') and getattr(genai, 'client'):
            response = genai.client.models.generate_content(model='gemini-2.0-flash', contents=prompt)
            return getattr(response, 'text', str(response))


        # If no client path works, fallback to generic call
        return "Sorry, I couldn't connect to Gemini right now."
    except Exception as e:
        err = str(e).lower()
        if 'quota' in err or '429' in err or 'exceeded' in err or 'rate-limit' in err or 'rate limit' in err:
            print("Gemini API: quota exceeded or rate limit reached; please try later.")
            return "Sorry, Gemini API quota exceeded. Please try again later."
        print(f"Gemini API: an error occurred. {e}")
        return "Sorry, I couldn't process that request."    
def get_weather(query_lower=""):
    try:
        # Check if the user asked for a specific city (e.g. "weather in nagpur", "from nagpur")
        city_match = re.search(r'(?:in|from|for|of)\s+([a-zA-Z\s]+)', query_lower)
        
        if city_match:
            city_name = city_match.group(1).strip()
            # Use Open-Meteo Geocoding API to get coordinates for the requested city
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_name}&count=1&language=en&format=json"
            geo_res = requests.get(geo_url).json()
            
            if 'results' in geo_res and len(geo_res['results']) > 0:
                lat = geo_res['results'][0]['latitude']
                lon = geo_res['results'][0]['longitude']
                city = geo_res['results'][0]['name']
            else:
                return f"Sorry, I couldn't find the location {city_name}."
        else:
            # Fallback to IP-based location if no city is specified
            ip_info = requests.get('https://freeipapi.com/api/json').json()
            lat = ip_info.get('latitude', 51.5)
            lon = ip_info.get('longitude', -0.1)
            city = ip_info.get('cityName', 'London')
        
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code"
        res = requests.get(url).json()
        temp = res['current']['temperature_2m']
        
        weather_desc = "clear"
        code = res['current']['weather_code']
        if code in [1, 2, 3]: weather_desc = "partly cloudy"
        elif code in [45, 48]: weather_desc = "foggy"
        elif code in [51, 53, 55, 61, 63, 65, 80, 81, 82]: weather_desc = "rainy"
        elif code in [71, 73, 75, 85, 86]: weather_desc = "snowy"
        elif code in [95, 96, 99]: weather_desc = "stormy"
        
        return f"The current temperature in {city} is {temp} degrees Celsius and the weather is {weather_desc}."
    except Exception as e:
        print(f"Weather error: {e}")
        return "Sorry, I couldn't fetch the weather right now."

def get_news():
    try:
        # Google News RSS feed for US (can be changed to other regions)
        url = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en"
        feed = feedparser.parse(url)
        headlines = []
        for entry in feed.entries[:3]:
            headlines.append(entry.title)
        
        news_text = "Here are the top news headlines: " + ". ".join(headlines)
        return news_text
    except Exception as e:
        print(f"News error: {e}")
        return "Sorry, I couldn't fetch the news right now."

def reminder_worker(delay_seconds, message):
    time.sleep(delay_seconds)
    print(f"\nREMINDER: {message}")
    speak(f"Sir, you have a reminder: {message}")

def set_reminder(time_str, message):
    # Very simple time parser: supports "X minutes" or "X seconds"
    try:
        delay = 0
        if "minute" in time_str:
            num = int(re.search(r'\d+', time_str).group())
            delay = num * 60
        elif "second" in time_str:
            num = int(re.search(r'\d+', time_str).group())
            delay = num
        elif "hour" in time_str:
            num = int(re.search(r'\d+', time_str).group())
            delay = num * 3600
        else:
            return False
            
        t = threading.Thread(target=reminder_worker, args=(delay, message))
        t.daemon = True
        t.start()
        return True
    except Exception as e:
        print(f"Reminder error: {e}")
        return False

def processQuery(query):
    """Process user query and execute appropriate action"""
    query_lower = query.lower()
    
    # Wikipedia search
    if 'wikipedia' in query_lower:
        print("🔍 Searching Wikipedia...")
        speak('Searching Wikipedia...')
        search_term = query_lower.replace("wikipedia", "").strip()
        try:
            results = wikipedia.summary(search_term, sentences=2) 
            print(f"[Wikipedia]: {results}")
            speak("According to Wikipedia")
            speak(results)
        except Exception as e:
            speak("Sorry, I couldn't find that on Wikipedia")
            print(f"[Wikipedia Error]: {e}")
            
    # Web browsing & Searching
    elif 'search google for' in query_lower:
        search_term = query_lower.replace("search google for", "").strip()
        speak(f"Searching Google for {search_term}")
        webbrowser.open(f"https://www.google.com/search?q={search_term}")
    elif 'search youtube for' in query_lower:
        search_term = query_lower.replace("search youtube for", "").strip()
        speak(f"Searching YouTube for {search_term}")
        webbrowser.open(f"https://www.youtube.com/results?search_query={search_term}")
    elif 'open youtube' in query_lower:
        speak("Opening YouTube")
        webbrowser.open("https://www.youtube.com")
    elif 'open google' in query_lower:
        speak("Opening Google")
        webbrowser.open("https://www.google.com")
        
    # Music player
    elif 'play music' in query_lower:
        music_dir = r'C:\Users\Rahul\Music'
        try:
            if os.path.exists(music_dir):
                songs = os.listdir(music_dir)
                if songs:
                    print(songs)    
                    os.startfile(os.path.join(music_dir, songs[0]))
                    speak("Playing music")
                else:
                    speak("No music files found")
            else:
                speak("Music directory not found")
        except Exception as e:
            speak("Error playing music")
            print(f"Music error: {e}")

    # Time query
    elif 'time' in query_lower:
        strTime = datetime.datetime.now().strftime("%H:%M:%S")    
        print(f"[Time]: {strTime}")
        speak(f"Sir, the time is {strTime}")

    # Open apps
    elif 'open code' in query_lower or 'open vs code' in query_lower:
        speak("Opening VS Code")
        codePath = "C:\\Users\\Rahul\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"
        try:
            os.startfile(codePath)
        except Exception as e:
            speak("Could not open VS Code")
            print(f"Code editor error: {e}")
    elif 'open calculator' in query_lower:
        speak("Opening Calculator")
        try:
            subprocess.Popen('calc.exe')
        except:
            speak("Could not open calculator")
    elif 'open notepad' in query_lower:
        speak("Opening Notepad")
        try:
            subprocess.Popen('notepad.exe')
        except:
            speak("Could not open notepad")
    elif 'open file explorer' in query_lower or 'open explorer' in query_lower:
        speak("Opening File Explorer")
        try:
            subprocess.Popen('explorer.exe')
        except:
            speak("Could not open file explorer")

    # Weather
    elif 'weather' in query_lower:
        print("[Weather] Checking weather...")
        speak("Let me check the weather")
        weather_info = get_weather(query_lower)
        print(f"[Weather]: {weather_info}")
        speak(weather_info)

    # News
    elif 'news' in query_lower:
        print("[News] Fetching news...")
        speak("Let me get the latest news")
        news_info = get_news()
        print(f"[News]: {news_info}")
        speak(news_info)

    # Joke
    elif 'joke' in query_lower:
        print("[Joke] Thinking of a joke...")
        speak("Here is a joke for you")
        joke = askGemini("Tell me a funny joke")
        print(f"[Joke]: {joke}")
        speak(joke)

    # Notes
    elif 'create a note' in query_lower or 'take a note' in query_lower:
        speak("What should I write?")
        note_content = takeCommand()
        if note_content != "None":
            try:
                with open("notes.txt", "a") as f:
                    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    f.write(f"[{timestamp}] {note_content}\n")
                speak("Note saved successfully.")
            except Exception as e:
                speak("Sorry, I could not save the note.")
    elif 'show notes' in query_lower:
        speak("Showing your notes")
        try:
            os.startfile("notes.txt")
        except Exception as e:
            speak("No notes found or could not open notes.")

    # Reminders
    elif 'set a reminder' in query_lower or 'set an alarm' in query_lower:
        speak("What should I remind you about?")
        rem_msg = takeCommand()
        if rem_msg != "None":
            speak("In how many minutes or seconds?")
            rem_time = takeCommand()
            if rem_time != "None":
                if set_reminder(rem_time.lower(), rem_msg):
                    speak(f"Okay, I will remind you to {rem_msg} in {rem_time}.")
                else:
                    speak("Sorry, I didn't understand the time format.")

    # Email
    elif 'email' in query_lower:
        try:
            speak("What should I say?")
            content = takeCommand()
            if content != "None":
                to = "khawshirahul74@gmail.com"    
                if sendEmail(to, content):
                    speak("Email has been sent successfully!")
                else:
                    speak("Sorry, I couldn't send the email")
        except Exception as e:
            print(e)
            speak("Sorry, I am not able to send this email")
    
    # Exit commands
    elif 'stop' in query_lower or 'exit' in query_lower or 'quit' in query_lower:
        speak("Goodbye!")
        return False

    # Remember command: "remember <fact>"
    elif query_lower.startswith('remember '):
        fact = query[len('remember '):].strip()
        if fact:
            if memory.remember(fact):
                print(f"[Memory] Remembered: '{fact}'")
                speak("Okay, I will remember that.")
            else:
                speak("Sorry, I couldn't save that memory.")
        else:
            speak("I didn't catch what you want me to remember.")
        return True

    # Recall commands
    elif 'what do you remember' in query_lower or query_lower.strip() == 'what do you remember':
        mems = memory.load_memories()
        if mems:
            print("[Memory] Here are the things I remember:")
            speak("Here are the things I remember:")
            for m in mems:
                print(f"   * {m}")
                speak(m)
        else:
            speak("I don't remember anything yet.")
        return True
    elif query_lower.startswith('recall '):
        search = query[len('recall '):].strip()
        results = memory.recall(search)
        if results:
            print(f"[Memory] Found {len(results)} matching memories for '{search}':")
            speak(f"I found {len(results)} matching memory items:")
            for r in results:
                print(f"   * {r}")
                speak(r)
        else:
            speak("No matching memories found.")
        return True
        
    # Default: Use Gemini API for all other queries
    else:
        print(f"[Thinking]: '{query}'")
        answer = askGemini(query)
        print(f"[Response]: {answer}")
        speak(answer)
    
    return True

def water_reminder_worker():
    while True:
        # Sleep for 1 hour (3600 seconds)
        time.sleep(3600)
        try:
            notification.notify(
                title="Persona AI Reminder",
                message="It's been an hour. Please drink some water to stay hydrated!",
                app_icon=None,
                timeout=10,
            )
            speak("Sir, it's been an hour. Please drink some water to stay hydrated.")
        except Exception as e:
            print(f"Water reminder error: {e}")

def start_voice_assistant(user_id=None):
    if user_id:
        import memory
        memory.set_current_user(user_id)

    # Start the water reminder background thread
    water_thread = threading.Thread(target=water_reminder_worker)
    water_thread.daemon = True
    water_thread.start()

    wishMe()
    while True:
        try:
            print("\nListening for your command...")
            query = takeCommand()
            
            if not query or (isinstance(query, str) and query.lower() == "none"):
                continue
            
            # Process the query and check if we should continue
            should_continue = processQuery(query)
            if not should_continue:
                break
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            speak("Goodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")
            speak("An error occurred. Please try again.")

if __name__ == "__main__":
    start_voice_assistant()      


