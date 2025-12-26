# 🚀 Quick Setup: Free AI with Google Gemini

## ✅ No Credit Card Required!

Follow these 4 simple steps to get AI-powered quiz generation for FREE!

---

## Step 1: Get Free Gemini API Key (2 minutes)

1. **Go to:** https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account (Gmail)
3. **Click:** "Create API Key"
4. **Select:** "Create API key in new project"
5. **Copy** the key (starts with `AIza...`)
6. **Save it** - you'll need it in Step 3

---

## Step 2: Install Gemini Library (1 minute)

Open PowerShell and run:

```powershell
cd "c:\Users\lenovo\quiz app\ai-service"
pip install google-generativeai
```

Wait for installation to complete (should see "Successfully installed...")

---

## Step 3: Update Configuration (1 minute)

1. **Open:** `c:\Users\lenovo\quiz app\ai-service\.env`
2. **Add this line** at the top:

```env
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
OPENAI_API_KEY=dummy_key_for_testing
PORT=8000
```

3. **Replace** `YOUR_GEMINI_KEY_HERE` with the key you copied in Step 1
4. **Save** the file

**Example:**
```env
GEMINI_API_KEY=AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567
OPENAI_API_KEY=dummy_key_for_testing
PORT=8000
```

---

## Step 4: Use the New Code (1 minute)

### Option A: Replace the file (Recommended)

1. **Rename** `quiz_generator.py` to `quiz_generator_old.py` (backup)
2. **Rename** `quiz_generator_gemini.py` to `quiz_generator.py`

**PowerShell commands:**
```powershell
cd "c:\Users\lenovo\quiz app\ai-service"
Rename-Item quiz_generator.py quiz_generator_old.py
Rename-Item quiz_generator_gemini.py quiz_generator.py
```

### Option B: Manual copy (Alternative)

1. **Open:** `quiz_generator_gemini.py`
2. **Copy** all content
3. **Open:** `quiz_generator.py`
4. **Replace** all content with copied content
5. **Save**

---

## Step 5: Restart AI Service (30 seconds)

```powershell
cd "c:\Users\lenovo\quiz app\ai-service"
python main.py
```

You should see:
```
✅ Using Google Gemini for quiz generation
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## ✅ Test It!

1. **Open:** http://localhost:3000/admin
2. **Upload** a PDF about any topic (e.g., Python, AI, History)
3. **Click:** "Generate Quiz"
4. **Verify:** Questions should be related to your PDF content!

---

## 🎯 What Changed?

**Before (Fallback Mode):**
- ❌ Generic questions
- ❌ Not related to PDF
- ❌ Same questions every time

**After (Gemini):**
- ✅ PDF-specific questions
- ✅ Contextual and relevant
- ✅ Different questions each time
- ✅ Completely FREE!

---

## 📋 Quick Checklist

- [ ] Got Gemini API key from https://aistudio.google.com/app/apikey
- [ ] Installed google-generativeai: `pip install google-generativeai`
- [ ] Added GEMINI_API_KEY to ai-service/.env
- [ ] Replaced quiz_generator.py with new version
- [ ] Restarted AI service
- [ ] Tested with a PDF upload

---

## 🐛 Troubleshooting

### "Module 'google.generativeai' not found"
**Fix:** Run `pip install google-generativeai` in ai-service folder

### "Invalid API key"
**Fix:** 
- Make sure you copied the entire key
- Key should start with `AIza`
- No spaces before/after the key
- Get new key at https://aistudio.google.com/app/apikey

### Still getting fallback questions
**Fix:**
- Check that GEMINI_API_KEY is in .env file
- Restart the AI service
- Check terminal for "✅ Using Google Gemini" message

### "Rate limit exceeded"
**Fix:**
- Free tier: 60 requests/minute
- Wait a few seconds and try again
- This is very generous for normal use

---

## 💡 Pro Tips

1. **Keep the old file:** We renamed it to `quiz_generator_old.py` as backup
2. **Test with different PDFs:** Try various topics to see quality
3. **Adjust difficulty:** Use Easy/Medium/Hard in the UI
4. **Check logs:** Terminal shows what's happening

---

## 🎉 Benefits of Gemini

- ✅ **FREE forever** (no card needed)
- ✅ **60 requests/minute** (very generous)
- ✅ **High quality** (comparable to GPT-4)
- ✅ **Fast responses**
- ✅ **Good at following JSON format**

---

## 📊 Comparison

| Feature | Fallback | Gemini (FREE) | OpenAI (Paid) |
|---------|----------|---------------|---------------|
| Cost | Free | Free | ~$0.001/quiz |
| Card Required | No | No | Yes |
| PDF-Specific | No | Yes | Yes |
| Quality | Low | High | Very High |
| Setup Time | 0 min | 5 min | 10 min |

---

## 🚀 You're All Set!

Once you complete the 5 steps above, you'll have:
- ✅ Free AI-powered quiz generation
- ✅ PDF-specific questions
- ✅ No credit card required
- ✅ Production-ready quality

---

**Total Time:** ~5 minutes  
**Cost:** $0 (completely free!)  
**Result:** Professional AI quiz generation! 🎉
