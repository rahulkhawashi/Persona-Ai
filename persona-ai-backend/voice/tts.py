import pyttsx3
import tempfile
import os

def synthesize(text: str) -> bytes:
    """
    Synthesizes text to speech using pyttsx3.
    Returns the raw audio bytes (WAV format).
    """
    if not text:
        return b""
        
    engine = pyttsx3.init()
    
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        temp_path = f.name
        
    engine.save_to_file(text, temp_path)
    engine.runAndWait()
    
    with open(temp_path, "rb") as f:
        audio_data = f.read()
        
    os.remove(temp_path)
    return audio_data
