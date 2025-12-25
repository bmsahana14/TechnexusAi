import os
import google.generativeai as genai
from dotenv import load_dotenv
import traceback

load_dotenv()

key = os.getenv("GEMINI_API_KEY")
print(f"Key found: {bool(key)}")
if key:
    print(f"Key preview: {key[:5]}...{key[-5:]}")

try:
    genai.configure(api_key=key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("Attempting to generate content...")
    response = model.generate_content("Hello, are you working?")
    print("Response received!")
    print(response.text)
except Exception:
    traceback.print_exc()
