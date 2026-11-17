
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .ai_agent import review_code
from .analyzer import check_syntax
from .agent_graph import run_agent


app = FastAPI(
    title="AI Coding Agent",
    description="AI Coding Agent Backend",
    version="1.0.0"
)


# Allow React frontend to connect to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# Request model
class CodeRequest(BaseModel):
    code: str


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "AI Coding Agent Backend is Running!"
    }


# Python syntax analysis
@app.post("/analyze")
def analyze_code(request: CodeRequest):
    return check_syntax(request.code)


# Ollama AI review
@app.post("/ai-review")
def ai_review(request: CodeRequest):
    try:
        return review_code(request.code)

    except Exception as e:
        print(f"Ollama request failed: {type(e).__name__}: {e}")

        raise HTTPException(
            status_code=502,
            detail="Ollama review failed. Check backend logs."
        ) from e


# Complete LangGraph AI workflow
@app.post("/run-agent")
def run_code(request: CodeRequest):
    try:
        result = run_agent(request.code)

        return {
            "syntax_result": result.get("syntax_result"),
            "ai_review": result.get("ai_review"),
            "corrected_code": result.get("corrected_code"),
            "validation_result": result.get("validation_result")
        }

    except Exception as e:
        print(f"Agent workflow failed: {type(e).__name__}: {e}")

        raise HTTPException(
            status_code=500,
            detail="Agent workflow failed. Check backend logs."
        ) from e
