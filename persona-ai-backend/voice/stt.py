import json
# Using a simple stub since full Vosk requires downloading a heavy model.
# In production, you would initialize vosk.Model here.

def transcribe(audio_bytes: bytes) -> str:
    """
    Transcribes audio bytes to text.
    (Stub implementation for now. Replace with actual Vosk code when the model is downloaded.)
    """
    if not audio_bytes:
        return ""
    
    # Placeholder: this would run vosk.KaldiRecognizer
    return "[Audio transcribed locally]"
