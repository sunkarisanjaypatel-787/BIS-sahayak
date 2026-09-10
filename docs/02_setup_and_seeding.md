## Module 2.1: Python Virtual Environment Setup & Backend Dependencies

### 1. The Isolation Principle

To maintain deterministic builds and prevent global package pollution on the Mac host, the Python backend must operate within a strictly isolated virtual environment (`venv`). This guarantees that the exact versions of your vector libraries and orchestrator remain perfectly preserved, ensuring the system can be rebuilt without dependency conflicts.

### 2. Environment Initialization

Execute the following commands in the root directory of your project to forge and activate the local environment.

* Initialize the virtual environment: `python3 -m venv venv`
* Activate the environment (macOS/Zsh): `source venv/bin/activate`
* Upgrade the core package installer to prevent build errors: `pip install --upgrade pip`

### 3. Dependency Injection

During the archival process, the `requirements.txt` manifest was generated using the anti-gravity protocol. To resurrect the backend state, feed this manifest directly into the isolated environment.

* Verify the `requirements.txt` file is present in your project root, containing all pinned dependencies (e.g., `fastapi`, `uvicorn`, `qdrant-client`, `sentence-transformers`, `docling`, `pydantic`).
* Execute the batch installation: `pip install -r requirements.txt`

### 4. Verification Protocol

Do not assume the installation was successful. Verify that the critical orchestration and vector modules are successfully bound to the active environment before moving to the database layer.

* Validate FastAPI binding: `python3 -c "import fastapi; print('FastAPI Version:', fastapi.__version__)"`
* Validate Qdrant Client binding: `python3 -c "import qdrant_client; print('Qdrant Client Version:', qdrant_client.__version__)"`
* Validate Transformer binding: `python3 -c "import sentence_transformers; print('Transformers Ready')"`

## Module 2.2: Data Extraction (Docling), Chunking, & Vector Seeding Protocol

### 1. The Semantic Ingestion Pipeline

A Retrieval-Augmented Generation (RAG) system is only as intelligent as the data it can retrieve. Standard PDF parsers destroy the complex layouts of Indian Standard (IS) documents, flattening tables and merging unrelated clauses. This module outlines the exact protocol used to extract, structure, and mathematically embed the regulatory data so the Llama 3.2 model can reason over it accurately.

### 2. Layout-Aware Parsing via Docling

The first stage requires converting raw BIS PDFs into structured Markdown without losing tabular data or headers.

* **Source Data Placement:** Place the raw PDFs (e.g., `IS1417-2016.pdf`, `IS_10500_2012.pdf`) into a designated staging directory, such as `Backend/data/`.
* **Docling Extraction Execution:** Run your extraction script (`Backend/extract_bis.py`) which utilizes the `docling` library.
* **The Output Mechanism:** Docling executes a layout-aware parse, preserving multi-column formats and converting regulatory tables into clean Markdown tables. The output is saved into `Backend/extracted_markdown/` as `.md` files.

### 3. Structural Chunking Strategy (LangChain)

Once the documents are converted to Markdown, they must be carved into chunks small enough to be embedded but large enough to retain semantic context.

* **The Tool:** We utilize `langchain-text-splitters`, specifically the `MarkdownTextSplitter`.
* **Chunk Parameters:**
  * `chunk_size`: Set to ~1000 characters to capture full regulatory clauses.
  * `chunk_overlap`: Set to ~400 characters. This aggressive overlap ensures that a table row is never severed from its preceding column headers or contextual clause definition.
* **Execution:** This chunking occurs natively within the `seed_qdrant.py` script prior to the embedding phase.

### 4. Vector Embedding & Qdrant Seeding Protocol

This final stage translates the chunked text into high-dimensional mathematics and forces it into the persistent Qdrant volume.

* **The Embedding Model:** `BAAI/bge-m3` running locally via `sentence-transformers` generates the 1024-dimensional dense vectors.
* **Seeding Command:**
  Execute the master ingestion script from your terminal:
  ```bash
  python3 Backend/seed_qdrant.py
  ```
* **Validation Check:** Watch the terminal output. You must verify that the script iterates through all Markdown files (e.g., verifying IS 10500 alongside IS 1417).
* **Payload Construction:** As the script pushes batches to Qdrant, it must append the critical metadata payload (e.g., `"standard": "IS 10500:2012"`, `"category": "Water Quality"`) to each point. This metadata is what the frontend UI maps to the "Verified Evidence" cards.

