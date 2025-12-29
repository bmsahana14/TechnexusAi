# 🎮 TechNexus Arena v2.5.0

An interactive, real-time quiz platform powered by TechNexus Community. Create engaging quizzes manually and compete with friends in real-time!

[![Version](https://img.shields.io/badge/version-2.5.0-blue.svg)](https://github.com/yourusername/technexus-ai-quiz)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/python-%3E%3D3.11-blue.svg)](https://python.org)

## ✨ Features

- 🎯 **Manual Quiz Creation** - Full creative control over your questions in the admin dashboard
- ⚡ **Real-time Multiplayer** - Live quiz sessions with WebSocket support for 1000+ concurrent players
- 📊 **Dynamic Leaderboards** - Real-time score tracking with time-based bonuses
- 🎨 **Modern UI** - Beautiful, responsive design with Framer Motion animations
- 📱 **QR Code Join** - Easy participant joining via QR codes
- 🎯 **Interactive Polls** - Live answer distribution visualization
- 🏆 **Gamification** - Points, rankings, and engaging feedback
- 🔒 **Secure** - Helmet.js security headers and connection limits
- 📈 **Scalable** - Microservices architecture ready for Redis scaling
- 🎭 **Fun Avatars** - Unique DiceBear avatars for each participant
- 💬 **TechNexus Chatbot** - Interactive community assistant on every page
- 🌐 **Community Powered** - Built by [TechNexus Community](https://www.linkedin.com/company/technexuscommunity/)

## 🏗️ Architecture

The platform consists of three core services:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Realtime        │────▶│   AI Service    │
│   (Next.js)     │     │  Service         │     │   (FastAPI)     │
│   Port: 3000    │     │  (Node.js)       │     │   Port: 8000    │
│                 │     │  Port: 4000      │     │                 │
│  - UI/UX        │     │  - WebSockets    │     │  - Status Check │
│  - Editor       │     │  - Game Logic    │     │  - Health Mon   │
│  - State Mgmt   │     │  - Real-time     │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                            Supabase
                         (PostgreSQL)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Python** 3.11+
- **Supabase Account** ([Sign up free](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd quiz-app
   ```

2. **Set up environment variables**
   
   **Frontend (.env.local):**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Install dependencies**
   ```bash
   # Install all packages
   npm install
   
   # Setup Realtime Service
   cd realtime-service
   npm install
   cd ..
   
   # Setup AI Service
   cd ai-service
   pip install -r requirements.txt
   cd ..
   ```

4. **Start all services**
   
   **Option 1: Use the batch script (Windows)**
   ```bash
   ./start-all-services.bat
   ```

5. **Open the app**
   - Frontend: http://localhost:3000
   - AI Service: http://localhost:8000
   - Realtime Service: http://localhost:4000

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5.7** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **Framer Motion 11** - Animations
- **Socket.io Client 4.8** - Real-time communication
- **Lucide React** - Beautiful icons
- **Zustand 5** - State management

### Backend
- **FastAPI 0.115** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic 2** - Data validation

### Real-time Service
- **Node.js 18+** - JavaScript runtime
- **Express 4** - Web framework
- **Socket.io 4.8** - WebSocket library
- **Helmet 8** - Security middleware

### Database & Infrastructure
- **Supabase** - PostgreSQL database & auth
- **Render** - Cloud deployment platform

## 📦 Project Structure

```
technexus-arena/
├── src/                      # Frontend source code
│   ├── app/                  # Next.js app router pages
│   │   ├── admin/           # Admin dashboard (Manual Creator)
│   │   ├── game/            # Game/host view
│   │   ├── join/            # Participant join page
│   │   └── login/           # Admin login
│   ├── components/          # React components
│   └── lib/                 # Utilities & config
├── ai-service/              # Python service
│   ├── main.py             # FastAPI app
│   └── requirements.txt
├── realtime-service/        # Node.js WebSocket service
│   ├── server.js           # Socket.io server
│   └── package.json
└── package.json            # Frontend dependencies
```

## 🎯 Usage

### For Administrators

1. Navigate to the homepage
2. Click **"Admin Portal"** or **"Create Quiz"**
3. Login with your credentials
4. Click **"Create New Quiz"**
5. Enter your questions manually in the editor
6. Start the quiz and share the QR code
7. Monitor participants and control quiz flow

### For Participants

1. Scan the QR code or enter the quiz code
2. Enter your name and get a fun avatar
3. Wait for the quiz to start
4. Answer questions as fast as you can
5. Check your ranking on the leaderboard!

## 🌟 What's New in v2.5.0

### 🚀 Rebranding & Focus
- **TechNexus Arena**: Transitioned to a more competitive and community-focused brand.
- **Manual First**: Switched from AI-powered generation to a robust manual editor for higher quality control.
- **Improved UX**: New dashboard flow starting with recent sessions and a clean creation path.

### 🛠️ Refinements
- Removed all PDF upload and AI processing overhead.
- Updated community chatbot with smart responses for manual quiz creation.
- Enhanced real-time performance by simplifying service architecture.
- Added session history management in the admin dashboard.

---

**Built with ❤️ by TechNexus Community**

*Experience the future of community engagement at TechNexus Arena.* 🎮
