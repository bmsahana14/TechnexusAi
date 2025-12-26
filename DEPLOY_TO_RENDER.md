# 🚀 Deploy to Render - Quick Start Guide

## What You Need Before Starting

1. **GitHub Account** - Your code must be on GitHub
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **API Keys**:
   - Supabase URL and Anon Key (from your Supabase project)
   - Google Gemini API Key (from [Google AI Studio](https://aistudio.google.com/app/apikey))

## 🎯 Fastest Deployment Method (5 Minutes)

### Step 1: Push Your Code to GitHub

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Deploy Using Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Select **"Connect a repository"**
4. Choose your GitHub repository
5. Render will detect `render.yaml` automatically
6. You'll see 3 services ready to deploy:
   - `technexus-ai-service` (Python)
   - `technexus-realtime-service` (Node.js)
   - `technexus-quiz-platform` (Next.js)

### Step 3: Configure Environment Variables

Click on each service and add the required environment variables:

#### 🤖 AI Service
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

#### 🌐 Frontend (Important!)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_SOCKET_URL=https://technexus-realtime-service.onrender.com
NEXT_PUBLIC_AI_SERVICE_URL=https://technexus-ai-service.onrender.com
```

**Note**: The service URLs will be generated after deployment. You can update them later.

#### ⚡ Realtime Service
No additional environment variables needed!

### Step 4: Deploy!

Click **"Apply"** and wait for all services to deploy (5-10 minutes).

### Step 5: Update Frontend URLs

After deployment completes:

1. Note the actual URLs for each service (shown in Render dashboard)
2. Go to the **Frontend service** → **Environment** tab
3. Update these two variables with the actual URLs:
   - `NEXT_PUBLIC_SOCKET_URL` → Use the Realtime Service URL
   - `NEXT_PUBLIC_AI_SERVICE_URL` → Use the AI Service URL
4. Click **"Save Changes"** (this will trigger a redeploy)

### Step 6: Test Your Deployment

Visit your frontend URL (e.g., `https://technexus-quiz-platform.onrender.com`)

Test the complete flow:
1. ✅ Create a quiz (upload PDF)
2. ✅ Generate questions with AI
3. ✅ Start the quiz
4. ✅ Join as a participant (use another browser/device)
5. ✅ Answer questions
6. ✅ View real-time leaderboard

## 🎉 You're Live!

Your quiz platform is now deployed and accessible worldwide!

## 📚 Additional Resources

- **Detailed Guide**: See `RENDER_DEPLOYMENT.md` for step-by-step manual deployment
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md` for troubleshooting and post-deployment tasks
- **Verification**: Run `node check-deployment.js` to verify your setup before deploying

## ⚠️ Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month per service

### Recommended for Production
- Upgrade to **Starter plan** ($7/month per service) for:
  - No spin-down
  - Better performance
  - Faster response times

## 🐛 Common Issues

### "Cannot connect to AI service"
- Check if `GEMINI_API_KEY` is set correctly
- Visit `https://your-ai-service.onrender.com/status` to check AI provider status

### "WebSocket connection failed"
- Ensure `NEXT_PUBLIC_SOCKET_URL` uses `https://` (not `http://`)
- Verify realtime service is running

### "Build failed"
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json` and `requirements.txt`

## 💡 Pro Tips

1. **Enable Auto-Deploy**: Automatically deploy when you push to GitHub
2. **Monitor Logs**: Use Render's log viewer to debug issues
3. **Custom Domain**: Add your own domain in Render settings
4. **Environment Groups**: Use Render's environment groups to share variables across services

## 🔗 Quick Links

- [Render Dashboard](https://dashboard.render.com/)
- [Render Documentation](https://render.com/docs)
- [Google Gemini API](https://aistudio.google.com/app/apikey)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

**Need help?** Check the troubleshooting section in `DEPLOYMENT_CHECKLIST.md`
