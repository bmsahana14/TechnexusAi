# 🎮 TechNexus Arena 

An interactive, real-time quiz platform powered by TechNexus Community. Create engaging quizzes manually, manage live arenas, and compete with friends in real-time!

[![Version](https://img.shields.io/badge/version-2.5.0-blue.svg)](https://github.com/bmsahana14/TechnexusAi)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/python-%3E%3D3.11-blue.svg)](https://python.org)
[![Deploy on Render](https://img.shields.io/badge/Deploy%20on-Render-00b1b1.svg)](https://render.com)

## ✨ Features

- 🎯 **Manual Quiz Creation** - Full creative control over your questions with a robust, real-time editor.
- ⚡ **Real-time Multiplayer** - Live quiz sessions with WebSocket support for high-concurrency engagement.
- 📊 **Dynamic Leaderboards** - Real-time score tracking with time-based bonuses and encouraging feedback.
- 🎨 **Modern UI** - Sleek, Glassmorphism-inspired design with smooth Framer Motion animations.
- 📱 **QR Code Join** - Seamless participant entry via mobile-optimized QR code scanning.
- 🎭 **Fun Avatars** - Unique, randomly generated DiceBear avatars for every participant.
- 💬 **TechNexus Chatbot** - Integrated community assistant to help admins and players on every page.
- 🌐 **Community Driven** - Proudly built and maintained by the [TechNexus Community](https://www.linkedin.com/company/technexuscommunity/).

## 🏗️ Architecture

The platform uses a scalable microservices architecture:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend Hub  │────▶│  Realtime Relay  │────▶│  AI Helper      │
│   (Next.js)     │     │  (Node.js)       │     │  (FastAPI)      │
│   Port: 3000    │     │  Port: 4000      │     │  Port: 8000     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
          │                       │                         │
          └───────────────────────┴─────────────────────────┘
                             Supabase DB
```

## 🚀 Quick Start

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/bmsahana14/TechnexusAi.git
   cd TechnexusAi
   npm install && npm run setup # Installs all service dependencies
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env.local` and add your **Supabase** credentials.

3. **Run Locally**
   ```bash
   ./start-all-services.bat # One command to start everything
   ```

## ☁️ Cloud Deployment

### Deploy to Render (Blueprint Support)
This project includes a `render.yaml` for instant deployment.
1. Connect this repo to [Render](https://dashboard.render.com).
2. Render will automatically detect the blueprint and provision all 3 services.
3. Add your `GEMINI_API_KEY` (AI Service) and `NEXT_PUBLIC_SUPABASE_URL` (Frontend).

## 🛠️ Usage

### For Administrators
1. Login to the **Admin Portal**.
2. Click **"Create Quiz"** to enter the Manual Editor.
3. Craft your questions, set timers, and click **"Launch Arena"**.
4. Use the **Host View** to control the game flow and reveal answers.

### For Participants
1. Scan the **QR Code** at the start of the session.
2. Pick a name, get your avatar, and wait for the countdown.
3. Answer correctly and quickly to climb the live leaderboard!

## 🌟 What's New in v2.5.0

- **Fixed "Launch Arena"**: Resolved redirection issues; launching a quiz now takes you directly to the action.
- **Privacy Mode**: Internal documentation and temporary logs are now hidden from the repository.
- **Enhanced Chatbot**: Smart context-aware community support integrated globally.
- **Stability**: Improved WebSocket heartbeat for more reliable live sessions.

---

**Built with ❤️ by TechNexus Community**

*Experience the future of community engagement at TechNexus Arena.* 🎮
