# 🚀 Quick Deployment Checklist for Render

## Before You Deploy

### 1. Ensure Code is Ready
- [ ] All services run locally without errors
- [ ] Environment variables are documented
- [ ] `.gitignore` is properly configured
- [ ] Code is committed to Git

### 2. Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 3. Gather Required Information
You'll need:
- [ ] **Supabase URL**: `https://your-project.supabase.co`
- [ ] **Supabase Anon Key**: From Supabase Dashboard → Settings → API
- [ ] **Google Gemini API Key**: From https://aistudio.google.com/app/apikey

## Deployment Options

### Option A: Blueprint Deployment (Recommended - Fastest)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and show all three services
5. Set environment variables for each service:

#### AI Service Environment Variables:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

#### Frontend Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SOCKET_URL=https://technexus-realtime-service.onrender.com
NEXT_PUBLIC_AI_SERVICE_URL=https://technexus-ai-service.onrender.com
```

**Note**: The URLs for `NEXT_PUBLIC_SOCKET_URL` and `NEXT_PUBLIC_AI_SERVICE_URL` will be generated after deployment. You may need to update them after the first deployment.

6. Click **"Apply"** to deploy all services at once

### Option B: Manual Deployment (Step-by-Step)

Follow the detailed guide in `RENDER_DEPLOYMENT.md`

## Post-Deployment Steps

### 1. Get Service URLs

After deployment, note down the URLs for each service:
- AI Service: `https://technexus-ai-service.onrender.com`
- Realtime Service: `https://technexus-realtime-service.onrender.com`
- Frontend: `https://technexus-quiz-platform.onrender.com`

### 2. Update Frontend Environment Variables

Go to the Frontend service in Render Dashboard:
1. Click on **"Environment"** tab
2. Update these variables with actual URLs:
   - `NEXT_PUBLIC_SOCKET_URL`: Use the Realtime Service URL
   - `NEXT_PUBLIC_AI_SERVICE_URL`: Use the AI Service URL
3. Click **"Save Changes"**
4. The service will automatically redeploy

### 3. Test Each Service

#### Test AI Service:
```bash
curl https://technexus-ai-service.onrender.com/
# Should return: {"message":"AI Service is running and ready to process files."}

curl https://technexus-ai-service.onrender.com/status
# Should return AI provider status
```

#### Test Realtime Service:
```bash
curl https://technexus-realtime-service.onrender.com/
# Should return Socket.io connection page
```

#### Test Frontend:
Open `https://technexus-quiz-platform.onrender.com/` in your browser

### 4. Test Full Flow

1. **Create a Quiz**:
   - Go to admin page
   - Upload a PDF
   - Generate quiz questions
   - Start the quiz

2. **Join as Participant**:
   - Open the quiz URL on another device/browser
   - Join with a name
   - Answer questions

3. **Verify Real-time Features**:
   - Check if participants appear in real-time
   - Verify question transitions work
   - Check leaderboard updates

## Common Issues & Solutions

### Issue: Services Keep Spinning Down
**Solution**: Render's free tier spins down after 15 minutes of inactivity. Upgrade to a paid plan or accept the 30-60 second cold start.

### Issue: Environment Variables Not Working
**Solution**: 
1. Double-check spelling and values
2. Ensure no extra spaces
3. For Next.js, variables must start with `NEXT_PUBLIC_`
4. Redeploy after changing environment variables

### Issue: CORS Errors
**Solution**: The services are configured to allow all origins. If you still see CORS errors:
1. Check browser console for exact error
2. Ensure URLs don't have trailing slashes
3. Verify HTTPS is used (not HTTP)

### Issue: WebSocket Connection Failed
**Solution**:
1. Ensure `NEXT_PUBLIC_SOCKET_URL` uses `https://` (not `http://`)
2. Check that realtime service is running
3. Verify no firewall blocking WebSocket connections

### Issue: AI Generation Not Working
**Solution**:
1. Verify `GEMINI_API_KEY` is set correctly
2. Check AI service logs in Render dashboard
3. Test the `/status` endpoint to see AI provider status

### Issue: Build Failures
**Solution**:
1. Check build logs in Render dashboard
2. Ensure all dependencies are listed in:
   - `requirements.txt` (Python)
   - `package.json` (Node.js)
3. Verify Python/Node versions are compatible

## Monitoring & Maintenance

### View Logs
1. Go to Render Dashboard
2. Click on a service
3. Click **"Logs"** tab
4. Monitor real-time logs

### Enable Auto-Deploy
1. Go to service settings
2. Enable **"Auto-Deploy"**
3. Now every push to `main` branch will trigger deployment

### Set Up Alerts
1. Go to service settings
2. Configure **"Notifications"**
3. Add email or Slack webhook for alerts

## Performance Tips

### Free Tier Optimization
- Services spin down after 15 minutes
- First request takes 30-60 seconds (cold start)
- Consider upgrading critical services to paid plans

### Scaling Considerations
- Use Redis for session storage (instead of in-memory)
- Enable CDN for static assets
- Consider using Render's PostgreSQL for persistent data

## Cost Estimates

### Free Tier (Current Setup)
- **Cost**: $0/month
- **Limitations**: 
  - 750 hours/month per service
  - Services spin down after inactivity
  - Shared resources

### Starter Plan (Recommended for Production)
- **Cost**: ~$21/month (3 services × $7/month)
- **Benefits**:
  - No spin-down
  - Better performance
  - More resources

## Next Steps

- [ ] Deploy all services
- [ ] Test complete quiz flow
- [ ] Share quiz platform URL
- [ ] Monitor logs for any issues
- [ ] Consider upgrading to paid plan for production use

## Support

If you encounter issues:
1. Check Render's [Status Page](https://status.render.com/)
2. Review [Render Documentation](https://render.com/docs)
3. Check service logs in Render Dashboard
4. Review `RENDER_DEPLOYMENT.md` for detailed troubleshooting

---

**Ready to deploy?** Start with Option A (Blueprint Deployment) for the fastest setup!
