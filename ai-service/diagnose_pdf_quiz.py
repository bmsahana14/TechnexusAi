"""
Comprehensive PDF Quiz Generation Diagnostic (ASCII version)
"""
import os
import sys
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv()

print("="*70)
print("PDF QUIZ GENERATION DIAGNOSTIC")
print("="*70)

# Step 1: Check environment
print("\n[1] ENVIRONMENT CHECK")
print("-"*70)

gemini_key = os.getenv("GEMINI_API_KEY")
openai_key = os.getenv("OPENAI_API_KEY")

print(f"GEMINI_API_KEY: {'SET' if gemini_key and gemini_key != 'your_gemini_key_here' else 'NOT SET'}")
if gemini_key:
    print(f"  Length: {len(gemini_key)} chars")
    # print(f"  Preview: {gemini_key[:15]}...{gemini_key[-4:]}")

print(f"OPENAI_API_KEY: {'SET' if openai_key and openai_key not in ['your_openai_api_key_here', 'dummy_key_for_testing'] else 'NOT SET'}")

# Step 2: Check dependencies
print("\n[2] DEPENDENCY CHECK")
print("-"*70)

try:
    import google.generativeai as genai
    print("OK: google-generativeai: INSTALLED")
except ImportError as e:
    print(f"ERROR: google-generativeai: NOT INSTALLED - {e}")

try:
    from pypdf import PdfReader
    print("OK: pypdf: INSTALLED")
except ImportError as e:
    print(f"ERROR: pypdf: NOT INSTALLED - {e}")

try:
    from pptx import Presentation
    print("OK: python-pptx: INSTALLED")
except ImportError as e:
    print(f"ERROR: python-pptx: NOT INSTALLED - {e}")

# Step 3: Check AI Provider
print("\n[3] AI PROVIDER CHECK")
print("-"*70)

try:
    from quiz_generator import AI_PROVIDER, GEMINI_AVAILABLE, OPENAI_AVAILABLE
    print(f"Current AI Provider: {AI_PROVIDER}")
    print(f"Gemini Available: {GEMINI_AVAILABLE}")
    print(f"OpenAI Available: {OPENAI_AVAILABLE}")
    
    if AI_PROVIDER == "fallback":
        print("\nWARNING: Using FALLBACK mode!")
        print("   This means quizzes will be generic, not from your PDF.")
        print("   Reason: No valid API key configured.")
except Exception as e:
    print(f"ERROR: Error importing quiz_generator: {e}")

# Step 4: Test PDF files
print("\n[4] PDF FILES CHECK")
print("-"*70)

uploads_dir = Path("uploads")
if uploads_dir.exists():
    pdf_files = list(uploads_dir.glob("*.pdf"))
    pptx_files = list(uploads_dir.glob("*.pptx"))
    
    print(f"PDF files found: {len(pdf_files)}")
    for pdf in pdf_files:
        print(f"  - {pdf.name} ({pdf.stat().st_size} bytes)")
    
    print(f"PPTX files found: {len(pptx_files)}")
    for pptx in pptx_files:
        print(f"  - {pptx.name} ({pptx.stat().st_size} bytes)")
    
    # Test extraction on first PDF
    if pdf_files:
        test_pdf = pdf_files[0]
        print(f"\n[5] TESTING PDF EXTRACTION: {test_pdf.name}")
        print("-"*70)
        
        try:
            from pypdf import PdfReader
            reader = PdfReader(str(test_pdf))
            total_text = ""
            for page in reader.pages:
                total_text += page.extract_text() + "\n"
            
            print(f"OK: Extracted {len(total_text)} characters")
            print(f"  Pages: {len(reader.pages)}")
            print(f"  Preview: {total_text[:300]}...")
            
            if len(total_text) < 100:
                print("\nWARNING: Very little text extracted!")
                print("   This PDF might be image-based or encrypted.")
                print("   Try a different PDF with actual text content.")
        except Exception as e:
            print(f"ERROR: Error extracting PDF: {e}")
        
        # Test quiz generation
        if AI_PROVIDER != "fallback":
            print(f"\n[6] TESTING QUIZ GENERATION")
            print("-"*70)
            
            async def test_generation():
                try:
                    from quiz_generator import generate_quiz_from_file
                    print(f"Generating 3 questions from {test_pdf.name}...")
                    questions = await generate_quiz_from_file(str(test_pdf), 3, "Medium")
                    
                    print(f"\nOK: Generated {len(questions)} questions:")
                    for i, q in enumerate(questions, 1):
                        print(f"\n  Q{i}: {q.get('q', 'NO QUESTION')[:80]}...")
                        print(f"      Options: {len(q.get('options', []))}")
                        print(f"      Correct: {q.get('correct', 'NOT SET')}")
                    
                    # Check if fallback
                    first_q = questions[0].get('q', '').lower() if questions else ''
                    if 'microservices' in first_q or 'socket.io' in first_q:
                        print("\nWARNING: These are FALLBACK questions!")
                        print("   Not generated from your PDF content.")
                    else:
                        print("\nOK: Questions appear to be PDF-specific!")
                        
                except Exception as e:
                    print(f"ERROR: {e}")
                    import traceback
                    traceback.print_exc()
            
            asyncio.run(test_generation())
        else:
            print(f"\n[6] SKIPPING QUIZ GENERATION TEST")
            print("-"*70)
            print("WARNING: AI Provider is 'fallback' - cannot test real generation")
    
else:
    print("ERROR: uploads/ directory not found")

print("\n" + "="*70)
print("DIAGNOSTIC COMPLETE")
print("="*70)

# Summary
print("\nSUMMARY:")
if AI_PROVIDER == "gemini":
    print("OK: Gemini API configured and ready")
elif AI_PROVIDER == "openai":
    print("OK: OpenAI API configured and ready")
else:
    print("ERROR: NO AI PROVIDER - Using fallback mode")
    print("  ACTION REQUIRED: Set GEMINI_API_KEY in .env file")
    print("  Get free key at: https://aistudio.google.com/app/apikey")

print("\n")
