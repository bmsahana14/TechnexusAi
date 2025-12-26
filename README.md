# 🎮 TechNexus AI Quiz Platform

An interactive, real-time quiz platform powered by AI that generates questions from uploaded documents (PDF, PPTX). Built with Next.js, FastAPI, and Socket.io.

## ✨ Features

- 🤖 **AI-Powered Quiz Generation** - Upload PDFs/PPTX and get contextual questions using Google Gemini
- ⚡ **Real-time Multiplayer** - Live quiz sessions with WebSocket support
- 📊 **Dynamic Leaderboards** - Real-time score tracking and rankings
- 🎨 **Modern UI** - Beautiful, responsive design with animations
- 📱 **QR Code Join** - Easy participant joining via QR codes
- 🎯 **Interactive Polls** - Live answer distribution visualization
- 🏆 **Gamification** - Points, rankings, and engaging feedback

## 🏗️ Architecture

The platform consists of three microservices:

1. **Frontend (Next.js)** - Main web application
2. **AI Service (Python/FastAPI)** - Quiz generation backend
3. **Realtime Service (Node.js)** - WebSocket server for real-time features

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd quiz-app
   ```

2. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Copy `ai-service/.env.example` to `ai-service/.env`
   - Copy `realtime-service/.env.example` to `realtime-service/.env`
   - Fill in your API keys (Supabase, Gemini)

3. **Start all services**
   ```bash
   # Option 1: Use the workflow
   # See .agent/workflows/start-services.md

   # Option 2: Manual start
   # Terminal 1 - AI Service
   cd ai-service
   pip install -r requirements.txt
   python main.py

   # Terminal 2 - Realtime Service
   cd realtime-service
   npm install
   npm start

   # Terminal 3 - Frontend
   npm install
   npm run dev
   ```

4. **Open the app**
   - Frontend: http://localhost:3000
   - AI Service: http://localhost:8000
   - Realtime Service: http://localhost:4000

### 🌐 Deploy to Production

**Fastest way to deploy to Render (5 minutes):**

See **[DEPLOY_TO_RENDER.md](./DEPLOY_TO_RENDER.md)** for the quickest deployment guide.

**Detailed deployment guides:**
- [Render Deployment Guide](./RENDER_DEPLOYMENT.md) - Comprehensive step-by-step
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre/post-deployment tasks

**Quick deploy:**
1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Blueprint"
4. Select your repository (render.yaml will be auto-detected)
5. Configure environment variables
6. Deploy!

## 📋 Requirements

- **Node.js** 18+ (for Frontend and Realtime Service)
- **Python** 3.11+ (for AI Service)
- **Supabase Account** (for database and auth)
- **Google Gemini API Key** (for AI quiz generation)

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

#### AI Service (ai-service/.env)
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=8000
```

#### Realtime Service (realtime-service/.env)
```env
PORT=4000
```

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md) - Get started quickly
- [Supabase Setup](./SUPABASE_SETUP.md) - Database configuration
- [Gemini Setup](./SETUP_GEMINI.md) - AI service configuration
- [Troubleshooting](./TROUBLESHOOTING_PDF_QUIZ.md) - Common issues

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI (Python), Express.js (Node.js)
- **Real-time**: Socket.io
- **AI**: Google Gemini API
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Render

## 📦 Project Structure

```
quiz-app/
├── src/                    # Frontend source code
├── ai-service/            # Python AI service
├── realtime-service/      # Node.js WebSocket service
├── public/                # Static assets
├── .agent/workflows/      # Development workflows
└── render.yaml           # Render deployment config
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check [TROUBLESHOOTING_PDF_QUIZ.md](./TROUBLESHOOTING_PDF_QUIZ.md) for common issues
- Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for deployment help
- See conversation history for development context

## 🎯 What's Next?

- [ ] Deploy to Render
- [ ] Add custom domain
- [ ] Enable auto-deploy from GitHub
- [ ] Add more AI models support
- [ ] Implement quiz templates
- [ ] Add analytics dashboard

---

Built with ❤️ using Next.js, FastAPI, and Google Gemini
