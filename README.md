# PERSONA AI - Desktop Voice Assistant

Welcome to the world of PERSONA AI – An intelligent voice-activated desktop assistant powered by AI.

## Key Features

- **Voice Input & Output**: Speak to the assistant and get voice responses back
- **Email Automation**: Send emails seamlessly using voice commands.
- **Music Player**: Play your favorite music effortlessly with voice controls.
- **Wikipedia Search**: Get instant information by instructing PERSONA AI to perform Wikipedia searches.
- **Web Browsing**: Open websites like Google, YouTube, and more, directly from your voice assistant.
- **Code Editor/IDE Integration**: Launch your preferred code editor or IDE instantly with voice activation.
- **AI-Powered Responses**: Use Gemini API to answer complex queries and get intelligent responses.
- **Time Announcements**: Ask for the current time and get voice feedback.
- **Persistent Memory**: Remember facts and recall them later with "Remember" and "Recall" commands.

## Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Gemini API Key
1. Get your free API key from: https://makersuite.google.com/app/apikey
2. Open the `.env` file in this directory
3. Replace `your-gemini-api-key-here` with your actual API key

### 3. Configure Email Settings (Optional)
Edit the `persona-ai.py` file and update:
- `youremail@gmail.com` with your Gmail address
- `your-password` with your Gmail app password

### 4. Customize File Paths
Update the following paths in `persona-ai.py`:
- **Music Directory**: Change `C:\Users\Rahul\Music` to your music folder
- **VS Code Path**: Update the VS Code installation path if different

## Usage

Run the assistant:
```bash
python persona-ai.py
```

### Voice Commands Examples

- "Wikipedia [topic]" - Search Wikipedia
- "Open Google" / "Open YouTube" - Open websites
- "Play music" - Play music from your library
- "What's the time?" - Get current time
- "Open code" - Launch VS Code
- "Ask [question]" - Ask Gemini for information
- "Remember [fact]" - Store a fact in memory
- "What do you remember?" - Recall all stored facts
- "Recall [topic]" - Search for specific memories
- "Exit" / "Stop" - Close the assistant

## Voice Output (Latest Update)

The assistant now uses **Windows native Text-to-Speech** for reliable voice output:
- ✅ Greeting message is spoken when you start the app
- ✅ All Gemini API responses are spoken to you
- ✅ Memory confirmations are spoken
- ✅ Special commands provide spoken feedback

**Requirements for voice output:**
- Windows operating system (PowerShell is built-in)
- Speakers or headphones connected
- System volume turned on

## Requirements

- Python 3.7+
- Microphone (for voice input)
- Speaker/Headphones (for voice output)
- Internet connection (for APIs)
- Windows operating system (for voice output via PowerShell)

## Notes

- Make sure your microphone is working properly
- The voice recognition works best in quiet environments
- Gemini API key is required for AI-powered features
- Voice output uses Windows built-in Text-to-Speech (no additional TTS engine needed)

## Troubleshooting

- **No voice output**: Check Windows system volume and ensure speakers are connected
- **Voice recognition doesn't work**: Check your microphone and ensure it's set as default
- **Email fails**: Ensure you've enabled "Less secure apps" or use an app password
- **Gemini API fails**: Verify your API key is correct in the `.env` file
- **Test voice output**: Run `python quick_test_voice.py` to test voice separately

Enjoy your personal AI assistant!
