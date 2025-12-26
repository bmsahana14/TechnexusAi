# 🤖 AI Quiz Generation Not Working - Fix Guide

## ❌ Problem Identified

Your AI service has a **placeholder API key** instead of a real OpenAI API key:

**Current (WRONG):**
```
OPENAI_API_KEY=dummy_key_for_testing
```

This is why the quiz questions are not based on your PDF content - the AI service can't connect to OpenAI!

---

## ✅ Solution: Get a Real OpenAI API Key

### Option 1: Get OpenAI API Key (Recommended)

#### Step 1: Create OpenAI Account

1. **Go to:** https://platform.openai.com/signup
2. **Sign up** with email, Google, or Microsoft account
3. **Verify** your email address

#### Step 2: Add Payment Method

⚠️ **Important:** OpenAI requires a payment method, but:
- You get **$5 free credits** for new accounts
- GPT-4o-mini is very cheap (~$0.15 per 1M input tokens)
- Generating 100 quizzes costs less than $1

1. **Go to:** https://platform.openai.com/account/billing/overview
2. **Click:** "Add payment method"
3. **Add** a credit/debit card
4. **Set** a spending limit (e.g., $5/month) to control costs

#### Step 3: Create API Key

1. **Go to:** https://platform.openai.com/api-keys
2. **Click:** "Create new secret key"
3. **Name it:** "TechNexus Quiz App"
4. **Copy** the key (starts with `sk-proj-...`)
   - ⚠️ **IMPORTANT:** Save it immediately! You can't see it again!
5. **Store safely** - you'll need it in Step 4

#### Step 4: Update AI Service .env File

1. **Open:** `c:\Users\lenovo\quiz app\ai-service\.env`
2. **Replace** the dummy key with your real key:

**Before:**
```env
OPENAI_API_KEY=dummy_key_for_testing
PORT=8000
```

**After:**
```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
PORT=8000
```

3. **Save** the file

#### Step 5: Restart AI Service

```powershell
# In the terminal running the AI service
# Press Ctrl+C to stop
# Then run:
cd ai-service
python main.py
```

---

### Option 2: Use Fallback Questions (Free, Testing Only)

If you don't want to use OpenAI right now, the AI service has a **fallback mode** that generates generic questions when the API fails.

**Current behavior:**
- Tries to use OpenAI with dummy key
- Fails
- Returns 5 generic fallback questions (not based on your PDF)

**To test without OpenAI:**
- Just keep the current setup
- The fallback questions will appear
- They won't be related to your PDF content
- Good for testing the UI/flow

---

## 🔍 How to Verify It's Working

### With Real OpenAI Key:
1. Upload a PDF about a specific topic (e.g., "Machine Learning")
2. Generate quiz
3. Questions should be **directly related** to the PDF content
4. Questions should reference specific concepts from the document

### With Fallback Mode:
1. Upload any PDF
2. Generate quiz
3. Questions will be **generic** about the platform itself
4. Questions like "What is the primary architectural style?"

---

## 💰 Cost Estimate

Using GPT-4o-mini (what the app uses):

| Usage | Approximate Cost |
|-------|-----------------|
| 1 quiz (5 questions) | ~$0.001 (less than 1 cent) |
| 100 quizzes | ~$0.10 (10 cents) |
| 1000 quizzes | ~$1.00 |

**Free credits:** $5 = ~5,000 quizzes!

---

## 🎯 Quick Decision Guide

### Choose OpenAI if:
- ✅ You want questions based on actual PDF content
- ✅ You need production-quality quizzes
- ✅ You're okay with minimal cost (~$0.001 per quiz)
- ✅ You have a credit/debit card

### Use Fallback if:
- ✅ Just testing the platform
- ✅ Don't need PDF-specific questions
- ✅ Want to avoid any costs
- ✅ Don't have OpenAI account

---

## 📋 OpenAI Setup Checklist

- [ ] Created OpenAI account
- [ ] Verified email
- [ ] Added payment method
- [ ] Set spending limit (optional but recommended)
- [ ] Created API key
- [ ] Copied and saved the key
- [ ] Updated `ai-service/.env` with real key
- [ ] Restarted AI service
- [ ] Tested with a PDF upload

---

## 🔗 Quick Links

- **OpenAI Signup:** https://platform.openai.com/signup
- **API Keys:** https://platform.openai.com/api-keys
- **Billing:** https://platform.openai.com/account/billing/overview
- **Pricing:** https://openai.com/api/pricing/

---

## 🐛 Troubleshooting

### "Incorrect API key provided"
- ✅ Make sure you copied the entire key (starts with `sk-proj-` or `sk-`)
- ✅ No extra spaces before/after the key
- ✅ Key is from https://platform.openai.com/api-keys

### "You exceeded your current quota"
- ✅ Add a payment method to your OpenAI account
- ✅ Check billing at https://platform.openai.com/account/billing

### "Rate limit exceeded"
- ✅ Wait a few seconds and try again
- ✅ Free tier has rate limits (3 requests/minute)

### Still getting generic questions
- ✅ Make sure you restarted the AI service after updating .env
- ✅ Check browser console (F12) for errors
- ✅ Check AI service terminal for error messages

---

## 🎓 Example: Before vs After

### Before (Fallback Questions):
```
Q: What is the primary architectural style of this application?
Q: Which library is used for realtime communication?
Q: What is the role of the AI Service?
```
*(Generic, not related to your PDF)*

### After (With OpenAI):
If you upload a PDF about "Python Programming":
```
Q: What is the main difference between lists and tuples in Python?
Q: Which Python keyword is used to define a function?
Q: What does the 'self' parameter represent in Python classes?
```
*(Specific to your PDF content)*

---

## 🚀 Recommended Next Steps

1. **Get OpenAI API key** (5 minutes)
2. **Update** `ai-service/.env`
3. **Restart** AI service
4. **Test** with a PDF upload
5. **Verify** questions are relevant to PDF content

---

**Current Status:** AI service is using fallback mode (dummy key)  
**To Fix:** Get real OpenAI API key and update `ai-service/.env`  
**Time Required:** ~10 minutes  
**Cost:** ~$0.001 per quiz (free $5 credits available)
