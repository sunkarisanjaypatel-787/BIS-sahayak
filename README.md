# BIS Sahayak — AI Compliance & Standards Assistant

An offline, air-gapped Retrieval-Augmented Generation (RAG) assistant designed for the **Bureau of Indian Standards (BIS)**. The system provides verifiable, clause-grounded regulatory guidance to consumers and MSMEs without cloud dependencies or hallucinations.

## ⚡ Key Highlights

* **Air-Gapped 2-Node Edge Architecture:** Separates orchestration and vector search from local GPU-accelerated inference.
* **Zero-Hallucination Retrieval:** Every generated answer strictly cites Indian Standards (IS), clause numbers, and verified source snippets.
* **High-Fidelity Document Processing:** End-to-end table and layout extraction from dense technical standards using Docling.
* **Official Identity:** Built using the official Bureau of Indian Standards design palette.

## 🏗️ Architecture

    [ Next.js 14 Frontend ] 
             │ (HTTP / SSE)
             ▼
        FastAPI Orchestrator (Mac)
        ├── Qdrant Vector Store (1024-d, Cosine)
        └── BAAI/bge-m3 Embeddings
             │ (LAN / HTTP)
             ▼
        Ollama (Llama-3.2:3B)

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Orchestrator** | FastAPI, Uvicorn, Python 3.11+ |
| **Vector DB** | Qdrant (Docker / Local) |
| **Embeddings** | `BAAI/bge-m3` via Sentence-Transformers |
| **Parser** | Docling (Layout analysis, TableFormer, OCR) |
| **LLM Node** | Ollama, Llama-3.2:3B (CUDA / RTX 2050) |

## 🚀 Quickstart

### 1. Vector Database
`docker run -d -p 6333:6333 -p 6334:6334 qdrant/qdrant`

### 2. Ingestion Pipeline
`python3 Backend/fetch_standards.py`
`python3 Backend/extract_bis.py`
`python3 Backend/seed_qdrant.py`

### 3. Orchestration Server
`source venv/bin/activate`
`uvicorn Backend.embed_api:app --host 0.0.0.0 --port 8000`

### 4. Next.js Frontend
`cd frontend`
`npm install`
`npm run dev`

Access the application at `http://localhost:3000`.

## 📜 Ingested Standards (Sample)

* **IS 10500:** Drinking Water Specification
* **IS 1417:** Gold and Gold Alloys, Hallmarking
* **IS 456:** Plain and Reinforced Concrete — Code of Practice
* **IS 302:** Safety of Household and Similar Electrical Appliances
* **IS 1786:** High Strength Deformed Steel Bars for Concrete Reinforcement
