import app
import os
import sys

def test_flow():
    print("Testing GUI flow...")
    test_app = app.PersonaApp()
    
    def simulate_user():
        import random
        r = random.randint(1000, 9999)
        print("Simulating user registration...")
        test_app.login_frame.username_entry.insert(0, f"testuser{r}")
        test_app.login_frame.password_entry.insert(0, "testpass")
        
        # Click register
        test_app.login_frame.register()
        
        # Check if dashboard is packed
        if test_app.dashboard_frame and test_app.dashboard_frame.winfo_ismapped():
            print("SUCCESS: Dashboard frame is visible!")
            # Test text assistant
            test_app.dashboard_frame.chat_input.insert(0, "Hello AI")
            test_app.dashboard_frame.send_message()
            print("Message sent. Check chat history:")
            print(test_app.dashboard_frame.chat_history.get("1.0", "end"))
        else:
            print("ERROR: Dashboard frame not mapped. Registration might have failed.")
            print(f"Error Label Text: {test_app.login_frame.error_label.cget('text')}")
            
        print("Closing app in 2 seconds...")
        test_app.after(2000, test_app.destroy)
        
    test_app.after(1000, simulate_user)
    print("Starting mainloop...")
    test_app.mainloop()
    print("Mainloop finished.")

if __name__ == "__main__":
    test_flow()
