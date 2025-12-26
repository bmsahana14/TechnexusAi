# 🔧 QUICK FIX: PDF Quiz Generation Issue

## Problem
Quizzes are showing generic questions instead of content from your uploaded PDF.

---

## ✅ Most Likely Cause
**Your Gemini API key is not configured.**

---

## 🚀 Quick Solution (5 minutes)

### Step 1: Get Gemini API Key (FREE)
1. Go to: **https://aistudio.google.com/app/apikey**
2. Click **"Create API Key"**
3. Copy the key (starts with `AIza...`)

### Step 2: Configure API Key
1. Open: `c:\Users\lenovo\quiz app\ai-service\.env`
   - If file doesn't exist, create it

2. Add this line (replace with your actual key):
   ```env
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   PORT=8000
   ```

3. Save the file

### Step 3: Restart AI Service
1. Stop the current AI service (press `Ctrl+C` in terminal)
2. Start it again:
   ```bash
   cd "c:\Users\lenovo\quiz app\ai-service"
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Step 4: Verify
You should see this message:
```
============================================================
AI SERVICE INITIALIZATION
============================================================
✅ Using Google Gemini 1.5 Flash for quiz generation
   API Key: AIzaSyXXXX...XXXX
============================================================
```

**If you see:** `⚠️ No valid AI API key found` → Check your .env file again

---

## 🧪 Test It

1. Go to: http://localhost:3000/admin
2. Upload a PDF file
3. Click "Generate Quiz"
4. Check the AI service console - you should see:
   ```
   Extracting text from PDF...
   ✅ Extracted XXXX characters from file
   🤖 Sending to GEMINI for quiz generation...
   ✅ Generated 5 questions successfully
   ```

5. Questions should now be **specific to your PDF content**!

---

## 🎯 What Changed

### Improvements Made:

1. **Better Model:** Now using `gemini-1.5-flash` (faster, more accurate)
2. **Better Logging:** Detailed console output shows exactly what's happening
3. **Better Debugging:** Clear error messages tell you what's wrong

### Files Updated:

- `ai-service/quiz_generator.py` - Enhanced logging and model
- `ai-service/.env.example` - Updated template
- `TROUBLESHOOTING_PDF_QUIZ.md` - Complete troubleshooting guide

---

## ❓ Still Not Working?

### Check These:

1. **API Key Format:**
   - Should start with `AIza`
   - No spaces before or after
   - No quotes around it

2. **File Location:**
   - `.env` file must be in `ai-service/` directory
   - Not in root directory

3. **PDF Content:**
   - PDF must contain actual text (not just images)
   - Try copying text from PDF - if you can't, it's image-based

4. **Console Logs:**
   - Check what "AI Provider" shows
   - Look for error messages in red
   - Check character extraction count

---

## 📚 More Help

- **Full Guide:** See `TROUBLESHOOTING_PDF_QUIZ.md`
- **Test Script:** Run `python test_pdf_generation.py` in ai-service folder
- **Check Logs:** Look at AI service console for detailed output

---

## ✨ Expected Result

### Before Fix:
```
Questions about:
- "What is the primary architectural style of this application?"
- "Which library is used for realtime communication?"
- "What is the role of the AI Service?"
```
❌ Generic fallback questions

### After Fix:
```
Questions about YOUR PDF content:
- Specific topics from your document
- Relevant concepts from your presentation
- Accurate details from your file
```
✅ PDF-specific questions!

---

**That's it!** Your quiz generation should now work correctly with PDF content.
