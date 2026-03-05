"""Test if Windows audio output works with alternative methods"""
import os
import sys
import pyttsx3
import subprocess
import time

print("=" * 60)
print("Testing Audio Output on Windows")
print("=" * 60)

# Method 1: Check system volume
print("\n[METHOD 1] Checking System Volume Settings...")
try:
    result = subprocess.run(
        ['powershell', '-Command', '(Get-Volume).Mute'],
        capture_output=True,
        text=True,
        timeout=5
    )
    print(f"  Mute status: {result.stdout.strip()}")
except Exception as e:
    print(f"  Error checking volume: {e}")

# Method 2: Direct pyttsx3 test with event listeners
print("\n[METHOD 2] Testing pyttsx3 with Event Listeners...")
engine = pyttsx3.init()
engine.setProperty('rate', 150)
engine.setProperty('volume', 1.0)

events_fired = {'start': 0, 'end': 0}

def on_start(name):
    events_fired['start'] += 1
    print(f"  [EVENT] Utterance started (count: {events_fired['start']})")

def on_end(name):
    events_fired['end'] += 1
    print(f"  [EVENT] Utterance ended (count: {events_fired['end']})")

try:
    engine.connect('started-utterance', on_start)
    engine.connect('finished-utterance', on_end)
except:
    print("  Warning: Could not connect event listeners")

print("  Speaking: 'Hello, this is a test message'")
engine.say("Hello, this is a test message")
result = engine.runAndWait()
print(f"  Engine result: {result}")
print(f"  Events fired - Start: {events_fired['start']}, End: {events_fired['end']}")

# Method 3: Try PowerShell Speak-Object (Windows-native)
print("\n[METHOD 3] Testing Windows Native Text-to-Speech (PowerShell)...")
try:
    ps_code = """
    Add-Type -AssemblyName System.Speech
    $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $speak.Speak('This is Windows native text to speech')
    """
    result = subprocess.run(
        ['powershell', '-Command', ps_code],
        capture_output=True,
        text=True,
        timeout=10
    )
    print(f"  PowerShell speech executed")
    if result.stderr:
        print(f"  Errors: {result.stderr}")
except Exception as e:
    print(f"  Error: {e}")

print("\n" + "=" * 60)
print("AUDIO OUTPUT TEST COMPLETE")
print("=" * 60)
print("\nListen for voice output during tests above.")
print("If you hear audio ONLY from Method 3 (PowerShell),")
print("then pyttsx3 is not properly connected to audio.")
