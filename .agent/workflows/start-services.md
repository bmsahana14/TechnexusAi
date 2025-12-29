---
description: Start all services for the TechNexus AI Quiz Arena v2.0
---

This workflow starts all three microservices for the TechNexus AI Quiz Platform v2.0.0:
- AI Service (Python/FastAPI) on port 8000
- Realtime Service (Node.js/Socket.io) on port 4000  
- Frontend (Next.js) on port 3000

## Prerequisites

Ensure you have:
- Node.js 18+ and npm 9+
- Python 3.11+
- Environment files configured (`.env.local`, `ai-service/.env`, `realtime-service/.env`)

## Steps

// turbo
1. Start AI Service (Port 8000)
```powershell
cd ai-service; pip install -r requirements.txt; python main.py
```

// turbo
2. Start Realtime Service (Port 4000)
```powershell
cd realtime-service; npm install; npm start
```

// turbo
3. Start Frontend (Port 3000)
```powershell
npm install; npm run dev
```

## Verify Services

After starting all services, verify they're running:
- AI Service: http://localhost:8000 (should show service info)
- Realtime Service: http://localhost:4000 (should show status)
- Frontend: http://localhost:3000 (should show landing page)

## Troubleshooting

- If ports are in use, check for existing processes
- Ensure all `.env` files are configured correctly
- Check logs for any error messages
- Verify Gemini API key is set in `ai-service/.env`
- Verify Supabase credentials are set in `.env.local`

