"""Test multiple speak calls to debug engine state issues"""
import pyttsx3
import time

# Initialize engine
engine = pyttsx3.init()
engine.setProperty('rate', 150)

print("=" * 50)
print("Testing Multiple Speak Calls")
print("=" * 50)

# Test 1: First greeting
print("\n[TEST 1] Speaking: 'Good Evening'")
try:
    engine.say("Good Evening, I am Persona AI")
    result = engine.runAndWait()
    print(f"Engine returned: {result}")
    engine.stop()
    time.sleep(1)
except Exception as e:
    print(f"Error: {e}")

# Test 2: Long response (like Gemini)
print("\n[TEST 2] Speaking: Long Gemini-like response")
long_response = "This is a simulated Gemini response. It is much longer than the greeting and contains more detailed information. The artificial intelligence processes your query and returns a comprehensive answer with multiple sentences explaining the concept in detail."
try:
    engine.say(long_response[:500])
    result = engine.runAndWait()
    print(f"Engine returned: {result}")
    engine.stop()
    time.sleep(1)
except Exception as e:
    print(f"Error: {e}")

# Test 3: Another short response
print("\n[TEST 3] Speaking: 'Test number three'")
try:
    engine.say("Test number three, can you hear this?")
    result = engine.runAndWait()
    print(f"Engine returned: {result}")
    engine.stop()
    time.sleep(1)
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 50)
print("Test complete. Check if you heard all three messages.")
print("=" * 50)
