# 🚀 Quick Start Guide - Fix Admin Login & Supabase Connection

## ⚠️ Current Issue
You cannot login as admin because Supabase is not configured yet.

---

## ✅ Solution: 3-Step Setup

### Step 1: Create Supabase Account & Project (5 minutes)

1. **Go to** [https://supabase.com](https://supabase.com)
2. **Sign up** for a free account (or login if you have one)
3. **Click** "New Project"
4. **Fill in:**
   - Name: `technexus-quiz`
   - Database Password: (create a strong password - save it!)
   - Region: Choose closest to you
5. **Click** "Create new project"
6. **Wait** 2-3 minutes for setup to complete

---

### Step 2: Get Your API Credentials (2 minutes)

1. In your Supabase dashboard, click **Settings** (⚙️ icon)
2. Click **API** in the left menu
3. You'll see two values - **COPY BOTH**:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: Long string starting with `eyJ...`

---

### Step 3: Configure Your App (3 minutes)

#### A. Create Environment File

1. **Navigate to** `c:\Users\lenovo\quiz app\client`
2. **Create a new file** named `.env.local` (exactly this name!)
3. **Paste this content:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

4. **Replace** the placeholder values:
   - Replace `https://your-project-id.supabase.co` with YOUR Project URL from Step 2
   - Replace `your-anon-key-here` with YOUR anon public key from Step 2
   - Keep the Socket URL as is

**Example of completed .env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTY0MzIwMDAsImV4cCI6MTkzMTk5NDAwMH0.example-key
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

#### B. Set Up Database

1. **In Supabase dashboard**, click **SQL Editor**
2. **Click** "New query"
3. **Copy** the entire content from `c:\Users\lenovo\quiz app\supabase_schema.sql`
4. **Paste** it into the SQL editor
5. **Click** "Run" (or press Ctrl+Enter)
6. You should see: ✅ "Success. No rows returned"

#### C. Create Admin User

1. **In Supabase dashboard**, click **Authentication**
2. **Click** "Users" tab
3. **Click** "Add user" → "Create new user"
4. **Fill in:**
   - Email: `admin@technexus.com` (or your preferred email)
   - Password: (create a strong password)
   - ✅ **Check** "Auto Confirm User" (IMPORTANT!)
5. **Click** "Create user"

---

### Step 4: Test It! (1 minute)

1. **Restart your dev server:**
   ```powershell
   # In the terminal running the client
   # Press Ctrl+C to stop
   # Then run:
   npm run dev
   ```

2. **Open browser:** http://localhost:3000/login

3. **Login with:**
   - Email: The email you created in Step 3C
   - Password: The password you created in Step 3C

4. **Success!** You should be redirected to `/admin`

---

## 🎯 Quick Verification Checklist

Before testing, make sure:

- [ ] `.env.local` file exists in `client` folder
- [ ] File contains all 3 environment variables
- [ ] Values are replaced (not placeholders)
- [ ] Database schema is executed in Supabase
- [ ] Admin user is created and confirmed
- [ ] Dev server is restarted

---

## 🐛 Still Not Working?

### Error: "Invalid login credentials"
**Fix:** 
- Check that "Auto Confirm User" was checked when creating the user
- Verify email and password are correct
- In Supabase → Authentication → Users, check if user shows "Confirmed"

### Error: "Failed to fetch" or Network Error
**Fix:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Make sure it starts with `https://` and ends with `.supabase.co`
- Check your internet connection

### Error: "Invalid API key"
**Fix:**
- Go to Supabase → Settings → API
- Copy the **anon public** key (NOT service_role!)
- Make sure there are no extra spaces
- Paste it correctly in `.env.local`

### Environment variables not loading
**Fix:**
- File must be named exactly `.env.local` (not `.env` or `env.local`)
- File must be in the `client` folder
- Restart dev server after creating/editing the file
- Check for syntax errors (no quotes needed around values)

---

## 📁 File Locations Reference

```
quiz app/
├── client/
│   ├── .env.local          ← CREATE THIS FILE HERE
│   ├── .env.example        ← Template to copy from
│   └── ...
├── supabase_schema.sql     ← Copy this to Supabase SQL Editor
└── SUPABASE_SETUP.md       ← Detailed guide (if you need more help)
```

---

## 🎉 What's Next?

Once you're logged in:

1. **Upload a PDF/PPTX** in the admin dashboard
2. **Generate quiz questions** with AI (Google Gemini is now configured and ready!)
3. **Launch a live quiz** session
4. **Join as a player** in another browser/device
5. **Test the real-time features**

---

## 📚 Need More Help?

- **Detailed Guide:** See `SUPABASE_SETUP.md` for comprehensive instructions
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Check Console:** Press F12 in browser to see error messages

---

**Estimated Time:** 10-15 minutes total  
**Difficulty:** Easy  
**Cost:** Free (Supabase free tier)
