# 🚀 Deploying TechNexus AI Quiz Platform to Render

This guide will walk you through deploying all three services of the TechNexus AI Quiz Platform to Render.

## 📋 Prerequisites

1. A [Render account](https://render.com) (free tier available)
2. Your GitHub repository pushed to GitHub
3. Supabase project credentials
4. Google Gemini API key

## 🏗️ Architecture Overview

Your application consists of three services:
- **Frontend (Next.js)** - Main web application
- **AI Service (Python/FastAPI)** - Quiz generation backend
- **Realtime Service (Node.js)** - WebSocket server for real-time features

## 📦 Step 1: Prepare Your Repository

### 1.1 Create Build Configuration Files

First, we need to create configuration files for each service.

#### For AI Service (Python)
Create `ai-service/render.yaml` (already handled below)

#### For Realtime Service (Node.js)
Create `realtime-service/render.yaml` (already handled below)

### 1.2 Update .gitignore

Ensure your `.gitignore` includes:
```
.env
.env.local
node_modules/
__pycache__/
uploads/
.next/
```

### 1.3 Push to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## 🔧 Step 2: Deploy AI Service (Python/FastAPI)

### 2.1 Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `technexus-ai-service`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `ai-service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free` (or paid if needed)

### 2.2 Set Environment Variables

In the Render dashboard for this service, add:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: `8000` (Render will override this automatically)

### 2.3 Deploy

Click **"Create Web Service"** and wait for deployment to complete.

**Note the URL**: It will be something like `https://technexus-ai-service.onrender.com`

## 🔧 Step 3: Deploy Realtime Service (Node.js/Socket.io)

### 3.1 Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `technexus-realtime-service`
   - **Region**: Same as AI service
   - **Branch**: `main`
   - **Root Directory**: `realtime-service`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3.2 Set Environment Variables

- `PORT`: `4000` (Render will override this)

### 3.3 Deploy

Click **"Create Web Service"** and wait for deployment.

**Note the URL**: It will be something like `https://technexus-realtime-service.onrender.com`

## 🔧 Step 4: Deploy Frontend (Next.js)

### 4.1 Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `technexus-quiz-platform`
   - **Region**: Same as other services
   - **Branch**: `main`
   - **Root Directory**: `.` (root directory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 4.2 Set Environment Variables

Add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SOCKET_URL=https://technexus-realtime-service.onrender.com
NEXT_PUBLIC_AI_SERVICE_URL=https://technexus-ai-service.onrender.com
```

**Important**: Replace the URLs with the actual URLs from Step 2 and Step 3.

### 4.3 Deploy

Click **"Create Web Service"** and wait for deployment.

Your app will be live at: `https://technexus-quiz-platform.onrender.com`

## ⚙️ Step 5: Configure CORS

### 5.1 Update AI Service CORS

The AI service is already configured to allow all origins (`allow_origins=["*"]`), but for production, you should update `ai-service/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://technexus-quiz-platform.onrender.com",
        "https://technexus-realtime-service.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5.2 Update Realtime Service CORS

Update `realtime-service/server.js` to include your frontend URL in CORS configuration.

## 🔍 Step 6: Verify Deployment

### 6.1 Check AI Service
Visit: `https://technexus-ai-service.onrender.com/`
Should return: `{"message": "AI Service is running and ready to process files."}`

### 6.2 Check Realtime Service
Visit: `https://technexus-realtime-service.onrender.com/`
Should return a Socket.io connection page

### 6.3 Check Frontend
Visit: `https://technexus-quiz-platform.onrender.com/`
Your quiz platform should load!

## 🐛 Troubleshooting

### Free Tier Limitations

Render's free tier has some limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 750 hours/month of runtime per service

### Common Issues

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `requirements.txt` or `package.json`

2. **Environment Variables**
   - Double-check all URLs and API keys
   - Ensure no trailing slashes in URLs

3. **CORS Errors**
   - Update CORS settings in both AI and Realtime services
   - Add your Render URLs to allowed origins

4. **WebSocket Connection Issues**
   - Ensure `NEXT_PUBLIC_SOCKET_URL` uses `https://` (not `http://`)
   - Check that realtime service is running

## 🎯 Alternative: Use Blueprint (Advanced)

For easier deployment, you can use Render's Blueprint feature. Create a `render.yaml` in your root directory:

```yaml
services:
  # AI Service
  - type: web
    name: technexus-ai-service
    runtime: python
    buildCommand: pip install -r ai-service/requirements.txt
    startCommand: cd ai-service && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: GEMINI_API_KEY
        sync: false
      - key: PORT
        value: 8000

  # Realtime Service
  - type: web
    name: technexus-realtime-service
    runtime: node
    buildCommand: cd realtime-service && npm install
    startCommand: cd realtime-service && npm start
    envVars:
      - key: PORT
        value: 4000

  # Frontend
  - type: web
    name: technexus-quiz-platform
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NEXT_PUBLIC_SUPABASE_URL
        sync: false
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        sync: false
      - key: NEXT_PUBLIC_SOCKET_URL
        sync: false
      - key: NEXT_PUBLIC_AI_SERVICE_URL
        sync: false
```

Then deploy using **"New +"** → **"Blueprint"** and select your repository.

## 📝 Post-Deployment Checklist

- [ ] All three services are deployed and running
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly
- [ ] Supabase connection works
- [ ] AI quiz generation works
- [ ] Real-time features work (WebSocket)
- [ ] Test creating and joining a quiz

## 🎉 Success!

Your TechNexus AI Quiz Platform should now be live on Render! Share your quiz platform URL with users.

## 💡 Tips for Production

1. **Upgrade to Paid Plans**: For better performance and no spin-down
2. **Add Custom Domain**: Configure a custom domain in Render settings
3. **Enable Auto-Deploy**: Automatically deploy when you push to GitHub
4. **Monitor Logs**: Use Render's logging to track issues
5. **Set up Alerts**: Configure alerts for service downtime

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Socket.io Documentation](https://socket.io/docs/v4/)
