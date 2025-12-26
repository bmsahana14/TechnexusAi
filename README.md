# 🎯 TechNexus AI Quiz Arena

> **Transform presentations into interactive quizzes instantly. Where AI meets real-time engagement.**

A cutting-edge, AI-powered quiz platform that converts PDF/PPTX files into engaging, real-time multiplayer quiz experiences. Built with Next.js, FastAPI, and Socket.IO for seamless performance.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![Python](https://img.shields.io/badge/Python-3.9+-yellow)

---

## ✨ Features

### 🤖 **AI-Powered Quiz Generation**
- Upload PDF or PPTX presentations
- Google Gemini AI generates contextual questions
- Automatic question generation in under 30 seconds
- Smart content analysis for relevant questions

### 🎮 **Real-Time Multiplayer**
- Support for 1000+ concurrent players
- WebSocket-based instant updates
- Lag-free live quiz experience
- Real-time answer tracking

### 📊 **Live Leaderboards**
- Dynamic scoring with time bonuses
- Instant rank updates after each question
- Top 10 player display with avatars
- Color-coded rankings (Gold/Silver/Bronze)
- Final leaderboard with profile pictures

### 📱 **QR Code Integration**
- Quick join via QR code scanning
- Mobile-optimized scanner
- Auto-fill PIN functionality
- Camera-based or manual entry

### 🎨 **Premium UI/UX**
- Glassmorphism design
- Smooth animations with Framer Motion
- Fully responsive (mobile, tablet, desktop)
- Dark mode optimized
- Profile picture avatars for all participants

### ⚙️ **Admin Dashboard**
- Upload and manage presentations
- Edit AI-generated questions
- Add/delete questions manually
- Customize question timers (5-300 seconds)
- Export results as CSV
- Re-host previous quizzes

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd quiz-app
```

2. **Set up AI Service**
```bash
cd ai-service
pip install -r requirements.txt

# Create .env file
echo GEMINI_API_KEY=your_api_key_here > .env
```

3. **Set up Realtime Service**
```bash
cd ../realtime-service
npm install
```

4. **Set up Frontend**
```bash
cd ../client
npm install

# Create .env.local file
echo NEXT_PUBLIC_REALTIME_URL=http://localhost:4000 > .env.local
echo NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000 >> .env.local
```

### Running the Application

Open **3 separate terminals**:

**Terminal 1 - AI Service:**
```bash
cd ai-service
python main.py
# Runs on http://localhost:8000
```

**Terminal 2 - Realtime Service:**
```bash
cd realtime-service
npm start
# Runs on http://localhost:4000
```

**Terminal 3 - Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

### Access the Application

- **Landing Page:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin
- **Join Quiz:** http://localhost:3000/join

---

## 📖 User Guide

### For Admins/Hosts

1. **Create a Quiz**
   - Navigate to Admin Dashboard
   - Upload a PDF or PPTX file
   - Click "Generate Quiz"
   - Wait ~30 seconds for AI processing

2. **Review & Edit**
   - Review AI-generated questions
   - Edit questions and options
   - Mark correct answers
   - Set question timer (5-300 seconds)
   - Add or delete questions as needed

3. **Launch Quiz**
   - Click "Launch Live Quiz"
   - QR code appears in lobby
   - Share quiz PIN or QR code
   - Wait for participants to join

4. **Host the Quiz**
   - Click "Start Quiz" when ready
   - Monitor participant answers in real-time
   - Click "Reveal Results" after each question
   - View live leaderboard after each question
   - Click "Next Question" to continue
   - Export final results as CSV

### For Participants

1. **Join a Quiz**
   - **Option 1:** Scan QR code with phone camera
   - **Option 2:** Visit join page and click camera icon
   - **Option 3:** Manually enter 6-digit PIN
   
2. **Customize Avatar**
   - Click shuffle button to change profile picture
   - Enter your name/alias

3. **Play the Quiz**
   - Read each question carefully
   - Select your answer before time runs out
   - See if you were correct after reveal
   - Check your position on the live leaderboard
   - Compete for the top spot!

4. **View Results**
   - See your final rank and score
   - Compare with other participants
   - Return to home or join another quiz

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 16.1 (React 19)
- TypeScript
- Tailwind CSS 4
- Framer Motion (animations)
- Socket.IO Client
- QR Code libraries (react-qr-code, html5-qrcode)

**Backend - Realtime Service:**
- Node.js
- Express
- Socket.IO
- In-memory state management

**Backend - AI Service:**
- Python 3.9+
- FastAPI
- Google Gemini AI
- PDF/PPTX processing libraries

**Database:**
- Supabase (PostgreSQL)
- Real-time subscriptions
- Authentication

### Project Structure

```
quiz-app/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── join/              # Join page with QR scanner
│   │   │   ├── admin/             # Admin dashboard
│   │   │   ├── login/             # Login page
│   │   │   └── game/[id]/         # Game views
│   │   │       ├── page.tsx       # Participant view
│   │   │       └── host/page.tsx  # Host/Admin view
│   │   ├── components/    # Reusable components
│   │   │   └── QRScanner.tsx      # QR code scanner
│   │   └── lib/           # Utilities
│   │       ├── socket.ts          # Socket.IO client
│   │       └── supabase.ts        # Supabase client
│   └── package.json
│
├── realtime-service/      # Socket.IO server
│   ├── server.js          # Main server file
│   └── package.json
│
├── ai-service/            # AI quiz generation
│   ├── main.py            # FastAPI server
│   ├── requirements.txt
│   └── .env               # API keys
│
└── README.md
```

---

## 🎨 Features in Detail

### Live Leaderboards

**After Each Question:**
- Participants see top 10 players with avatars
- Current player highlighted
- Real-time score updates
- Smooth animations

**Admin View:**
- 2-column responsive grid
- Top 10 players displayed
- Rank badges (Gold/Silver/Bronze)
- Current scores and avatars

**Final Leaderboard:**
- Complete rankings
- Profile pictures for all participants
- Export to CSV functionality
- Champion highlighting

### QR Code System

**Host Display:**
- Automatic QR code generation in lobby
- Contains full join URL with PIN
- 180x180px optimized size
- High error correction level

**Participant Scanner:**
- Camera button on join page
- Live camera preview
- Auto-fill PIN on successful scan
- Error handling for permissions
- Fallback to manual entry

### Scoring System

```
Base Points: 100 per correct answer
Time Bonus: timeRemaining × 10
Total Score = Base + Time Bonus

Example:
- Answer correctly with 15s remaining
- Score = 100 + (15 × 10) = 250 points
```

### Question Timer

- Configurable per quiz (5-300 seconds)
- Visual countdown for participants
- Progress bar indicator
- Auto-submit when time expires
- Color changes when time is low (<5s)

---

## 🔧 Configuration

### Environment Variables

**AI Service (.env):**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_REALTIME_URL=http://localhost:4000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Realtime Service (.env):**
```env
PORT=4000
```

---

## 🎯 API Endpoints

### AI Service (Port 8000)

**POST /generate-quiz**
- Upload PDF/PPTX file
- Returns AI-generated questions
```json
{
  "quiz_data": [
    {
      "q": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct": 0
    }
  ]
}
```

### Realtime Service (Port 4000)

**Socket.IO Events:**

*Client → Server:*
- `create-room` - Create new quiz room
- `join-quiz` - Join as participant
- `start-quiz` - Begin the quiz
- `submit-answer` - Submit answer
- `reveal-results` - Show question results
- `next-question` - Move to next question

*Server → Client:*
- `room-created` - Room creation confirmed
- `player-joined` - New player joined
- `quiz-started` - Quiz has begun
- `new-question` - New question data
- `participant-answered` - Answer submitted
- `question-results` - Results with leaderboard
- `quiz-ended` - Final leaderboard

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd client
npm run build
vercel deploy
```

### AI Service (Railway/Render)

```bash
cd ai-service
# Add Procfile: web: uvicorn main:app --host 0.0.0.0 --port $PORT
railway up
```

### Realtime Service (Railway/Render)

```bash
cd realtime-service
railway up
```

**Update environment variables** in production to use deployed URLs.

---

## 🐛 Troubleshooting

### Common Issues

**1. AI Service not generating questions**
- Check Gemini API key is valid
- Verify PDF/PPTX file is not corrupted
- Check console logs for errors

**2. Participants can't join**
- Ensure realtime service is running
- Check Socket.IO connection in browser console
- Verify quiz PIN is correct

**3. QR Scanner not working**
- Grant camera permissions
- Use HTTPS in production
- Check browser compatibility

**4. Leaderboard not updating**
- Verify Socket.IO connection
- Check server logs for errors
- Ensure participants are submitting answers

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful quiz generation
- **Next.js Team** - For the amazing framework
- **Socket.IO** - For real-time capabilities
- **Framer Motion** - For smooth animations
- **Dicebear** - For avatar generation

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: your-email@example.com

---

## 🎊 Recent Updates

### Latest Features (December 2025)

✅ **Enhanced Landing Page** - New engaging tagline  
✅ **Live Leaderboards** - After each question for both admin and participants  
✅ **QR Code System** - Easy joining via QR scanning  
✅ **Profile Pictures** - Avatars throughout the experience  
✅ **Admin Controls** - Customizable question timers  
✅ **Clean UI** - Removed redundant text, improved aesthetics  

---

**Built with ❤️ for the next generation of tech events**

🚀 **Start creating engaging quizzes today!**
