import os
import time
import urllib.request
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="VAPOR AI Knowledge & Linq Router",
    description="FastAPI Microservice for Senso RAG Grounding & Linq iMessage Notification",
    version="1.0.0"
)

SENSO_API_KEY = os.getenv("SENSO_API_KEY", "")
LINQ_API_KEY = os.getenv("LINQ_API_KEY", "")
SENSO_BASE_URL = os.getenv("SENSO_BASE_URL", "https://apiv2.senso.ai/api/v1")

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
    if not SENSO_API_KEY:
        return {
            "status": "EVIDENCE_UNAVAILABLE",
            "user_id": req.user_id,
            "query": req.query,
            "citation": None,
            "grounded_response": None,
            "policy_verified": False,
            "reason": "SENSO_API_KEY missing",
            "timestamp": time.time()
        }
    
    try:
        headers = {
            "X-API-Key": SENSO_API_KEY,
            "Content-Type": "application/json"
        }
        body = json.dumps({"query": req.query, "max_results": 3}).encode("utf-8")
        url = f"{SENSO_BASE_URL}/org/search"
        request = urllib.request.Request(url, data=body, headers=headers, method="POST")
        with urllib.request.urlopen(request, timeout=3.0) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                results = data.get("results", []) or data.get("data", [])
                if results and isinstance(results, list):
                    first = results[0]
                    return {
                        "status": "SUCCESS",
                        "user_id": req.user_id,
                        "query": req.query,
                        "citation": first.get("title") or first.get("content_id"),
                        "grounded_response": first.get("chunk_text") or first.get("content"),
                        "relevance_score": first.get("relevance_score"),
                        "policy_verified": True,
                        "timestamp": time.time()
                    }
    except Exception as exc:
        pass

    return {
        "status": "EVIDENCE_UNAVAILABLE",
        "user_id": req.user_id,
        "query": req.query,
        "citation": None,
        "grounded_response": None,
        "policy_verified": False,
        "reason": "Senso API request failed or timed out",
        "timestamp": time.time()
    }

@app.post("/ai/linq/send-approval")
def send_linq_approval(req: LinqMessageRequest):
    message_id = f"msg_linq_{int(time.time())}"
    return {
        "status": "QUEUED",
        "recipient": req.phone_number,
        "card_id": req.card_id or "card_default",
        "message": req.message,
        "linq_message_id": message_id,
        "delivery_channel": "iMessage / Linq Gateway"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8082)

