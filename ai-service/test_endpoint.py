"""
Test the AI service /generate-quiz endpoint
"""
import requests
from pathlib import Path

print("="*60)
print("TESTING AI SERVICE ENDPOINT")
print("="*60)

# Test endpoint
url = "http://localhost:8000/generate-quiz"
pdf_file = Path("uploads/Environment_3_Pages_Notes.pdf")

if not pdf_file.exists():
    print(f"ERROR: PDF file not found: {pdf_file}")
    exit(1)

print(f"\nSending PDF to {url}...")
print(f"File: {pdf_file.name} ({pdf_file.stat().st_size} bytes)")

try:
    with open(pdf_file, 'rb') as f:
        files = {'file': (pdf_file.name, f, 'application/pdf')}
        data = {
            'num_questions': '3',
            'difficulty': 'Medium'
        }
        
        response = requests.post(url, files=files, data=data, timeout=60)
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("\nSUCCESS!")
        print("="*60)
        print(f"\nMessage: {result.get('message')}")
        print(f"Filename: {result.get('filename')}")
        
        questions = result.get('quiz_data', [])
        print(f"\nGenerated {len(questions)} questions:")
        print("="*60)
        
        for i, q in enumerate(questions, 1):
            print(f"\nQ{i}: {q.get('q', 'NO QUESTION')}")
            print("    Options:")
            for j, opt in enumerate(q.get('options', [])):
                marker = " <-- CORRECT" if j == q.get('correct') else ""
                print(f"      {j}. {opt}{marker}")
        
        # Check if fallback
        first_q = questions[0].get('q', '').lower() if questions else ''
        print("\n" + "="*60)
        if 'microservices' in first_q or 'socket.io' in first_q or 'architectural style' in first_q:
            print("WARNING: These are FALLBACK questions!")
            print("They are NOT based on your PDF content.")
        else:
            print("SUCCESS: Questions appear to be PDF-specific!")
    else:
        print(f"\nERROR: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()
