import app
import database
import os
import sys
import time

def verify():
    print("=== Persona AI Verification System ===")
    
    # 1. Check Database
    print("Checking database...")
    try:
        database.init_db()
        print("[OK] Database initialized.")
    except Exception as e:
        print(f"[ERROR] Database error: {e}")
        return

    # 2. Test App Initialization
    print("Initializing PersonaApp...")
    try:
        test_app = app.PersonaApp()
        test_app.update() # Process events
        print("[OK] App initialized.")
    except Exception as e:
        print(f"[ERROR] App initialization error: {e}")
        return

    # 3. Check if we moved directly to dashboard
    if test_app.dashboard_frame and test_app.dashboard_frame.winfo_exists():
        print("[OK] Direct access successful. Dashboard created.")
        
        # 4. Test Text Assistant (Gemini)
        print("Testing Gemini Assistant...")
        test_app.dashboard_frame.chat_input.insert(0, "What is 2+2?")
        test_app.dashboard_frame.send_message()
        
        # Wait a bit for response (Gemini might take time)
        print("Waiting for AI response...")
        time.sleep(2)
        test_app.update()
        
        # Sanitize history for printing (remove emojis)
        history = test_app.dashboard_frame.chat_history.get("1.0", "end")
        clean_history = "".join(c for c in history if ord(c) < 128)
        print("\nChat History Snippet (Sanitized):")
        print("-" * 20)
        print(clean_history.strip()[-200:])
        print("-" * 20)

        if "Persona AI:" in history:
            print("[OK] Gemini Assistant responded.")
        else:
            print("[FAIL] Gemini Assistant failed to respond.")
            
        # 5. Test Memory
        print("Testing Memory module...")
        test_app.dashboard_frame.chat_input.delete(0, 'end')
        test_app.dashboard_frame.chat_input.insert(0, "remember my favorite color is blue")
        test_app.dashboard_frame.send_message()
        test_app.update()
        
        import memory
        mems = memory.load_memories()
        if any("favorite color is blue" in m.lower() for m in mems):
            print("[OK] Memory successfully saved to database.")
        else:
            print("[FAIL] Memory failed to save.")
            
    else:
        print("[FAIL] Dashboard not shown.")

    print("\nClosing verification app...")
    test_app.destroy()
    print("=== Verification Complete ===")

if __name__ == "__main__":
    verify()
