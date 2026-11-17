from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .agent_graph import run_agent


app = FastAPI(
    title="AI Coding Agent",
    description="AI Coding Agent Backend",
    version="1.0.0"
)


# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class CodeRequest(BaseModel):
    code: str


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "AI Coding Agent Backend is Running!"
    }


# --------------------------------------------------
# RUN AGENT
# --------------------------------------------------

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
            detail=f"Agent workflow failed: {e}"
        )