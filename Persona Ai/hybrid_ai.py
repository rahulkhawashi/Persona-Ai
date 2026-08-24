import os
import socket
import requests
import json
import database
import memory
from dotenv import load_dotenv

# Ensure environment variables are loaded with override
load_dotenv(override=True)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Initialize Gemini SDK client (Legacy vs New SDK compatibility)
gemini_client = None
legacy_genai = None

try:
    from google import genai
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
except ImportError:
    try:
        import google.generativeai as legacy_genai
        if GEMINI_API_KEY:
            legacy_genai.configure(api_key=GEMINI_API_KEY)
    except ImportError:
        pass

def is_online() -> bool:
    """Detect if the system has an active internet connection."""
    try:
        # Check connection by pinging Google DNS (8.8.8.8) on port 53
        socket.setdefaulttimeout(1.5)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect(("8.8.8.8", 53))
        return True
    except (socket.error, socket.timeout):
        return False

def query_gemini(prompt: str) -> str:
    """Generate response using Gemini API."""
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key is not configured.")
        
    # Use new SDK client if available
    if gemini_client:
        response = gemini_client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        return getattr(response, 'text', str(response))
        
    # Fallback to legacy SDK if available
    if legacy_genai:
        model = legacy_genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        return response.text
        
    raise RuntimeError("No Google Gemini SDK installed.")

def query_mistral_local(prompt: str) -> str:
    """Generate response using a local Ollama server running Mistral 7B."""
    ollama_url = "http://localhost:11434/api/generate"
    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    }
    
    # Try querying the local Ollama instance
    try:
        response = requests.post(ollama_url, json=payload, timeout=5.0)
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "").strip()
    except requests.exceptions.RequestException:
        pass
        
    # Fallback to an intelligent offline simulator if Ollama is unavailable
    return generate_offline_simulation(prompt)

def generate_offline_simulation(prompt: str) -> str:
    """Provide a simulated, friendly response for local testing when offline and Ollama is missing."""
    p_lower = prompt.lower()
    
    # Retrieve local memories for context if user asks about memory
    memories_context = ""
    memories = memory.load_memories()
    if memories:
        memories_context = "\nMy offline database contains these memories: " + "; ".join(memories[-5:])
    
    if any(g in p_lower for g in ["hello", "hi", "hey", "greetings"]):
        return "[Offline Mode - Mistral 7B Simulator]\nHello human! I am operating in offline mode. How can I assist you locally today?"
        
    if "time" in p_lower:
        import datetime
        now = datetime.datetime.now().strftime("%I:%M %p")
        return f"[Offline Mode - Mistral 7B Simulator]\nThe current local system time is {now}."
        
    if "remember" in p_lower or "recall" in p_lower or "memory" in p_lower:
        if memories_context:
            return f"[Offline Mode - Mistral 7B Simulator]\nHere is what I remember from our local database:{memories_context}"
        return "[Offline Mode - Mistral 7B Simulator]\nI don't have any local memories stored in my SQLite database yet."
        
    return (
        f"[Offline Mode - Mistral 7B Simulator]\n"
        f"Received prompt: '{prompt}'\n\n"
        f"I am currently running in Offline Mode using a local simulation of Mistral 7B. "
        f"Connect to the internet to activate Gemini API, or run Ollama with the 'mistral' model locally on port 11434 to get real offline responses."
    )

def generate_response(prompt: str, session_id: str) -> dict:
    """Coordinate online/offline model selection, generate response, and save to DB."""
    # First, save the user message to history
    database.save_chat_message(session_id, "user", prompt)
    
    # Check connectivity
    online = is_online()
    response_text = ""
    model_name = ""
    mode = ""
    
    # Load past local memories to inject context if available (standard assistant behavior)
    memories = memory.load_memories()
    if memories:
        mem_context = "Recall Context (Recent facts user wants you to remember): " + "; ".join(memories[-10:])
        full_prompt = f"{mem_context}\n\nUser: {prompt}"
    else:
        full_prompt = prompt
        
    if online:
        try:
            model_name = "gemini-2.0-flash"
            mode = "online"
            response_text = query_gemini(full_prompt)
        except Exception as e:
            # If online API fails (e.g. rate limit/429/auth error), fallback to offline
            print(f"Online Gemini failed ({e}). Falling back to Offline mode...")
            model_name = "mistral-7b-local"
            mode = "offline"
            response_text = query_mistral_local(full_prompt)
    else:
        model_name = "mistral-7b-local"
        mode = "offline"
        response_text = query_mistral_local(full_prompt)
        
    # Save the AI response to history
    database.save_chat_message(session_id, "ai", response_text, model_name)
    
    return {
        "response": response_text,
        "model": model_name,
        "mode": mode
    }
