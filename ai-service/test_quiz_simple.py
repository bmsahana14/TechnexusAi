"""
Simple test to check if quiz generation is working from PDF
"""
import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("SIMPLE PDF QUIZ TEST")
print("=" * 60)

# Check API key
gemini_key = os.getenv("GEMINI_API_KEY")
print(f"\n1. Gemini API Key: {'SET' if gemini_key and gemini_key != 'your_gemini_key_here' else 'NOT SET'}")

# Import quiz generator
try:
    from quiz_generator import generate_quiz_from_file, AI_PROVIDER
    print(f"2. AI Provider: {AI_PROVIDER}")
except Exception as e:
    print(f"ERROR importing quiz_generator: {e}")
    sys.exit(1)

# Test PDF
test_pdf = "uploads/Environment_3_Pages_Notes.pdf"
if not os.path.exists(test_pdf):
    print(f"ERROR: PDF not found: {test_pdf}")
    sys.exit(1)

print(f"3. Test PDF: {test_pdf}")
print(f"   Size: {os.path.getsize(test_pdf)} bytes")

async def test():
    print("\n4. Generating 2 questions from PDF...")
    print("-" * 60)
    
    try:
        questions = await generate_quiz_from_file(test_pdf, 2, "Easy")
        
        print(f"\n5. SUCCESS! Generated {len(questions)} questions:")
        print("-" * 60)
        
        for i, q in enumerate(questions, 1):
            print(f"\nQ{i}: {q.get('q', 'NO QUESTION')}")
            print(f"   A) {q.get('options', [])[0] if len(q.get('options', [])) > 0 else 'N/A'}")
            print(f"   B) {q.get('options', [])[1] if len(q.get('options', [])) > 1 else 'N/A'}")
            print(f"   C) {q.get('options', [])[2] if len(q.get('options', [])) > 2 else 'N/A'}")
            print(f"   D) {q.get('options', [])[3] if len(q.get('options', [])) > 3 else 'N/A'}")
            print(f"   Correct: {chr(65 + q.get('correct', 0))}")
        
        # Check if these are fallback questions
        first_q = questions[0].get('q', '').lower() if questions else ''
        if 'microservices' in first_q or 'socket.io' in first_q or 'architectural' in first_q:
            print("\nWARNING: These are FALLBACK questions!")
            print("   They are NOT from your PDF content.")
            print("   This means the AI generation failed.")
        else:
            print("\nOK: Questions appear to be from the PDF!")
            
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()

print("\n" + "=" * 60)
asyncio.run(test())
print("=" * 60)
