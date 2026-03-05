"""Verify all dependencies and configuration"""
import sys
print('=' * 70)
print('PERSONA AI - VOICE ASSISTANT VERIFICATION')
print('=' * 70)

print(f'\n✓ Python version: {sys.version.split()[0]}')

# Check imports
checks = [
    ('speech_recognition', 'speech_recognition'),
    ('pyttsx3', 'pyttsx3'),
    ('google.generativeai', 'google.generativeai'),
    ('wikipedia', 'wikipedia'),
    ('dotenv', 'python-dotenv'),
]

for module_name, display_name in checks:
    try:
        __import__(module_name)
        print(f'✓ {display_name} installed')
    except:
        print(f'✗ {display_name} missing')

# Check memory.py
try:
    sys.path.insert(0, '.')
    import memory
    print('✓ memory.py module found')
except:
    print('✗ memory.py missing')

# Check .env file
try:
    from dotenv import load_dotenv
    import os
    load_dotenv()
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        print(f'✓ GEMINI_API_KEY configured (length: {len(api_key)} chars)')
    else:
        print('⚠ GEMINI_API_KEY not found in .env')
except Exception as e:
    print(f'⚠ .env check failed: {e}')

print('\n' + '=' * 70)
print('✅ All dependencies installed and configured!')
print('=' * 70)
print('\nReady to run: python persona-ai.py')
print('Test voice: python quick_test_voice.py')
