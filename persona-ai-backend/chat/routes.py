from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from db.database import SessionLocal
from auth.models import User, ChatMessage
from chat.llm_local import generate_response_local
from chat.llm_online_fallback import generate_response_fallback
from config import settings
import json
from jose import jwt, JWTError

router = APIRouter(prefix="/chat", tags=["Chat"])

def get_user_from_token(token: str, db: Session):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            return None
        return db.query(User).filter(User.username == username).first()
    except JWTError:
        return None

@router.websocket("/ws")
async def websocket_chat(websocket: WebSocket, token: str):
    await websocket.accept()
    
    db = SessionLocal()
    user = get_user_from_token(token, db)
    
    if not user:
        await websocket.send_text(json.dumps({"error": "Authentication failed"}))
        await websocket.close()
        db.close()
        return

    try:
        while True:
            # Receive user message
            data = await websocket.receive_text()
            
            try:
                msg_data = json.loads(data)
                message_text = msg_data.get("message", "")
            except json.JSONDecodeError:
                message_text = data
                
            if not message_text.strip():
                continue
            
            # Save user message
            user_msg = ChatMessage(user_id=user.id, role="user", message=message_text)
            db.add(user_msg)
            db.commit()
            
            # Get history (last 5 messages)
            history = db.query(ChatMessage).filter(ChatMessage.user_id == user.id).order_by(ChatMessage.created_at.desc()).limit(5).all()
            history.reverse() # chronological order
            
            # Recall semantic memory from ChromaDB
            from chat.memory import recall_memory, store_memory
            semantic_context = recall_memory(user.id, message_text)
            
            # Check for OS Action Intents (e.g., "open youtube")
            msg_lower = message_text.lower().strip()
            
            from os_actions.allowlist import ALLOWLIST
            import subprocess
            import webbrowser
            
            app_to_open = None
            if "open " in msg_lower:
                # First check if any known app is mentioned
                for app in ALLOWLIST.keys():
                    if app in msg_lower:
                        app_to_open = app
                        break
                
                # If no known app but strictly starts with "open", capture for unknown app response
                if not app_to_open and msg_lower.startswith("open "):
                    parts = msg_lower.replace("open ", "").strip().split()
                    if parts:
                        app_to_open = parts[0]
                        
            if app_to_open:
                if app_to_open in ALLOWLIST:
                    try:
                        target = ALLOWLIST[app_to_open]
                        if target.startswith("http") or target.endswith("://") or target.endswith(":"):
                            webbrowser.open(target)
                        else:
                            subprocess.Popen(target, shell=True)
                        response_text = f"Opening {app_to_open} right now."
                    except Exception as e:
                        response_text = f"I tried to open {app_to_open}, but encountered an error: {e}"
                else:
                    response_text = f"I don't have permission to open {app_to_open}. It is not in my allowlist."
            else:
                # Generate response using LLM
                if settings.USE_ONLINE_FALLBACK:
                    prompt_with_context = f"{semantic_context}\n{message_text}" if semantic_context else message_text
                    response_text = await generate_response_fallback(prompt_with_context, history)
                else:
                    # For local LLM, we can pass semantic_context inside the history or modify the prompt
                    prompt_with_context = f"{semantic_context}\n{message_text}" if semantic_context else message_text
                    response_text = await generate_response_local(prompt_with_context, history)
                
            # Save assistant message to DB
            assistant_msg = ChatMessage(user_id=user.id, role="assistant", message=response_text)
            db.add(assistant_msg)
            db.commit()
            
            # Store in semantic memory
            store_memory(user.id, message_text, "user")
            store_memory(user.id, response_text, "assistant")
            
            # Synthesize TTS
            from voice.tts import synthesize
            import base64
            try:
                audio_bytes = synthesize(response_text)
                audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
            except Exception as e:
                print("TTS Error:", e)
                audio_b64 = None
            
            # Send response back with audio
            payload = {"role": "assistant", "message": response_text}
            if audio_b64:
                payload["audio"] = audio_b64
                
            await websocket.send_text(json.dumps(payload))
            
    except WebSocketDisconnect:
        print(f"Client #{user.id} disconnected")
    finally:
        db.close()
