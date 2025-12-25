"""
Direct test of Gemini API with PDF content
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai
from pypdf import PdfReader

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key: {api_key[:15]}...{api_key[-4:]}")

genai.configure(api_key=api_key, transport='rest')
model = genai.GenerativeModel('models/gemini-flash-latest')

# Extract PDF content
pdf_path = "uploads/Environment_3_Pages_Notes.pdf"
reader = PdfReader(pdf_path)
text = ''.join([page.extract_text() for page in reader.pages])

print(f"\nExtracted {len(text)} characters from PDF")
print(f"Preview: {text[:200]}...")

# Create prompt
prompt = f"""
You are an expert quiz generator for educational content.

CONTENT TO ANALYZE:
{text}

TASK:
Generate 2 high-quality multiple-choice questions based strictly on the content above.

DIFFICULTY LEVEL: Easy
- Focus on definitions, basic concepts, and direct facts from the content

REQUIREMENTS:
1. Questions must be directly answerable from the provided content
2. Each question should test a unique concept or fact
3. All 4 options must be plausible but only one correct
4. Use clear, professional language

OUTPUT FORMAT:
Return ONLY a valid JSON array with NO markdown formatting, NO code blocks, NO explanations.
Each object must have exactly these fields:
- "q": The question text (string)
- "options": Array of exactly 4 distinct answer options (strings)
- "correct": Index (0-3) of the correct option (integer)

EXAMPLE:
[
    {{"q": "What is the primary benefit of microservices architecture?", "options": ["Monolithic design", "Independent scalability", "Single database", "Tight coupling"], "correct": 1}},
    {{"q": "Which protocol is used for real-time communication?", "options": ["HTTP", "FTP", "WebSocket", "SMTP"], "correct": 2}}
]

Generate 2 questions now:
"""

print("\nSending to Gemini...")
try:
    response = model.generate_content(prompt)
    print("\nRaw Response:")
    print(response.text)
    
    # Try to parse
    import json
    raw = response.text.strip()
    
    # Clean markdown
    if raw.startswith("```json"):
        raw = raw[7:]
    if raw.startswith("```"):
        raw = raw[3:]
    if raw.endswith("```"):
        raw = raw[:-3]
    
    # Extract JSON
    start = raw.find("[")
    end = raw.rfind("]")
    if start != -1 and end != -1:
        raw = raw[start:end+1]
    
    questions = json.loads(raw.strip())
    
    print("\n\nParsed Questions:")
    for i, q in enumerate(questions, 1):
        print(f"\nQ{i}: {q['q']}")
        for j, opt in enumerate(q['options']):
            print(f"   {chr(65+j)}) {opt}")
        print(f"   Correct: {chr(65 + q['correct'])}")
    
except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
