import customtkinter as ctk
from PIL import Image
import threading
import sys
import os

BASE_DIR = os.path.dirname(__file__)

import database
import memory

# Import the logic modules
import persona_ai
import persona_ai_text

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class PersonaApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        import queue
        self.gui_queue = queue.Queue()
        self.title("Persona AI - Advanced Desktop Assistant")
        self.geometry("1100x700")
        
        # Ensure database and default user
        self.current_user_id, self.current_username = database.ensure_default_user()
        memory.set_current_user(self.current_user_id)
        
        # Main Layout
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Sidebar (Navigation/Info)
        self.sidebar_frame = ctk.CTkFrame(self, width=200, corner_radius=0)
        self.sidebar_frame.grid(row=0, column=0, sticky="nsew")
        self.sidebar_frame.grid_rowconfigure(4, weight=1)

        self.logo_label = ctk.CTkLabel(self.sidebar_frame, text="PERSONA AI", font=ctk.CTkFont(size=24, weight="bold", family="Inter"))
        self.logo_label.grid(row=0, column=0, padx=20, pady=(20, 10))

        self.status_indicator = ctk.CTkLabel(self.sidebar_frame, text="● System Online", text_color="#4CAF50", font=ctk.CTkFont(size=12))
        self.status_indicator.grid(row=1, column=0, padx=20, pady=(0, 20))

        self.sidebar_button_1 = ctk.CTkButton(self.sidebar_frame, text="Dashboard", command=self.show_dashboard)
        self.sidebar_button_1.grid(row=2, column=0, padx=20, pady=10)

        self.sidebar_button_2 = ctk.CTkButton(self.sidebar_frame, text="Settings", command=lambda: print("Settings clicked"))
        self.sidebar_button_2.grid(row=3, column=0, padx=20, pady=10)

        self.bg_mode_switch = ctk.CTkSwitch(self.sidebar_frame, text="Background Mode", command=self.toggle_bg_mode)
        self.bg_mode_switch.grid(row=5, column=0, padx=20, pady=20)
        self.bg_mode_switch.select()

        # Dashboard Frame
        self.dashboard_frame = DashboardFrame(self, self.current_user_id, self.current_username)
        self.dashboard_frame.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        
        self.process_gui_queue()

    def process_gui_queue(self):
        import queue
        try:
            while True:
                callback, args, kwargs = self.gui_queue.get_nowait()
                try:
                    callback(*args, **kwargs)
                except Exception as e:
                    print(f"Error in GUI callback: {e}")
                self.gui_queue.task_done()
        except queue.Empty:
            pass
        self.after(100, self.process_gui_queue)

    def show_dashboard(self):
        self.dashboard_frame.tkraise()

    def toggle_bg_mode(self):
        if self.bg_mode_switch.get():
            print("Background mode enabled: AI will stay active when window is minimized.")
        else:
            print("Background mode disabled.")

class DashboardFrame(ctk.CTkFrame):
    def __init__(self, master, user_id, username):
        super().__init__(master, fg_color="transparent")
        self.user_id = user_id
        
        # Grid layout for Dashboard
        self.grid_columnconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=2)
        self.grid_rowconfigure(0, weight=1)

        # LEFT: Voice Assistant Panel
        self.voice_panel = ctk.CTkFrame(self, corner_radius=15)
        self.voice_panel.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        
        self.voice_label = ctk.CTkLabel(self.voice_panel, text="Voice Interaction", font=ctk.CTkFont(size=20, weight="bold"))
        self.voice_label.pack(pady=20)

        # Pulsing Mic Button (Simplified placeholder for premium look)
        self.mic_container = ctk.CTkFrame(self.voice_panel, fg_color="transparent")
        self.mic_container.pack(expand=True)

        try:
            mic_img_path = os.path.join(BASE_DIR, "assets", "3d_mic_button.png")
            if os.path.exists(mic_img_path):
                mic_image = ctk.CTkImage(light_image=Image.open(mic_img_path), size=(200, 200))
                self.voice_btn = ctk.CTkButton(self.mic_container, image=mic_image, text="", 
                                               fg_color="transparent", hover_color="#333333", 
                                               command=self.start_voice)
            else:
                raise FileNotFoundError
        except:
            self.voice_btn = ctk.CTkButton(self.mic_container, text="🎤", width=180, height=180, 
                                           corner_radius=90, font=ctk.CTkFont(size=60),
                                           command=self.start_voice)
        self.voice_btn.pack(pady=20)

        self.voice_status = ctk.CTkLabel(self.voice_panel, text="Tap to Activate Voice", text_color="gray")
        self.voice_status.pack(pady=10)

        # RIGHT: Chat Panel
        self.chat_panel = ctk.CTkFrame(self, corner_radius=15)
        self.chat_panel.grid(row=0, column=1, sticky="nsew", padx=(10, 0))
        
        self.chat_panel.grid_rowconfigure(0, weight=1)
        self.chat_panel.grid_columnconfigure(0, weight=1)

        self.chat_history = ctk.CTkTextbox(self.chat_panel, state="disabled", wrap="word", font=ctk.CTkFont(size=14))
        self.chat_history.grid(row=0, column=0, sticky="nsew", padx=15, pady=15)

        self.input_area = ctk.CTkFrame(self.chat_panel, fg_color="transparent")
        self.input_area.grid(row=1, column=0, sticky="ew", padx=15, pady=(0, 15))
        
        self.chat_input = ctk.CTkEntry(self.input_area, placeholder_text="Message Persona AI...", height=45)
        self.chat_input.pack(side="left", fill="x", expand=True, padx=(0, 10))
        self.chat_input.bind("<Return>", lambda e: self.send_message())

        self.send_btn = ctk.CTkButton(self.input_area, text="Send", width=80, height=45, command=self.send_message)
        self.send_btn.pack(side="right")

        self.append_chat("🤖 Persona AI: System ready. How can I help you today?\n\n")

    def append_chat(self, text):
        self.master.gui_queue.put((self._append_chat_safe, (text,), {}))

    def _append_chat_safe(self, text):
        self.chat_history.configure(state="normal")
        self.chat_history.insert("end", text)
        self.chat_history.see("end")
        self.chat_history.configure(state="disabled")

    def send_message(self):
        user_text = self.chat_input.get().strip()
        if not user_text: return
        
        self.chat_input.delete(0, 'end')
        self.append_chat(f"👤 You: {user_text}\n\n")
        
        # Memory commands handling
        if user_text.lower().startswith('remember '):
            fact = user_text[len('remember '):].strip()
            if memory.remember(fact):
                self.append_chat("🤖 Persona AI: Memory stored successfully.\n\n")
            else:
                self.append_chat("🤖 Persona AI: Failed to store memory.\n\n")
            return
            
        # AI Response
        threading.Thread(target=self.get_ai_response, args=(user_text,)).start()

    def get_ai_response(self, text):
        try:
            response = persona_ai_text.askGemini(text)
            self.append_chat(f"🤖 Persona AI: {response}\n\n")
        except Exception as e:
            self.append_chat(f"🤖 Persona AI: Error communicating with AI server.\n\n")

    def start_voice(self):
        self.voice_status.configure(text="Status: Listening...", text_color="#4CAF50")
        self.voice_btn.configure(state="disabled")
        threading.Thread(target=self.run_voice_thread, daemon=True).start()
        
    def run_voice_thread(self):
        try:
            persona_ai.start_voice_assistant(self.user_id)
        except Exception as e:
            print(f"Voice thread error: {e}")
        finally:
            self.master.gui_queue.put((self.voice_status.configure, (), {"text": "Tap to Activate Voice", "text_color": "gray"}))
            self.master.gui_queue.put((self.voice_btn.configure, (), {"state": "normal"}))

if __name__ == "__main__":
    app = PersonaApp()
    app.mainloop()
