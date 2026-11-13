from ai_agent import review_code
from fastapi import HTTPException
from fastapi import FastAPI
from pydantic import BaseModel
from analyzer import check_syntax

app = FastAPI()


class CodeRequest(BaseModel):
    code: str


@app.get("/")
def home():
    return {"message": "AI Coding Agent Backend is Running!"}


@app.post("/analyze")
def analyze_code(request: CodeRequest):
    return check_syntax(request.code)


@app.post("/ai-review")
def ai_review(request: CodeRequest):
    try:
        return review_code(request.code)
    except Exception as e:
        print(f"Gemini request failed: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=502,
            detail="Gemini review failed. Check server logs."
        )

    
    

