"""
Text-based Persona AI - For testing without voice input
Type your questions and get AI responses
"""

import os

try:
    import google.generativeai as genai
except ImportError:
    from google import genai

import memory
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY or GEMINI_API_KEY == 'your-gemini-api-key-here':
    print("ERROR: Gemini API key not configured!")
    print("Please add your API key to the .env file")

try:
    genai.configure(api_key=GEMINI_API_KEY)
except Exception:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception:
        gemini_client = None

def askGemini(query):
    """Use Gemini API to answer user queries"""
    try:
        # include recent memories in the prompt
        memories = memory.load_memories()
        if memories:
            mem_context = "User memories: " + "; ".join(memories[-10:])
            prompt = f"{mem_context}\n\n{query}"
        else:
            prompt = query

        if hasattr(genai, 'GenerativeModel'):
            model = genai.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content(prompt)
            return response.text

        if 'gemini_client' in globals() and globals().get('gemini_client'):
            response = globals()['gemini_client'].models.generate_content(model='gemini-2.0-flash', contents=prompt)
            return getattr(response, 'text', str(response))

        if hasattr(genai, 'generate_text'):
            response = genai.generate_text(model='gemini-2.0-flash', prompt=prompt)
            return getattr(response, 'text', str(response))

        if hasattr(genai, 'client') and getattr(genai, 'client'):
            response = genai.client.models.generate_content(model='gemini-2.0-flash', contents=prompt)
            return getattr(response, 'text', str(response))

        return "Sorry, I couldn't connect to Gemini right now."
    except Exception as e:
        print(f"Error with Gemini API: {e}")
        return "Sorry, I couldn't process that request."


def start_text_assistant(user_id=None):
    if user_id:
        memory.set_current_user(user_id)
    print("=" * 70)
    print("PERSONA AI - Text Mode (For Testing)")
    print("=" * 70)
    print("\nI'm Persona AI. Ask me anything!")
    print("Commands:")
    print("  - Type your question or statement")
    print("  - Type 'exit' or 'quit' to close")
    print("  - Type 'clear' to clear screen")
    print("=" * 70)
    
    while True:
        try:
            user_input = input("\nYou: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['exit', 'quit', 'bye', 'goodbye']:
                print("\n[Persona AI]: Goodbye! Have a great day!")
                break
            
            if user_input.lower() == 'clear':
                os.system('cls' if os.name == 'nt' else 'clear')
                continue

            # Remember command
            if user_input.lower().startswith('remember '):
                fact = user_input[len('remember '):].strip()
                if fact:
                    if memory.remember(fact):
                        print("[Persona AI]: Okay, I will remember that.")
                    else:
                        print("[Persona AI]: Sorry, I couldn't save that memory.")
                else:
                    print("[Persona AI]: I didn't catch what you want me to remember.")
                continue

            # Recall commands
            if user_input.lower() == 'what do you remember' or user_input.lower() == 'what do you remember?':
                mems = memory.load_memories()
                if mems:
                    print("[Persona AI]: Here are the things I remember:")
                    for m in mems:
                        print(f" - {m}")
                else:
                    print("[Persona AI]: I don't remember anything yet.")
                continue
            if user_input.lower().startswith('recall '):
                search = user_input[len('recall '):].strip()
                results = memory.recall(search)
                if results:
                    print(f"[Persona AI]: I found {len(results)} matching memory items:")
                    for r in results:
                        print(f" - {r}")
                else:
                    print("[Persona AI]: No matching memories found.")
                continue
            
            response = askGemini(user_input)
            print(f"[Persona AI]: {response}")
            
        except KeyboardInterrupt:
            print("\n\n[Persona AI]: Goodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    start_text_assistant()
