"""Test the new PowerShell-based speak function"""
import subprocess
import time

def speak_powershell(audio):
    """Speak the given audio text using Windows native TTS"""
    try:
        if not audio or not str(audio).strip():
            print("[DEBUG] Empty audio, skipping speak")
            return
        
        # Convert to string and remove problematic characters
        audio_text = str(audio)
        # Remove emojis and special chars that might cause TTS issues
        audio_text = ''.join(char if ord(char) < 128 else ' ' for char in audio_text)
        audio_text = audio_text[:500].strip()  # Limit to 500 chars
        
        if not audio_text:
            print("[DEBUG] Audio text empty after cleaning")
            return
        
        print(f"[SPEAKING] {audio_text}")
        
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
        print(f"[WARNING] Voice output failed, but text output should still show above")

# Test it
print("=" * 50)
print("Testing New PowerShell-based speak()")
print("=" * 50)

print("\n[TEST 1] Greeting")
speak_powershell("Good Evening, I am Persona AI")
time.sleep(1)

print("\n[TEST 2] Long response")
long_text = "This is a simulated Gemini response. It contains multiple sentences and explains a complex topic with detailed information and comprehensive explanation."
speak_powershell(long_text)
time.sleep(1)

print("\n[TEST 3] Short response")
speak_powershell("Done with testing")

print("\n" + "=" * 50)
print("Test complete!")
print("=" * 50)
