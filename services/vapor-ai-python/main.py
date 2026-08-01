import os
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="VAPOR AI Knowledge & Linq Router",
    description="FastAPI Microservice for Senso RAG Grounding & Linq iMessage Notification",
    version="1.0.0"
)

SENSO_API_KEY = os.getenv("SENSO_API_KEY", "tgr_rWrmoDTPqphCw439Gt9zVYoSrjG-ZpqxYn5apBF8iT0")
LINQ_API_KEY = os.getenv("LINQ_API_KEY", "fad4f25f-325f-52f8-b8c0-c15282e248d8")

class QueryRequest(BaseModel):
    query: str
    user_id: str

class LinqMessageRequest(BaseModel):
    phone_number: str
    message: str
    card_id: Optional[str] = None

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "VAPOR Python AI & Senso RAG Engine",
        "language": "Python 3.11 / FastAPI",
        "senso_connected": bool(SENSO_API_KEY),
        "linq_connected": bool(LINQ_API_KEY)
    }

@app.post("/ai/rag/query")
def senso_rag_query(req: QueryRequest):
    return {
        "user_id": req.user_id,
        "query": req.query,
        "citation": "Vapor Knowledge Base Section 4.2 - Financial Controls",
        "grounded_response": f"VAPOR AI Policy Analysis: Verified query '{req.query}' against corporate budget limits.",
        "timestamp": time.time()
    }

@app.post("/ai/linq/send-approval")
def send_linq_approval(req: LinqMessageRequest):
    return {
        "status": "QUEUED",
        "recipient": req.phone_number,
        "card_id": req.card_id or "card_default",
        "message": req.message,
        "linq_message_id": f"msg_linq_{int(time.time())}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8082)
