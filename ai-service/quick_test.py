"""
Quick test - bypass quiz_generator import
"""
import os
from dotenv import load_dotenv

load_dotenv()

print("Test 1: Import Gemini")
try:
    import google.generativeai as genai
    print("OK - Gemini imported")
except Exception as e:
    print(f"FAIL - {e}")
    exit(1)

print("\nTest 2: Configure Gemini")
api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key: {api_key[:15]}...{api_key[-4:]}")

try:
    genai.configure(api_key=api_key, transport='rest')
    print("OK - Gemini configured")
except Exception as e:
    print(f"FAIL - {e}")
    exit(1)

print("\nTest 3: Create Model")
try:
    model = genai.GenerativeModel('models/gemini-flash-latest')
    print("OK - Model created")
except Exception as e:
    print(f"FAIL - {e}")
    exit(1)

print("\nTest 4: Generate Content")
try:
    response = model.generate_content("Say 'Hello World' in JSON format: {\"message\": \"...\"}")
    print(f"OK - Response: {response.text}")
except Exception as e:
    print(f"FAIL - {e}")
    exit(1)

print("\n✓ ALL TESTS PASSED")
