"""
Verification script - Check if everything is properly configured
"""

import os
import sys

print("=" * 70)
print("PERSONA AI - System Verification")
print("=" * 70)
print()

checks_passed = 0
checks_total = 0

def check(description, condition):
    global checks_passed, checks_total
    checks_total += 1
    status = "✓ PASS" if condition else "✗ FAIL"
    print(f"{status}: {description}")
    if condition:
        checks_passed += 1
    return condition

print("1. Checking Files...")
print("-" * 70)
check("persona-ai.py exists", os.path.exists("persona-ai.py"))
check("persona-ai-text.py exists", os.path.exists("persona-ai-text.py"))
check(".env exists", os.path.exists(".env"))
check("requirements.txt exists", os.path.exists("requirements.txt"))

print()
print("2. Checking Python Packages...")
print("-" * 70)

packages = {
    "pyttsx3": "Text-to-speech",
    "speech_recognition": "Voice input",
    "wikipedia": "Wikipedia search",
    "google.generativeai": "Gemini API",
    "dotenv": "Configuration"
}

for package, description in packages.items():
    try:
        __import__(package)
        check(f"{description} ({package})", True)
    except ImportError:
        check(f"{description} ({package})", False)

print()
print("3. Checking Configuration...")
print("-" * 70)

# Check .env file
env_exists = os.path.exists(".env")
check(".env file exists", env_exists)

if env_exists:
    with open(".env", "r") as f:
        env_content = f.read()
        has_api_key = "GEMINI_API_KEY=" in env_content
        api_key_configured = has_api_key and "your-api-key" not in env_content
        check("API key is present", has_api_key)
        check("API key is configured (not placeholder)", api_key_configured)

print()
print("4. Checking Python Version...")
print("-" * 70)
version = sys.version_info
check(f"Python {version.major}.{version.minor}.{version.micro}", 
      version.major >= 3 and version.minor >= 7)

print()
print("=" * 70)
print(f"VERIFICATION RESULT: {checks_passed}/{checks_total} checks passed")
print("=" * 70)

if checks_passed == checks_total:
    print()
    print("✓ ALL CHECKS PASSED!")
    print()
    print("You can now run:")
    print("  - python persona-ai-text.py (text mode)")
    print("  - python persona-ai.py (voice mode)")
    print()
    sys.exit(0)
else:
    failed = checks_total - checks_passed
    print()
    print(f"✗ {failed} check(s) failed!")
    print()
    print("Please fix the issues and run this verification again.")
    print()
    sys.exit(1)
