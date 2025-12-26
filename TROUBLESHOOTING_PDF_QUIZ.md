# 🔧 PDF Quiz Generation Troubleshooting Guide

## Issue: Quizzes Not Generated from PDF Content

If your quizzes are showing generic questions instead of PDF-specific content, follow this guide.

---

## ✅ Quick Diagnosis

### Step 1: Check AI Service Logs

When you start the AI service, you should see:

```
============================================================
AI SERVICE INITIALIZATION
============================================================
✅ Using Google Gemini 1.5 Flash for quiz generation
   API Key: AIzaSyXXXX...XXXX
============================================================
```

**If you see:**
```
⚠️  No valid AI API key found. Using fallback mode.
```

**Then:** Your API key is not configured correctly. Jump to [Fix API Key](#fix-api-key).

---

### Step 2: Check Quiz Generation Logs

When you upload a PDF, the console should show:

```
============================================================
QUIZ GENERATION REQUEST
============================================================
File: uploads/your-file.pdf
Questions: 5
Difficulty: Medium
AI Provider: gemini

Extracting text from PDF...
✅ Extracted 5234 characters from file
   Preview: This is the content from your PDF...

🤖 Sending to GEMINI for quiz generation...
✅ Generated 5 questions successfully
============================================================
```

**If you see:**
- `AI Provider: fallback` → API key issue
- Very few characters extracted → PDF extraction issue
- Error messages → Check the specific error

---

## 🔑 Fix API Key

### Option 1: Use Google Gemini (Recommended - FREE)

1. **Get API Key:**
   - Go to: https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key (starts with `AIza...`)

2. **Configure .env file:**
   ```bash
   cd ai-service
   ```
   
   Edit `.env` file (create if doesn't exist):
   ```env
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   PORT=8000
   ```

3. **Restart AI Service:**
   ```bash
   # Stop the current service (Ctrl+C)
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

4. **Verify:**
   You should see: `✅ Using Google Gemini 1.5 Flash for quiz generation`

### Option 2: Use OpenAI (Paid)

1. **Get API Key:**
   - Go to: https://platform.openai.com/api-keys
   - Create new secret key

2. **Configure .env file:**
   ```env
   OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   PORT=8000
   ```

3. **Restart AI Service**

---

## 📄 Fix PDF Extraction Issues

### Problem: Very Few Characters Extracted

**Symptoms:**
```
⚠️  WARNING: Very little text extracted (45 chars)
```

**Causes:**
1. PDF is image-based (scanned document)
2. PDF has special encoding
3. PDF is encrypted/protected

**Solutions:**

#### Solution 1: Use Text-Based PDFs
- Ensure your PDF contains actual text, not just images
- Test: Can you select and copy text from the PDF?
- If not, you need OCR (Optical Character Recognition)

#### Solution 2: Convert Image PDFs
If your PDF is image-based:
1. Use an OCR tool to convert it
2. Or use a different PDF with actual text

#### Solution 3: Test with Sample PDF
Try with a known good PDF:
```bash
cd ai-service/uploads
# Download a test PDF
curl -o test.pdf https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
```

---

## 🧪 Test Your Setup

### Test 1: Check Dependencies

```bash
cd ai-service
python -c "import google.generativeai as genai; print('✅ Gemini SDK installed')"
python -c "from pypdf import PdfReader; print('✅ pypdf installed')"
```

### Test 2: Run Diagnostic Script

```bash
cd ai-service
python test_pdf_generation.py
```

This will show:
- AI provider status
- API key status
- PDF extraction test
- Quiz generation test

### Test 3: Manual API Test

```bash
cd ai-service
python -c "
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=key)
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content('Say hello')
print(response.text)
"
```

If this works, your API key is valid!

---

## 🐛 Common Issues & Fixes

### Issue 1: "No module named 'google.generativeai'"

**Fix:**
```bash
cd ai-service
pip install google-generativeai
```

### Issue 2: "Invalid API key"

**Fix:**
1. Check your API key has no extra spaces
2. Ensure it starts with `AIza`
3. Verify it's not expired
4. Generate a new key if needed

### Issue 3: "Rate limit exceeded"

**Fix:**
- Gemini free tier: 60 requests/minute
- Wait a minute and try again
- Or upgrade to paid tier

### Issue 4: Getting Fallback Questions

**Symptoms:**
Questions about "microservices", "Socket.IO", "Tailwind CSS"

**Fix:**
1. Check AI provider is not "fallback"
2. Verify API key is set correctly
3. Check console logs for errors
4. Ensure PDF has extractable text

### Issue 5: "Error querying Gemini"

**Check:**
1. Internet connection
2. API key is valid
3. Gemini service is not down
4. Check specific error message in logs

---

## 📊 Expected Behavior

### ✅ Correct Setup:

1. **AI Service Starts:**
   ```
   ✅ Using Google Gemini 1.5 Flash for quiz generation
   ```

2. **Upload PDF:**
   ```
   Extracting text from PDF...
   ✅ Extracted 5234 characters from file
   ```

3. **Generate Quiz:**
   ```
   🤖 Sending to GEMINI for quiz generation...
   ✅ Generated 5 questions successfully
   ```

4. **Questions are PDF-specific:**
   - Questions relate to your PDF content
   - Not generic fallback questions
   - Accurate and relevant

---

## 🔍 Debug Checklist

Use this checklist to diagnose issues:

- [ ] AI service is running (port 8000)
- [ ] `.env` file exists in `ai-service/` directory
- [ ] `GEMINI_API_KEY` is set in `.env`
- [ ] API key is valid (not placeholder)
- [ ] `google-generativeai` is installed
- [ ] PDF file uploads successfully
- [ ] PDF contains extractable text (not just images)
- [ ] Console shows "Using Google Gemini"
- [ ] Console shows character extraction count
- [ ] No error messages in console
- [ ] Questions relate to PDF content

---

## 🆘 Still Not Working?

### Get Detailed Logs:

1. **Check AI Service Console:**
   - Look for red error messages
   - Check the AI provider status
   - Note the character extraction count

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for fetch errors

3. **Test API Directly:**
   ```bash
   curl -X POST http://localhost:8000/generate-quiz \
     -F "file=@uploads/your-file.pdf" \
     -F "num_questions=3" \
     -F "difficulty=Medium"
   ```

### Common Error Messages:

| Error | Cause | Fix |
|-------|-------|-----|
| "No valid AI API key" | API key not set | Set GEMINI_API_KEY in .env |
| "Gemini initialization failed" | Invalid API key | Check key is correct |
| "Very little text extracted" | Image-based PDF | Use text-based PDF |
| "Error querying Gemini" | Network/API issue | Check internet, API status |
| "Unsupported file format" | Wrong file type | Use .pdf or .pptx only |

---

## ✨ Improvements Made

### Recent Updates:

1. **Better Logging:**
   - Detailed console output
   - Shows AI provider status
   - Displays extraction progress
   - Clear error messages

2. **Improved Model:**
   - Now using `gemini-1.5-flash`
   - Better performance
   - More accurate questions

3. **Enhanced Error Handling:**
   - Try-catch blocks
   - Graceful fallbacks
   - Detailed error messages

---

## 📝 Example Working Configuration

### ai-service/.env
```env
GEMINI_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=8000
```

### Expected Console Output:
```
============================================================
AI SERVICE INITIALIZATION
============================================================
✅ Using Google Gemini 1.5 Flash for quiz generation
   API Key: AIzaSyDXXX...XXXX
============================================================

INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.

============================================================
QUIZ GENERATION REQUEST
============================================================
File: uploads/Environment_3_Pages_Notes.pdf
Questions: 5
Difficulty: Medium
AI Provider: gemini

Extracting text from PDF...
✅ Extracted 3421 characters from file
   Preview: Environmental Science Notes
   Chapter 1: Introduction to Ecology...

🤖 Sending to GEMINI for quiz generation...
✅ Generated 5 questions successfully
============================================================
```

---

## 🎯 Next Steps

Once you fix the issue:

1. **Test with your PDF:**
   - Upload your actual PDF
   - Generate quiz
   - Verify questions are relevant

2. **Adjust parameters:**
   - Try different difficulty levels
   - Change question count
   - Edit questions if needed

3. **Deploy:**
   - Once working locally, deploy to production
   - Set environment variables on hosting platform

---

**Need more help?** Check the console logs and match them against this guide!
