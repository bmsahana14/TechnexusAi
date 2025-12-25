"""
COMPREHENSIVE QUIZ GENERATION TEST
This script tests the entire flow and identifies where the issue is
"""
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

print("=" * 70)
print("QUIZ GENERATION DIAGNOSTIC - FULL FLOW TEST")
print("=" * 70)

# Step 1: Check environment
print("\n[STEP 1] Environment Check")
print("-" * 70)
gemini_key = os.getenv("GEMINI_API_KEY")
print(f"✓ Gemini API Key: {'CONFIGURED' if gemini_key and gemini_key != 'your_gemini_key_here' else 'NOT CONFIGURED'}")

# Step 2: Check dependencies
print("\n[STEP 2] Dependencies Check")
print("-" * 70)
try:
    import google.generativeai as genai
    print("✓ google-generativeai: INSTALLED")
except ImportError:
    print("✗ google-generativeai: NOT INSTALLED")
    exit(1)

try:
    from pypdf import PdfReader
    print("✓ pypdf: INSTALLED")
except ImportError:
    print("✗ pypdf: NOT INSTALLED")
    exit(1)

# Step 3: Check AI Provider
print("\n[STEP 3] AI Provider Check")
print("-" * 70)
try:
    from quiz_generator import AI_PROVIDER, GEMINI_AVAILABLE
    print(f"✓ Current AI Provider: {AI_PROVIDER}")
    print(f"✓ Gemini Available: {GEMINI_AVAILABLE}")
    
    if AI_PROVIDER == "fallback":
        print("\n⚠ WARNING: Using FALLBACK mode!")
        print("  This means quizzes will be GENERIC, not from your PDF.")
        print("  The AI service will return hardcoded questions about microservices.")
        exit(1)
except Exception as e:
    print(f"✗ Error importing quiz_generator: {e}")
    exit(1)

# Step 4: Test PDF extraction
print("\n[STEP 4] PDF Extraction Test")
print("-" * 70)
test_pdf = "uploads/Environment_3_Pages_Notes.pdf"
if not os.path.exists(test_pdf):
    print(f"✗ PDF not found: {test_pdf}")
    exit(1)

reader = PdfReader(test_pdf)
text = ''.join([page.extract_text() for page in reader.pages])
print(f"✓ Extracted {len(text)} characters from PDF")
print(f"✓ PDF is about: {text[:100]}...")

# Step 5: Test quiz generation
print("\n[STEP 5] Quiz Generation Test")
print("-" * 70)

async def test_generation():
    from quiz_generator import generate_quiz_from_file
    
    print("Generating 3 questions from PDF...")
    questions = await generate_quiz_from_file(test_pdf, 3, "Easy")
    
    print(f"\n✓ Generated {len(questions)} questions")
    print("\nQUESTIONS:")
    print("-" * 70)
    
    for i, q in enumerate(questions, 1):
        print(f"\nQ{i}: {q.get('q', 'NO QUESTION')}")
        for j, opt in enumerate(q.get('options', [])):
            marker = "✓" if j == q.get('correct', -1) else " "
            print(f"   {marker} {chr(65+j)}) {opt}")
    
    # Analyze questions
    print("\n" + "=" * 70)
    print("ANALYSIS")
    print("=" * 70)
    
    all_questions_text = ' '.join([q.get('q', '') for q in questions]).lower()
    
    # Check for fallback indicators
    fallback_keywords = ['microservices', 'socket.io', 'architectural', 'realtime communication', 'css framework']
    found_fallback = any(keyword in all_questions_text for keyword in fallback_keywords)
    
    # Check for PDF content indicators
    pdf_keywords = ['environment', 'abiotic', 'biotic', 'natural', 'human-made', 'sunlight', 'air', 'water']
    found_pdf_content = any(keyword in all_questions_text for keyword in pdf_keywords)
    
    if found_fallback:
        print("\n✗ PROBLEM DETECTED: Questions are FALLBACK/GENERIC")
        print("  These questions are NOT from your PDF!")
        print("  They are about: microservices, Socket.IO, web development")
        print("\n  LIKELY CAUSE:")
        print("  - AI service might have crashed during generation")
        print("  - API call might have failed silently")
        print("  - Error was caught and fallback was returned")
        return False
    elif found_pdf_content:
        print("\n✓ SUCCESS: Questions are from the PDF!")
        print("  Questions correctly reference: Environment, components, etc.")
        return True
    else:
        print("\n? UNCLEAR: Questions don't match fallback OR PDF content")
        print("  Manual review needed")
        return None

try:
    result = asyncio.run(test_generation())
    print("\n" + "=" * 70)
    if result == True:
        print("VERDICT: ✓ QUIZ GENERATION IS WORKING CORRECTLY")
        print("\nIf you're still seeing wrong questions in the app:")
        print("1. Make sure the AI service is running on port 8000")
        print("2. Check browser console for errors")
        print("3. Verify the frontend is calling http://localhost:8000/generate-quiz")
    elif result == False:
        print("VERDICT: ✗ QUIZ GENERATION IS USING FALLBACK")
        print("\nTO FIX:")
        print("1. Check if Gemini API key is valid")
        print("2. Check if there are API rate limits")
        print("3. Look for errors in the AI service logs")
    else:
        print("VERDICT: ? UNCLEAR - Manual review needed")
    print("=" * 70)
except Exception as e:
    print(f"\n✗ Error during generation: {e}")
    import traceback
    traceback.print_exc()
