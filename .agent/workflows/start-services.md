---
description: Start all services for the TechNexus AI Quiz Arena
---

This workflow starts the AI Service (Python), the Realtime Relay (Node.js), and the Frontend Hub (Next.js).

1. Install dependencies for all services
// turbo
2. Start AI Intel Service (Port 8000)
```powershell
cd ai-service; pip install -r requirements.txt; python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

// turbo
3. Start Realtime Relay Service (Port 4000)
```powershell
cd realtime-service; npm install; npm run dev
```

// turbo
4. Start Frontend Hub (Port 3000)
```powershell
cd client; npm install; npm run dev
```

> Note: Ensure you have `.env` files configured in each directory as per the `README.md`.
