# 🔧 Supabase Setup Guide

## Current Issue
You're seeing the error `Error saving quiz to DB: {}` because **Supabase is not configured**.

## Why This Happens
- The app is trying to save quizzes to a database, but no database credentials are set
- Without proper Supabase credentials, the error object is empty
- **Good news**: Your quizzes are still being saved locally in the browser!

## Quick Fix Options

### Option 1: Continue Without Database (Recommended for Testing)
Your app works perfectly fine without Supabase! Quizzes are saved in your browser's local storage.

**Pros:**
- No setup required
- Works immediately
- Perfect for testing and development

**Cons:**
- Quizzes only available on this browser
- Clearing browser data will delete quizzes

### Option 2: Set Up Supabase (For Production/Multi-Device)

#### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Fill in:
   - **Name**: TechNexus Quiz Arena
   - **Database Password**: (create a strong password)
   - **Region**: (choose closest to you)
5. Click "Create new project" and wait 2-3 minutes

#### Step 2: Get Your Credentials
1. In your Supabase project, click the ⚙️ **Settings** icon (bottom left)
2. Click **API** in the sidebar
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

#### Step 3: Create Database Table
1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Paste this SQL:

```sql
-- Create quizzes table
CREATE TABLE quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    questions JSONB NOT NULL,
    creator_id TEXT NOT NULL,
    room_id TEXT NOT NULL,
    timer INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_quizzes_creator_id ON quizzes(creator_id);
CREATE INDEX idx_quizzes_room_id ON quizzes(room_id);

-- Enable Row Level Security (RLS)
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
-- In production, you should restrict this!
CREATE POLICY "Allow all operations for now" ON quizzes
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

4. Click **Run** (or press F5)

#### Step 4: Configure Your App
1. In your project folder, create a file named `.env.local`
2. Add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:5000
```

3. **Replace** `your-project-id.supabase.co` with your actual Project URL
4. **Replace** `your-anon-key-here` with your actual anon key

#### Step 5: Restart Your App
1. Stop the development server (Ctrl+C in the terminal)
2. Start it again: `npm run dev`
3. Refresh your browser

## Verify It's Working

After setup, when you create a quiz:
- ✅ You should see: `Quiz saved to database successfully!` in the console
- ❌ No more: `Error saving quiz to DB: {}`

## Troubleshooting

### Still seeing errors?
1. Check that `.env.local` exists in the root folder (same level as `package.json`)
2. Verify the credentials are correct (no extra spaces)
3. Make sure you restarted the dev server after creating `.env.local`
4. Check the browser console for more detailed error messages

### Want to disable Supabase entirely?
The app works great without it! Just ignore the warning messages. Your quizzes will be saved locally.

## Need Help?
- [Supabase Documentation](https://supabase.com/docs)
- [TechNexus Arena GitHub Issues](https://github.com/yourusername/quiz-app/issues)
