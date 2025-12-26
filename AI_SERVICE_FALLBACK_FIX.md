# FIX: Update quiz_generator.py to handle Gemini initialization properly

## ISSUE IDENTIFIED:
The AI service is returning FALLBACK questions instead of generating from PDF.
This happens when `quiz_generator.py` fails to initialize Gemini properly.

## ROOT CAUSE:
The `google.generativeai` library is deprecated and may be causing initialization failures.
When initialization fails, AI_PROVIDER is set to "fallback" and hardcoded questions are returned.

## SOLUTION:

### Option 1: Check if Gemini is actually initializing
Run this command to see the initialization logs:
```powershell
cd ai-service
python -c "from quiz_generator import AI_PROVIDER; print(f'AI Provider: {AI_PROVIDER}')"
```

### Option 2: Restart the AI service and watch the logs
```powershell
# Stop the current service (Ctrl+C)
# Then restart with:
cd ai-service
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Look for these lines in the startup output:
- ✅ "OK: Using Google Gemini Flash (Latest) for quiz generation"
- ❌ "WARNING: No valid AI API key found. Using fallback mode."
- ❌ "ERROR: Gemini initialization failed"

### Option 3: Update to the new Google Gemini library
The warning says to switch to `google.genai`. Update requirements:
```powershell
pip uninstall google-generativeai
pip install google-genai
```

Then update quiz_generator.py to use the new library.

### Option 4: Force re-import (Quick Fix)
The issue might be that the service cached the fallback state.
Restart the service to force re-initialization.

## VERIFICATION:
After fixing, test with:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/status"
```

Should show:
```json
{
  "ai_provider": "gemini",  // NOT "fallback"
  "status": "ready"         // NOT "fallback_mode"
}
```

## CURRENT STATUS:
- ✅ Gemini API key is valid
- ✅ PDF extraction works
- ✅ Direct Gemini API calls work
- ❌ AI service is stuck in fallback mode
- ❌ Needs service restart or library fix
