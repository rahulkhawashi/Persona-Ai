"""Debug pyttsx3 engine configuration"""
import pyttsx3

engine = pyttsx3.init()

print("=" * 50)
print("pyttsx3 Engine Debug Information")
print("=" * 50)

# Check available properties
print("\nEngine Properties:")
try:
    print(f"  Drivers available: {pyttsx3.drivers()}")
except:
    print(f"  Drivers: Unable to retrieve")

# Check voices
voices = engine.getProperty('voices')
print(f"\nAvailable Voices: {len(voices)}")
for voice in voices:
    print(f"  - {voice.name} (ID: {voice.id})")

# Check current settings
print(f"\nCurrent Settings:")
print(f"  Rate: {engine.getProperty('rate')}")
print(f"  Volume: {engine.getProperty('volume')}")
print(f"  Voice: {engine.getProperty('voice')}")

# Set to first available voice
if voices:
    engine.setProperty('voice', voices[0].id)
    print(f"\nSet voice to: {voices[0].name}")

# Set reasonable defaults
engine.setProperty('rate', 150)
engine.setProperty('volume', 1.0)

print("\n" + "=" * 50)
print("Attempting to speak with debug info")
print("=" * 50)

# Use engine listeners to get debug info
def onStart():
    print("[EVENT] Engine started")

def onEnd():
    print("[EVENT] Engine ended")

engine.connect('started-utterance', onStart)
engine.connect('finished-utterance', onEnd)

print("\nSpeaking: 'Can you hear me?'")
engine.say("Can you hear me?")
result = engine.runAndWait()
print(f"Result: {result}")

print("\nDone.")
