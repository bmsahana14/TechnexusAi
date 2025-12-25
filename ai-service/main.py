from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import shutil
from pathlib import Path
from dotenv import load_dotenv

# Import our generator logic
from quiz_generator import generate_quiz_from_file

load_dotenv()

app = FastAPI(title="TechNexus AI Quiz Generator")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "AI Service is running and ready to process files."}

@app.get("/status")
def get_status():
    """Diagnostic endpoint to check AI provider configuration"""
    from quiz_generator import AI_PROVIDER, GEMINI_AVAILABLE, OPENAI_AVAILABLE
    import os
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    return {
        "ai_provider": AI_PROVIDER,
        "gemini_available": GEMINI_AVAILABLE,
        "openai_available": OPENAI_AVAILABLE,
        "gemini_key_configured": bool(gemini_key and gemini_key != "your_gemini_key_here"),
        "openai_key_configured": bool(openai_key and openai_key not in ["your_openai_api_key_here", "dummy_key_for_testing"]),
        "status": "ready" if AI_PROVIDER != "fallback" else "fallback_mode"
    }


@app.post("/generate-quiz")
async def generate_quiz(
    file: UploadFile = File(...), 
    num_questions: int = 10, 
    difficulty: str = "Medium"
):
    try:
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Call the actual AI generation logic
        print(f"Processing file: {file.filename}")
        quiz_data = await generate_quiz_from_file(str(file_path), num_questions, difficulty)
        
        if not quiz_data:
             return {
                "message": "Failed to generate quiz. Please check the file content or API key.",
                "mock_quiz": [] # Return empty or error indicator
            }

        return {
            "message": "File processed successfully",
            "filename": file.filename,
            "params": {
                "questions": num_questions,
                "difficulty": difficulty
            },
            "quiz_data": quiz_data 
        }
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup: remove file after processing? 
        # For now, keep it for debugging or delete it
        pass

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)


