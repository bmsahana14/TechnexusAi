"""
Simple PDF Quiz Generation Test
"""
import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

async def test_pdf_quiz():
    from quiz_generator import generate_quiz_from_file, AI_PROVIDER
    
    print("="*60)
    print("SIMPLE PDF QUIZ TEST")
    print("="*60)
    print(f"AI Provider: {AI_PROVIDER}")
    
    # Find PDF file
    pdf_file = Path("uploads/Environment_3_Pages_Notes.pdf")
    
    if not pdf_file.exists():
        print(f"ERROR: PDF file not found: {pdf_file}")
        return
    
    print(f"Testing with: {pdf_file.name}")
    print("Generating 3 questions...")
    print()
    
    # Generate quiz
    questions = await generate_quiz_from_file(str(pdf_file), 3, "Medium")
    
    print()
    print("="*60)
    print("RESULTS")
    print("="*60)
    print(f"Generated {len(questions)} questions:")
    print()
    
    for i, q in enumerate(questions, 1):
        print(f"Q{i}: {q.get('q', 'NO QUESTION')}")
        print(f"    Options:")
        for j, opt in enumerate(q.get('options', [])):
            marker = " <-- CORRECT" if j == q.get('correct') else ""
            print(f"      {j}. {opt}{marker}")
        print()
    
    # Check if these are fallback questions
    first_q = questions[0].get('q', '').lower() if questions else ''
    if 'microservices' in first_q or 'socket.io' in first_q or 'architectural style' in first_q:
        print("WARNING: These appear to be FALLBACK questions!")
        print("They are NOT based on your PDF content.")
    else:
        print("SUCCESS: Questions appear to be PDF-specific!")

if __name__ == "__main__":
    asyncio.run(test_pdf_quiz())
