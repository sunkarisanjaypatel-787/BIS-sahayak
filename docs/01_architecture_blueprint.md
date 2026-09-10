# SYSTEM MANUAL: BIS SAHAYAK (AIR-GAPPED MONOLITH)

## Module 1.1: Monolithic System Architecture & Runtime Topology

### 1. Architectural Philosophy

BIS Sahayak is architected as a strictly local, air-gapped, monolithic edge intelligence pipeline. It executes all data preprocessing, vector retrieval, and large language model inference natively on Apple Silicon unified memory.

- **Zero Cloud Dependency:** No external API requests (e.g., OpenAI, Anthropic, or external vector SaaS) occur during runtime.
- **Deterministic Guardrails:** Semantic distance thresholding mathematically rejects context out-of-bounds prior to token generation.
- **Strict Process Decoupling:** The presentation layer, orchestrator, vector engine, and inference runtime communicate strictly across local loopback interfaces (`127.0.0.1`).

### 2. Runtime Topology Diagram

```
+-------------------------------------------------------------------------+
|                        Apple Silicon Host (macOS)                       |
|                                                                         |
|  [ User / Browser ]                                                     |
|          │                                                              |
|          ▼ (HTTP / Localhost)                                           |
|  ┌─────────────────────────┐                                            |
|  │  Next.js Frontend (UI)  │  ◄── Port 3000                             |
|  │  - Tailwind CSS         │                                            |
|  │  - Persona Mode Toggle  │                                            |
|  └───────────┬─────────────┘                                            |
|              │ POST /query (JSON Payload: {prompt, mode})               |
|              │ SSE Stream (Tokens + Evidence Cards)                     |
|              ▼                                                          |
|  ┌─────────────────────────┐                                            |
|  │  FastAPI Orchestrator   │  ◄── Port 8000                             |
|  │  - Uvicorn / Async Loop │                                            |
|  │  - Prompt Synthesis     │                                            |
|  └─────┬─────────────┬─────┘                                            |
|        │             │                                                  |
|        │ Vector      │ Prompt + Context                                 |
|        │ Query       │ Stream Request                                   |
|        ▼             ▼                                                  |
|  ┌─────────────┐   ┌────────────────────────┐                           |
|  │ Qdrant DB   │   │ Ollama Runtime         │                           |
|  │ (Docker)    │   │ (Native macOS Binary)  │                           |
|  │ Port 6333   │   │ Port 11434             │                           |
|  │ - Cosine    │   │ - Llama 3.2 3B Q4_K_M  │                           |
|  │ - BGE-M3    │   │ - 128k Context Native  │                           |
|  └─────────────┘   └────────────────────────┘                           |
+-------------------------------------------------------------------------+
```

### 3. Layer Breakdown & Interface Contracts

#### Presentation Layer (Next.js / React)

- **Binding Address:** `http://127.0.0.1:3000`
- **Role:** Manages client UI, captures standard/OCR queries, tracks the persona state (`consumer` vs. `industry`), and renders Server-Sent Events (SSE).
- **Payload Contract:**

```json
{
  "prompt": "IS 1417 Marking Requirements",
  "mode": "industry"
}
```

#### Orchestration Layer (FastAPI / Uvicorn)

- **Binding Address:** `http://127.0.0.1:8000`
- **Role:** Stateless pipeline router. It receives the UI payload, converts the query string to embeddings using local `BAAI/bge-m3`, dispatches search criteria to Qdrant, formats prompt templates according to `mode`, and opens an SSE pipeline back to Next.js.

#### Vector Store Layer (Qdrant Containerized)

- **Binding Address:** `http://127.0.0.1:6333` (HTTP REST) / `6334` (gRPC)
- **Role:** Storage and similarity indexing for high-dimensional vectors (1024-dim BGE-M3 representations).
- **Runtime:** Runs inside Docker with volume mounting to host disk (`./qdrant_storage:/qdrant/storage`) to maintain index persistence across cold reboots.
- **Filter Gate:** Enforces a strict cosine similarity cutoff at `score_threshold: 0.50`.

#### Inference Runtime Layer (Ollama)

- **Binding Address:** `http://127.0.0.1:11434`
- **Role:** High-speed LLM execution running quantized weights (Llama 3.2 3B Instruct).
- **Communication Interface:** Consumes standard OpenAI-compatible completions/chat endpoints or Ollama native `/api/generate` via asynchronous HTTP streaming.

### 4. Port & Network Matrix

| **Service** | **Protocol** | **Host Interface** | **Containerized** | **Primary Purpose** |
|---|---|---|---|---|
| **Next.js** | HTTP / WS | `127.0.0.1:3000` | No (Host Node.js) | Client UI and Session Handling |
| **FastAPI** | HTTP / SSE | `127.0.0.1:8000` | No (Host venv) | Orchestrator & Logic Pipeline |
| **Qdrant REST** | HTTP | `127.0.0.1:6333` | Yes (Docker) | Vector Search & Collection CRUD |
| **Qdrant gRPC** | gRPC | `127.0.0.1:6334` | Yes (Docker) | High-throughput Vector Sync |
| **Ollama** | HTTP | `127.0.0.1:11434` | No (Host Metal) | Local LLM Token Generation |

## Module 1.2: Hardware Profile, Resource Bounds & Environment Baselines

### 1. Hardware Specifications & Apple Silicon Optimization

The system is explicitly tuned for macOS running on Apple Silicon (M-Series) processors. This leverages the **Unified Memory Architecture (UMA)**, allowing the CPU and GPU to share the same high-bandwidth memory pool without the PCIe bottleneck found in traditional discrete GPU setups.

- **Target Architecture:** `arm64` (Apple Silicon).
- **Execution Engine:** Ollama leverages the native Metal Performance Shaders (MPS) framework to accelerate inference directly on the Mac's GPU cores.
- **Storage Requirement:** Minimum 15 GB of fast SSD storage available (allocating space for the Llama 3.2 weights, Qdrant Docker image, Python environments, and vector storage volumes).

### 2. Resource Bounding & Memory Allocation Matrix

To prevent thermal throttling and operating system swap-thrashing during high-load concurrent queries, the component memory footprints are strictly bounded.

| **Component** | **Target Load** | **Peak Memory Allocation** | **Compute Bound** |
|---|---|---|---|
| **Ollama (Llama 3.2 3B Q4_K_M)** | Inference & Generation | ~2.2 GB - 2.5 GB | Heavily GPU (Metal) bound |
| **FastAPI + BGE-M3 (Transformers)** | Orchestration + Embedding | ~1.5 GB - 2.0 GB | CPU bound (Neural Engine optimized where possible) |
| **Qdrant (Docker)** | Vector Search / Similarity | ~500 MB - 1.0 GB | Memory/Disk I/O bound |
| **Next.js (Node.js)** | UI / State Rendering | ~300 MB | CPU bound (Lightweight) |
| **Total Pipeline Footprint** | System-Wide | **~4.5 GB - 5.8 GB RAM** | Can run cleanly on an 8GB or 16GB Mac. |

### 3. System Environment Prerequisites

Before the setup phase can be executed, the host operating system must have the following core binaries and runtimes installed and verifiable via the system `$PATH`.

#### Core Runtimes

- **Python:** `v3.10` or higher (Required for FastAPI, Pydantic v2, and typing features).
- **Node.js:** `v20.x` LTS or higher (Required for Next.js App Router stability).
- **Package Managers:** `pip` (Python) and `npm` or `pnpm` (Node).

#### System Daemons & Binaries

- **Docker Engine:** Docker Desktop or OrbStack running and allocated at least 2 CPU cores and 2GB RAM.
- **Ollama CLI:** Native macOS binary (`ollama --version` must resolve).
- **Tesseract OCR:** Required for the physical label upload capability (`brew install tesseract`).
- **Poppler / Xpdf:** (Optional but recommended) C-level dependencies occasionally required by Docling for deep PDF layout analysis on macOS (`brew install poppler`).