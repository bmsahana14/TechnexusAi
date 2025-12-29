from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
from dotenv import load_dotenv
import logging
from datetime import datetime

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TechNexus Arena Service",
    description="Service for TechNexus Arena - Manual quiz creation support",
    version="2.5.0"
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in allowed_origins else allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Root endpoint with service information"""
    return {
        "service": "TechNexus Arena Service",
        "version": "2.5.0",
        "status": "operational",
        "mode": "Manual Quiz Creation",
        "message": "PDF generation has been disabled. Create quizzes manually in the admin dashboard.",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "active",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/status")
def get_status():
    """Diagnostic endpoint to check service status"""
    return {
        "status": "active",
        "mode": "Manual Quiz Creation",
        "features": {
            "pdf_quiz_generation": False,
            "manual_quiz_creation": True,
            "real_time_quizzes": True,
            "chatbot": True
        },
        "timestamp": datetime.utcnow().isoformat()
    }

# Chat functionality
import google.generativeai as genai
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint using Google Gemini.
    """
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"error": "GEMINI_API_KEY not configured"}
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Add system context
        prompt = f"""You are the TechNexus AI Assistant, a helpful expert 
        ready to assist users with the TechNexus Quiz Platform.
        
        User Query: {request.message}
        """
        
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting TechNexus Arena Service on port {port}")
    logger.info("PDF quiz generation disabled - Manual creation only")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
