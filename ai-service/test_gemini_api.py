"""
Quick test to verify Gemini API is working
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

print("="*60)
print("GEMINI API TEST")
print("="*60)

# Get API key
key = os.getenv('GEMINI_API_KEY')
print(f"1. API Key: {'SET ✓' if key and len(key) > 20 else 'NOT SET ✗'}")
print(f"   Length: {len(key) if key else 0} characters")

if not key or len(key) < 20:
    print("\n❌ API key not properly configured!")
    print("   Please set GEMINI_API_KEY in .env file")
    exit(1)

# Configure Gemini
try:
    genai.configure(api_key=key)
    print("2. Gemini configured ✓")
except Exception as e:
    print(f"❌ Error configuring Gemini: {e}")
    exit(1)

# Test with simple prompt
try:
    print("\n3. Testing Gemini API...")
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content('Say "Hello from Gemini!" and nothing else.')
    print(f"   Response: {response.text}")
    print("   ✓ Gemini API is working!")
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

# Test quiz generation
try:
    print("\n4. Testing quiz generation...")
    prompt = """Generate 1 quiz question about Python programming.
Return ONLY a JSON array in this exact format:
[{"q": "What is Python?", "options": ["A language", "A snake", "A tool", "A framework"], "correct": 0}]"""
    
    response = model.generate_content(prompt)
    print(f"   Raw response: {response.text[:150]}...")
    print("   ✓ Quiz generation working!")
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

print("\n" + "="*60)
print("✅ ALL TESTS PASSED!")
print("Your Gemini API is properly configured and working.")
print("="*60)
