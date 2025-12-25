"""
Quick test with gemini-pro model
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

print("Testing Gemini Pro model...")

key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=key)

# Test with gemini-pro
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content('Say "Hello from Gemini Pro!"')

print(f"✅ SUCCESS! Response: {response.text}")
print("\nGemini Pro is working correctly!")
