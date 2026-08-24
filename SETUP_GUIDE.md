# PERSONA AI - Setup & Usage Guide

## ✅ Setup Complete!

Your Persona AI assistant is now fully configured with Gemini API integration.

---

## 📁 Files Overview

### Main Files:
1. **persona-ai.py** - Full voice-based assistant with Gemini API
2. **persona-ai-text.py** - Text-based version (for testing without voice)
3. **test_gemini.py** - API functionality test
4. **.env** - Configuration file with your Gemini API key
5. **requirements.txt** - All dependencies

---

## 🚀 How to Run

### Option 1: Text-Based Assistant (Recommended for Testing)
```bash
python persona-ai-text.py
```
This lets you type questions instead of speaking. Perfect for testing!

### Option 2: Voice-Based Assistant (Full Feature)
```bash
python persona-ai.py
```
Requires a working microphone. The assistant will listen and respond with voice.

---

## 🤖 How It Works

### Text-Based Mode (persona-ai-text.py):
1. Run the script
2. Type your question or command
3. Press Enter
4. Persona AI will respond using Gemini API
5. Type 'exit' or 'quit' to close

### Voice-Based Mode (persona-ai.py):
1. Run the script
2. Persona AI says "I am Persona. Please tell me how may I help you"
3. Speak your question
4. Persona AI responds with voice

---

## 🎯 Available Commands

### Voice/Text Commands:

| Command | Action |
|---------|--------|
| "wikipedia [topic]" | Search Wikipedia |
| "open google" | Open Google in browser |
| "open youtube" | Open YouTube in browser |
| "play music" | Play music from your Music folder |
| "what's the time" | Get current time |
| "open code" | Launch VS Code |
| "send email" | Send email via Gmail |
| Any other question | Get answer from Gemini AI |
| "exit" or "quit" | Close the assistant |

### Example Questions:
- "What is Python?"
- "How do I learn programming?"
- "Tell me about artificial intelligence"
- "What's 2 + 2?"
- "Who is Elon Musk?"

---

## 🔧 How Gemini API Integration Works

### When You Ask a Question:
1. Your query is sent to Google's Gemini 2.5 Flash model
2. The AI processes your question
3. Persona AI speaks/displays the response

### Features:
- ✅ Intelligent AI responses
- ✅ Real-time processing
- ✅ Multi-topic support
- ✅ Natural language understanding

---

## ⚙️ Configuration

### Email Setup (Optional):
To enable email sending, edit **persona-ai.py**:
```python
# Line 68: Replace with your Gmail
server.login('youremail@gmail.com', 'your-app-password')
server.sendmail('youremail@gmail.com', to, content)
```

**Get Gmail App Password:**
1. Enable 2-factor authentication on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Create an app password for "Mail"
4. Use that password in the code

### Music Folder:
Update music directory path in **persona-ai.py** (line 123):
```python
music_dir = r'C:\Users\YourUsername\Music'
```

### VS Code Path:
Update VS Code path in **persona-ai.py** (line 143):
```python
codePath = "C:\\path\\to\\Code.exe"
```

---

## 🧪 Testing

### Test Gemini API:
```bash
python quick_test.py
```

### Check Available Models:
```bash
python list_models.py
```

---

## 📝 Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not configured" | Check .env file has correct API key |
| Microphone not working | Check system microphone is enabled |
| No response from Gemini | Check internet connection |
| Email sending fails | Check Gmail credentials and app password |
| Music won't play | Check music folder path exists |

---

## 💡 Tips & Tricks

1. **Quiet Environment**: Voice recognition works better in quiet places
2. **Clear Speech**: Speak clearly for better recognition
3. **Test Mode**: Use text-based version first before voice
4. **API Key Safe**: Keep your API key secure (already in .env file)
5. **Long Questions**: Break complex questions into smaller ones

---

## 🔐 Security

- Your API key is stored in `.env` (not in code)
- Never commit `.env` to version control
- API calls are encrypted
- Your data is processed by Google's secure servers

---

## 📞 Support

If issues occur:
1. Check error messages in console
2. Verify .env file has API key
3. Test with `python quick_test.py`
4. Check internet connection
5. Update packages: `pip install -r requirements.txt --upgrade`

---

## 🎉 You're All Set!

Your Persona AI assistant is ready to use! Choose your preferred mode and start asking questions!

**Start with text mode for testing:**
```bash
python persona-ai-text.py
```

Enjoy your AI assistant! 🚀
