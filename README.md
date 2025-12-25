# 🚀 TechNexus AI: Next-Gen Quiz Arena

TechNexus AI is a **state-of-the-art, real-time quiz platform** designed for high-engagement tech events. It features an automated AI-driven workflow that transforms speaker presentations (PPTX/PDF) into high-fidelity interactive quizzes in seconds.

## ✨ Features

- **🤖 AI-Driven Generation**: Instantly convert PDF and PPTX files into contextual MCQs using **Google Gemini 1.5 Flash** or **OpenAI GPT-4o-mini** with advanced prompt engineering
- **⚡ Real-Time Engine**: High-performance Socket.IO backend supporting 1000+ concurrent players with sub-second latency
- **🎯 Dynamic Scoring**: Server-validated answers with intelligent time-based speed bonuses
- **🎨 Premium UI/UX**: 
  - Glassmorphic dark-themed design with cinematic Framer Motion animations
  - Responsive layouts optimized for all devices
  - Advanced micro-interactions and smooth transitions
  - Custom gradient text effects and animated backgrounds
- **👨‍💼 Admin Control**: Complete review, edit, and moderation workflow for AI-generated content
- **🏆 Live Leaderboards**: Instant rank calculation and real-time broadcast to all participants
- **📊 Export Capabilities**: Download quiz questions and results as CSV files

## 🏗️ Architecture

The platform consists of three high-performance microservices:

1.  **Frontend Arena (`/client`)**: Next.js 15 + Tailwind CSS v4 + Framer Motion + Lucide Icons
2.  **Realtime Relay (`/realtime-service`)**: Node.js + Express + Socket.IO (Stateless, horizontally scalable)
3.  **AI Intel (`/ai-service`)**: Python + FastAPI + **Google Gemini 1.5** / OpenAI GPT-4o-mini + python-pptx + pypdf

## 🛠️ Tech Stack

- **UI/UX**: Next.js 15, Tailwind CSS v4, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, Socket.IO
- **AI/ML**: FastAPI, **Google Generative AI SDK**, OpenAI SDK, python-pptx, pypdf
- **Auth/Persistence**: Supabase (PostgreSQL + Auth)
- **Real-time**: WebSocket (Socket.IO)

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- OpenAI API Key or **Google Gemini API Key** (Gemini is recommended for free tier)
- Supabase Account (for authentication and data persistence)

### 1. AI Intelligence Service
```bash
cd ai-service
pip install -r requirements.txt
# Create .env with OPENAI_API_KEY and PORT
python main.py
```

### 2. Realtime Relay Service
```bash
cd realtime-service
npm install
# Create .env with PORT (default 4000)
npm run dev
```

### 3. Frontend Hub
```bash
cd client
npm install
# Configure .env.local with Supabase & Socket URL
npm run dev
```

## 🔐 Environment Configuration

### Client (`/client/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

### AI Service (`/ai-service/.env`)
```env
# Primary option (Recommended - Free tier available)
GEMINI_API_KEY=your_gemini_api_key

# Optional fallback
OPENAI_API_KEY=your_openai_api_key

PORT=8000
```

### Realtime Service (`/realtime-service/.env`)
```env
PORT=4000
```

**Note**: Copy `.env.example` files to `.env` or `.env.local` and fill in your actual credentials.


---

## 🎯 Recent Updates (v1.1)

### UI/UX Enhancements
- ✅ **Homepage Redesign**: Added Framer Motion animations with staggered entrance effects
- ✅ **Enhanced Glassmorphism**: Improved depth and blur effects across all cards
- ✅ **Better Typography**: Refined heading hierarchy with gradient text animations
- ✅ **Micro-interactions**: Added hover states and smooth transitions throughout
- ✅ **Custom Scrollbars**: Premium gradient scrollbar styling
- ✅ **Animated Backgrounds**: Dynamic gradient orbs with smooth motion

### AI Service Improvements
- ✅ **Enhanced Prompt Engineering**: Better question quality with detailed instructions
- ✅ **Improved Error Handling**: More robust JSON parsing with fallback mechanisms
- ✅ **Better Context Management**: Optimized content truncation for token limits

### Performance Optimizations
- ✅ **Smooth Animations**: 60fps animations with hardware acceleration
- ✅ **Optimized Rendering**: Reduced re-renders with proper React patterns
- ✅ **Better Loading States**: Enhanced visual feedback during async operations

---

## 📜 Documentation

For the full roadmap and requirements, see the [PRD.md](./PRD.md).

For database setup, refer to [supabase_schema.sql](./supabase_schema.sql).

---

## 🤝 Contributing

This is a TechNexus community project. Contributions are welcome!

---

## 📄 License

MIT License - See LICENSE file for details

---

Developed with ❤️ for the **TechNexus Community**

**Tech Stack**: Next.js • FastAPI • Socket.IO • Supabase • **Google Gemini** • OpenAI

