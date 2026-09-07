from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
import requests
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mac local services
embed_model = SentenceTransformer("BAAI/bge-m3", device="cpu")
qdrant = QdrantClient(host="localhost", port=6333)

# Asus TUF Inference node
NODE_2_IP = "10.42.2.165"
OLLAMA_URL = f"http://{NODE_2_IP}:11434/api/generate"

@app.get("/health")
def health_check():
    return {"status": "online"}

@app.post("/query")
def handle_query(payload: dict):
    user_query = payload.get("prompt", "")
    
    # 1. Embed query with BGE-M3
    query_vector = embed_model.encode(user_query).tolist()
    
    # 2. Retrieve top-2 closest BIS clauses from Qdrant
    search_result = qdrant.query_points(
        collection_name="bis_standards",
        query=query_vector,
        limit=2
    )
    hits = search_result.points
    
    context_blocks = []
    for hit in hits:
        p = hit.payload
        context_blocks.append(f"[{p['standard']} - {p['clause']}]: {p['text']}")
    
    context_str = "\n\n".join(context_blocks)
    
    # 3. Grounded Prompt Formulation
    augmented_prompt = f"""You are a BIS (Bureau of Indian Standards) Technical Assistant.
Answer the user's question accurately using ONLY the provided verified context.
Always cite the exact Indian Standard (IS) number and clause.

[VERIFIED CONTEXT]
{context_str}

[USER QUESTION]
{user_query}

Answer:"""

    ollama_payload = {
        "model": "llama3.2:3b",
        "prompt": augmented_prompt,
        "stream": True
    }
    
    def generate():
        with requests.post(OLLAMA_URL, json=ollama_payload, stream=True, timeout=120) as r:
            for line in r.iter_lines():
                if line:
                    chunk = json.loads(line)
                    if "response" in chunk:
                        yield f"data: {chunk['response']}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
