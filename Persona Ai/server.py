from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import database
import memory
import persona_ai_text
import hybrid_ai
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

app = FastAPI(title="Persona AI Web System")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    user_id: int = 1

class MemoryRequest(BaseModel):
    fact: str
    user_id: int = 1

@app.on_event("startup")
async def startup_event():
    database.init_db()
    # Ensure default user exists
    database.ensure_default_user()

@app.get("/")
async def root():
    return {"status": "online", "message": "Persona AI Backend System is running"}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        memory.set_current_user(request.user_id)
        response = persona_ai_text.askGemini(request.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/remember")
async def remember(request: MemoryRequest):
    try:
        memory.set_current_user(request.user_id)
        success = memory.remember(request.fact)
        return {"success": success, "message": "Memory stored" if success else "Failed to store memory"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test-api")
async def test_api():
    try:
        # Try to list models as a connection test
        persona_ai_text.client.models.list()
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/memories/{user_id}")
async def get_memories(user_id: int):
    try:
        memory.set_current_user(user_id)
        mems = memory.load_memories()
        return {"memories": mems}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket client connected.")
    try:
        # Send initial welcome greeting
        await websocket.send_json({
            "type": "greeting",
            "message": "System active. Scientific robotic assistant is ready for chat."
        })
        
        while True:
            data = await websocket.receive_text()
            try:
                message_json = json.loads(data)
                msg_type = message_json.get("type")
                
                if msg_type == "chat_message":
                    session_id = message_json.get("session_id", "default_session")
                    user_message = message_json.get("message", "")
                    
                    # Generate hybrid AI response
                    result = hybrid_ai.generate_response(user_message, session_id)
                    
                    # Send response back to UE5
                    await websocket.send_json({
                        "type": "ai_response",
                        "session_id": session_id,
                        "response": result["response"],
                        "model": result["model"],
                        "mode": result["mode"]
                    })
                    
                elif msg_type == "get_sessions":
                    sessions = database.get_chat_sessions()
                    await websocket.send_json({
                        "type": "sessions_list",
                        "sessions": sessions
                    })
                    
                elif msg_type == "load_session":
                    session_id = message_json.get("session_id", "default_session")
                    history = database.get_chat_history(session_id)
                    await websocket.send_json({
                        "type": "chat_history",
                        "session_id": session_id,
                        "history": history
                    })
                    
                else:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Unknown message type: {msg_type}"
                    })
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                print(f"Error handling websocket message: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": f"Server error: {str(e)}"
                })
    except WebSocketDisconnect:
        print("WebSocket client disconnected.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
