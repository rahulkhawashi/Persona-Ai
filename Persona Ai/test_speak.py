"""Test pyttsx3 voice output"""
import pyttsx3

print("Initializing pyttsx3...")
engine = pyttsx3.init()

print("Getting available voices...")
voices = engine.getProperty('voices')
print(f"Found {len(voices)} voice(s):")
for i, voice in enumerate(voices):
    print(f"  {i}: {voice.name}")

if voices:
    engine.setProperty('voice', voices[0].id)
    print(f"Selected voice: {voices[0].name}")

print("Setting speech rate to 150...")
engine.setProperty('rate', 150)

print("\nTesting voice output...")
print("[Test 1] Simple message:")
engine.say("Hello, I am Persona AI")
engine.runAndWait()

print("\n[Test 2] Answer simulation:")
engine.say("The prime minister of India is Narendra Modi")
engine.runAndWait()

print("\n[Test 3] Longer response:")
engine.say("Python is a high-level, interpreted programming language known for its simplicity and readability.")
engine.runAndWait()

print("\nVoice test complete!")
