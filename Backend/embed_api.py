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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mac local services
embed_model = SentenceTransformer("BAAI/bge-m3", device="cpu")
qdrant = QdrantClient(host="localhost", port=6333)

# Asus TUF Inference node
NODE_2_IP = "127.0.0.1"
OLLAMA_URL = f"http://{NODE_2_IP}:11434/api/generate"

@app.get("/health")
def health_check():
    return {"status": "online"}

CATEGORY_LOOKUP = {
    "10500": "Water Quality & Public Health",
    "14543": "Packaged Drinking Water",
    "1417": "Gold & Precious Metals",
    "1786": "Steel & Metallurgy",
    "456": "Civil & Concrete Structures",
    "302": "Electrical & Electronics Safety",
    "3854": "Electrical Switches & Accessories",
}

def resolve_category(filename: str, fallback: str) -> str:
    for key, cat in CATEGORY_LOOKUP.items():
        if key in filename:
            return cat
    return fallback if fallback != "Uncategorized Standard" else "General Standard"

@app.post("/query")
def handle_query(payload: dict):
    user_query = payload.get("prompt", "").strip()
    user_mode = payload.get("mode", "consumer").lower()
    
    print(f"\n[+] FRONTEND SENT: '{user_query}' (Mode: {user_mode})")
    
    # 1. Intent Routing: Bypass Qdrant for greetings
    greetings = ["hello", "hi", "hey", "help", "who are you", "what can you do"]
    if user_query.lower() in greetings or len(user_query) < 5:
        print("[+] Bypassing Qdrant (greeting / short intent)")
        sources_list = []
        augmented_prompt = f"""You are BIS Sahayak, a highly capable AI assistant for Indian Standards. 
Greet the user politely and ask how you can help them with BIS compliance or regulatory queries today. 
Do not cite any standards. Do not hallucinate data.

[USER QUESTION]
{user_query}

Answer:"""
    else:
        # 2. Normal Qdrant Vector Pipeline
        query_vector = embed_model.encode(user_query).tolist()
        search_result = qdrant.query_points(
            collection_name="bis_standards",
            query=query_vector,
            limit=4,
            score_threshold=0.50
        )
        hits = search_result.points
        
        scores = [round(hit.score, 4) for hit in hits]
        standards_found = [hit.payload.get("standard", "Unknown") for hit in hits]
        print(f"[+] QDRANT MATCH SCORES: {scores}")
        print(f"[+] QDRANT MATCH STANDARDS: {standards_found}")
        
        context_blocks = []
        sources_list = []
        
        for hit in hits:
            p = hit.payload
            raw_std = p.get("standard", "Unknown")
            resolved_cat = resolve_category(raw_std, p.get("category", "General"))
            
            context_blocks.append(f"[{raw_std} - {p.get('clause', 'N/A')}]: {p.get('text', '')}")
            
            source_meta = {
                "standard": raw_std,
                "category": resolved_cat,
                "clause": p.get("clause", "N/A"),
                "snippet": p.get("text", "")[:300],
                "score": hit.score
            }
            if source_meta not in sources_list:
                sources_list.append(source_meta)
        
        if not context_blocks:
            context_str = "No verified BIS standards found for this query in the local database."
        else:
            context_str = "\n\n".join(context_blocks)
            
        # 3. Grounded Prompt Formulation based on Persona
        if "industry" in user_mode or "msme" in user_mode:
            system_instruction = """You are a BIS Regulatory Expert assisting manufacturers and MSMEs. 
Provide highly technical, detailed answers using ONLY the verified context.
Explicitly cite all IS numbers, clause numbers, tables, and exact metric limits."""
        else:
            system_instruction = """You are a helpful BIS Assistant for everyday consumers. 
Provide a clear, simple, and highly concise answer using ONLY the verified context. 
Focus directly on the bottom-line answer. Do not use dense regulatory jargon, and hide complex clause citations unless strictly necessary."""

        augmented_prompt = f"""{system_instruction}
If the context says no standards were found, state that clearly and do not hallucinate.

[VERIFIED CONTEXT]
{context_str}

[USER QUESTION]
{user_query}

Answer:"""

    # 3. Stream to Ollama (Keep your existing yield logic here)

    ollama_payload = {
        "model": "llama3.2:3b",
        "prompt": augmented_prompt,
        "stream": True
    }
    
    def generate():
        # Stream the metadata array first as a custom SSE event for the Evidence Panel
        yield f"event: sources\ndata: {json.dumps(sources_list)}\n\n"
        
        with requests.post(OLLAMA_URL, json=ollama_payload, stream=True, timeout=120) as r:
            for line in r.iter_lines():
                if line:
                    chunk = json.loads(line)
                    if "response" in chunk:
                        yield f"data: {chunk['response']}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
