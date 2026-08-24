import asyncio
import websockets
import json
import sys

async def run_client():
    uri = "ws://localhost:8000/ws"
    print(f"Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")
            
            # Receive greeting
            greeting_msg = await websocket.recv()
            greeting = json.loads(greeting_msg)
            print(f"\n[Server Greeting] {greeting.get('message')}")
            
            # 1. Send chat message
            session_id = "test_session_ue5"
            test_prompt = "Hello robot, this is a test from Unreal Engine mock client!"
            print(f"\n[User] Sending message: '{test_prompt}'")
            
            chat_payload = {
                "type": "chat_message",
                "session_id": session_id,
                "message": test_prompt
            }
            await websocket.send(json.dumps(chat_payload))
            
            # Receive AI response
            response_msg = await websocket.recv()
            response = json.loads(response_msg)
            print(f"\n[AI Response]")
            print(f"  - Message: {response.get('response')}")
            print(f"  - Model Used: {response.get('model')}")
            print(f"  - Mode: {response.get('mode')}")
            
            # 2. Query all sessions
            print(f"\n[User] Fetching all chat sessions...")
            sessions_payload = {
                "type": "get_sessions"
            }
            await websocket.send(json.dumps(sessions_payload))
            
            sessions_msg = await websocket.recv()
            sessions_res = json.loads(sessions_msg)
            print(f"[Server Sessions List] {sessions_res.get('sessions')}")
            
            # 3. Load session history
            print(f"\n[User] Loading history for session '{session_id}'...")
            load_payload = {
                "type": "load_session",
                "session_id": session_id
            }
            await websocket.send(json.dumps(load_payload))
            
            history_msg = await websocket.recv()
            history_res = json.loads(history_msg)
            print(f"[Server Session History] (Count: {len(history_res.get('history', []))})")
            for chat in history_res.get('history', []):
                print(f"  - {chat.get('sender').upper()}: {chat.get('message')} [Model: {chat.get('model_used') or 'N/A'}]")
                
            print("\nVerification of websocket communication successfully complete!")
            
    except ConnectionRefusedError:
        print("\nConnection Refused! Make sure server.py is running on port 8000 first.")
        sys.exit(1)
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_client())
