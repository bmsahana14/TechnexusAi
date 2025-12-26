# 🔐 Supabase Setup Guide for TechNexus AI Quiz Arena

This guide will help you set up Supabase authentication and database for the quiz platform.

---

## 📋 Prerequisites

- A Supabase account (free tier works fine)
- Basic understanding of SQL
- Access to your project's environment variables

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Fill in the details:
   - **Name**: `technexus-quiz` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is sufficient for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

---

### Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
4. **Copy both values** - you'll need them in Step 4

---

### Step 3: Set Up the Database Schema

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `supabase_schema.sql` from your project
4. Paste it into the SQL editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. You should see: ✅ **Success. No rows returned**

**What this does:**
- Creates the `quizzes` table to store quiz data
- Sets up Row Level Security (RLS) policies
- Creates indexes for better performance

---

### Step 4: Configure Environment Variables

#### For the Client (Frontend)

1. Navigate to the `client` folder in your project
2. Create a file named `.env.local` (if it doesn't exist)
3. Add the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

4. **Replace the values:**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Project URL from Step 2
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon public key from Step 2
   - Keep `NEXT_PUBLIC_SOCKET_URL` as is for local development

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjQzMjAwMCwiZXhwIjoxOTMxOTk0MDAwfQ.example-key-here
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

---

### Step 5: Create Your First Admin User

You have **two options** to create an admin account:

#### Option A: Using Supabase Dashboard (Recommended)

1. In Supabase dashboard, click **Authentication** in the left sidebar
2. Click **Users** tab
3. Click **"Add user"** button
4. Choose **"Create new user"**
5. Fill in:
   - **Email**: Your admin email (e.g., `admin@technexus.com`)
   - **Password**: Choose a strong password
   - **Auto Confirm User**: ✅ Check this box (important!)
6. Click **"Create user"**

#### Option B: Using Sign Up Page (Alternative)

1. Start your development server: `npm run dev` (in the client folder)
2. Navigate to: `http://localhost:3000/login`
3. You'll need to create a signup page first (see below)

---

### Step 6: Test the Connection

1. **Restart your development server** if it's running:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   cd client
   npm run dev
   ```

2. **Open your browser** and go to: `http://localhost:3000/login`

3. **Try logging in** with the credentials you created in Step 5

4. **If successful**, you should be redirected to `/admin`

---

## 🔧 Troubleshooting

### Issue: "Invalid login credentials"

**Possible causes:**
- Wrong email or password
- User not confirmed (check "Auto Confirm User" in Step 5)
- Supabase credentials not set correctly

**Solutions:**
1. Double-check your email and password
2. Verify the user is confirmed in Supabase Dashboard → Authentication → Users
3. Check that `.env.local` has the correct values
4. Restart your dev server after changing `.env.local`

---

### Issue: "Failed to fetch" or Network Error

**Possible causes:**
- Supabase URL is incorrect
- Network connectivity issues
- CORS configuration

**Solutions:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` is correct
2. Check your internet connection
3. Make sure the URL starts with `https://` and ends with `.supabase.co`

---

### Issue: "Invalid API key"

**Possible causes:**
- Wrong anon key copied
- Extra spaces in the key
- Using the wrong key (service_role instead of anon)

**Solutions:**
1. Go back to Supabase Dashboard → Settings → API
2. Copy the **anon public** key (not service_role!)
3. Make sure there are no extra spaces or line breaks
4. Paste it correctly in `.env.local`

---

### Issue: Environment variables not loading

**Solutions:**
1. Make sure the file is named exactly `.env.local` (not `.env` or `env.local`)
2. The file should be in the `client` folder (not the root)
3. Restart your Next.js dev server after creating/editing `.env.local`
4. Check for syntax errors in the `.env.local` file

---

## 📝 Quick Verification Checklist

Before testing, verify:

- [ ] Supabase project is created and active
- [ ] Database schema is executed successfully
- [ ] `.env.local` file exists in the `client` folder
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- [ ] At least one admin user is created and confirmed
- [ ] Development server is restarted after env changes

---

## 🎯 Next Steps

Once Supabase is connected:

1. **Test Login**: Try logging in at `/login`
2. **Create a Quiz**: Upload a PDF/PPTX in the admin dashboard
3. **Host a Session**: Launch a live quiz
4. **Join as Player**: Test the player experience

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to version control (it's in `.gitignore`)
2. **Use strong passwords** for admin accounts
3. **Enable 2FA** on your Supabase account
4. **Rotate keys** if they're ever exposed
5. **Use environment-specific** credentials (dev vs production)

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. Check the browser console for error messages (F12 → Console tab)
2. Check the terminal where your dev server is running for errors
3. Verify all steps above are completed correctly
4. Try creating a new Supabase project and starting fresh
5. Check if Supabase is experiencing any outages: [status.supabase.com](https://status.supabase.com)

---

**Last Updated**: December 25, 2025  
**Version**: 1.1.0
