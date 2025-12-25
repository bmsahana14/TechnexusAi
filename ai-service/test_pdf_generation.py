"""
Test script to diagnose PDF quiz generation issues
"""
import os
import asyncio
from dotenv import load_dotenv
from quiz_generator import generate_quiz_from_file, AI_PROVIDER

load_dotenv()

async def test_generation():
    print("=" * 60)
    print("PDF QUIZ GENERATION TEST")
    print("=" * 60)
    
    # Check AI provider
    print(f"\n1. AI Provider: {AI_PROVIDER}")
    
    # Check API keys
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    print(f"2. Gemini API Key: {'SET ✅' if gemini_key and gemini_key != 'your_gemini_key_here' else 'NOT SET ❌'}")
    print(f"3. OpenAI API Key: {'SET ✅' if openai_key and openai_key not in ['your_openai_api_key_here', 'dummy_key_for_testing'] else 'NOT SET ❌'}")
    
    # Find a test PDF
    uploads_dir = "uploads"
    if os.path.exists(uploads_dir):
        pdf_files = [f for f in os.listdir(uploads_dir) if f.endswith('.pdf')]
        if pdf_files:
            test_file = os.path.join(uploads_dir, pdf_files[0])
            print(f"\n4. Test File: {test_file}")
            print(f"   File Size: {os.path.getsize(test_file)} bytes")
            
            print("\n5. Generating quiz questions...")
            try:
                questions = await generate_quiz_from_file(test_file, 3, "Medium")
                print(f"\n6. Generated {len(questions)} questions:")
                
                for i, q in enumerate(questions, 1):
                    print(f"\n   Q{i}: {q.get('q', 'NO QUESTION')[:80]}...")
                    print(f"   Options: {len(q.get('options', []))} options")
                    print(f"   Correct: {q.get('correct', 'NOT SET')}")
                
                # Check if questions are generic fallback
                if questions and "microservices" in questions[0].get('q', '').lower():
                    print("\n⚠️  WARNING: These look like FALLBACK questions!")
                    print("   The AI is not generating from your PDF content.")
                else:
                    print("\n✅ Questions appear to be PDF-specific!")
                    
            except Exception as e:
                print(f"\n❌ Error: {e}")
                import traceback
                traceback.print_exc()
        else:
            print("\n❌ No PDF files found in uploads/ directory")
    else:
        print("\n❌ uploads/ directory not found")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(test_generation())
