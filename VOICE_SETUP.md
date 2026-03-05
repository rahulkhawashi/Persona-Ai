# PERSONA AI - Voice Output Troubleshooting & Setup



1. **Added speech rate**: Set to 150 words per minute for clear output
2. **Added debug output**: Shows `[SPEAKING]` label when speak() is called
3. **Verified pyttsx3**: Engine initializes and works without errors

---

## How Voice Output Should Work

When you run `python persona-ai.py`:

Listening....
Recognizing...
Rahul said: who is prime minister of india
[SPEAKING] The prime minister of India is Narendra Modi
Persona AI Response: The prime minister of India is Narendra Modi
```

The `[SPEAKING]` line shows that speak() is being called. If you don't hear audio:

---

## Troubleshooting Voice Output

### Issue 1: No Sound (Most Common)

**Windows Sound Settings Check:**
1. Open Windows Settings → System → Sound
2. Check Volume is not muted (slider > 0)
3. Check Default output device (should be speakers/headphones)
4. Try playing a test sound (Settings → Sound → Test your speakers)

**Test pyttsx3 directly:**
```bash
python test_speak.py
```
This will attempt to speak 3 test messages. If you hear nothing:
- Your system audio might be muted
- Or your default speaker device is not set

### Issue 2: Engine Not Initializing

**Check available voices:**
```bash
python -c "import pyttsx3; e = pyttsx3.init(); print(f'Voices: {len(e.getProperty(\"voices\"))}')"
```
Should print: `Voices: 1` (or more)

If it says `Voices: 0`, you need to install voice data:
```bash
pip install --upgrade pyttsx3
```

### Issue 3: Speech Too Fast/Slow

The current rate is 150. You can adjust it in `persona-ai.py` line 27:
```python
engine.setProperty('rate', 150)  # Try: 100 (slow), 150 (normal), 200 (fast)
```

---

## Testing Voice Mode Step-by-Step

1. **Run the assistant:**
   ```bash
   python persona-ai.py
   ```

2. **Wait for greeting** (you should hear "Good Morning/Afternoon/Evening" + "I am Persona...")

3. **Speak your question:**
   - Say: "Hello"
   - Console will show: `Rahul said: hello`
   - Console will show: `[SPEAKING] <response>`
   - You should hear the response spoken

4. **Check output lines:**
   - If you see `[SPEAKING]` but no audio → system audio issue
   - If no `[SPEAKING]` line → code issue (unlikely after our changes)

---

## Windows-Specific Audio Troubleshooting

### For Built-in Speakers:
1. Right-click speaker icon (taskbar) → Open Volume mixer
2. Check if Python/terminal has volume set
3. Ensure "Apps" volume is not muted

### For Headphones:
1. Plug in headphones
2. Check Windows sees them (Settings → Sound → Output devices)
3. Select headphones as default device
4. Test with another app first (YouTube, Spotify)

### For Multiple Audio Devices:
If you have multiple speakers/headphones:
```bash
python -c "import pyttsx3; e = pyttsx3.init('sapi5'); print('Using SAPI5 engine')"
```

---

## What to Check When Testing

| Check | How | Expected Result |
|-------|-----|-----------------|
| Windows volume | Look at speaker icon | No muted indicators |
| Default speaker | Settings → Sound | Shows your speaker device |
| pyttsx3 test | `python test_speak.py` | Should produce audio |
| Demo greeting | `python persona-ai.py` waits 5s | Should hear greeting |
| Debug output | Look for `[SPEAKING]` line | Should appear for each response |

---

## Quick Fixes (Try These First)

1. **Increase system volume to 100%** (most common issue)
2. **Plug in headphones** and test (isolate speaker issue)
3. **Restart Python** - sometimes engine needs restart
4. **Check taskbar** - no "muted" indicators on speaker icon

---

## Next Steps

Once voice works:
- Run: `python persona-ai.py`
- Ask: "Remember my name is Rahul"
- Ask: "What do you remember?"
- Ask: "Who is the prime minister of India?"

All responses should appear in console AND be spoken.

---

## How to Test Without Running Full Assistant

```bash
python test_speak.py
```

This will:
1. Test voice initialization
2. Speak 3 test messages
3. Show if audio is working

If this produces no sound, voice output won't work in the full assistant either.

---

## If Still No Sound After All Checks

Please verify:
1. ✓ Windows volume > 0
2. ✓ Headphones plugged in (if using)
3. ✓ Other apps can produce sound (YouTube, music, etc.)
4. ✓ `python test_speak.py` produces output
5. ✓ Console shows `[SPEAKING]` lines when running `python persona-ai.py`

If all above are true but still no sound, the issue is system-level, not code-level.

**Try:** Reinstall audio drivers or check if OS-level speech service is disabled.
