import httpx
import json

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "llama3.2:3b"

SYSTEM_PROMPT = (
    "You are PersonaAI, an intelligent, empathetic, and encouraging personal wellness assistant. "
    "You communicate in a warm, concise, and natural conversational tone suitable for voice conversations. "
    "Keep responses clear and conversational (usually 1-3 sentences unless detailed explanation is requested)."
)

async def generate_response_local(prompt: str, history: list) -> str:
    """
    Calls the local Ollama instance running on localhost:11434.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add recent history (up to last 6 messages)
    for msg in history[-6:]:
        role = "user" if msg.role == "user" else "assistant"
        messages.append({"role": role, "content": msg.message})
        
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": DEFAULT_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
            if response.status_code == 200:
                data = response.json()
                return data.get("message", {}).get("content", "").strip()
            
            # Fallback to generate endpoint if chat endpoint isn't supported on older Ollama
            gen_prompt = f"{SYSTEM_PROMPT}\n\n"
            for m in messages[1:]:
                gen_prompt += f"{m['role'].capitalize()}: {m['content']}\n"
            gen_prompt += "Assistant: "
            
            gen_payload = {
                "model": DEFAULT_MODEL,
                "prompt": gen_prompt,
                "stream": False
            }
            gen_resp = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=gen_payload)
            gen_resp.raise_for_status()
            return gen_resp.json().get("response", "").strip()
    except Exception as e:
        print(f"[Ollama Error]: {e}")
        return f"I'm here with you, but encountered a connection issue with the local Ollama LLM ({str(e)}). Please verify Ollama is running on localhost:11434."
