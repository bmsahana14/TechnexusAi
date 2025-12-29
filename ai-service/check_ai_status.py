
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

try:
    import quiz_generator
    print(f"AI_PROVIDER: {quiz_generator.AI_PROVIDER}")
    print(f"GEMINI_AVAILABLE: {quiz_generator.GEMINI_AVAILABLE}")
    
    key = os.getenv("GEMINI_API_KEY")
    if key:
        print(f"Key configured: Yes (Length: {len(key)})")
        print(f"Key preview: {key[:5]}...")
    else:
        print("Key configured: No")
        
except Exception as e:
    print(f"Error importing quiz_generator: {e}")
