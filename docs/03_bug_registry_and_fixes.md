## Module 3.1: Frontend Context Contamination & State Bleed

### 1. Incident Description

During the final lockdown phase of the deployment, the Next.js UI exhibited context contamination. Queries for distinct standards were retrieving cached, stale evidence cards, or returning incorrect standard references (e.g., querying IS 10500 but retrieving IS 1417). The `POST /query` endpoint was receiving dirty payloads.

### 2. Root-Cause Analysis

The React state management loop failed to aggressively clear previous evidence variables and AI response strings upon firing a new prompt. Simultaneously, the `handleQuerySubmit` function was appending previous message history or un-cleared UI strings into the JSON payload body. Because the system treats each request as a stateless transaction, sending a contaminated, multi-topic string forced the BGE-M3 Transformer to generate an inaccurate, blended embedding, causing Qdrant to retrieve the wrong regulatory clauses.

### 3. Resolution Protocol

The fix required enforcing strict payload isolation and immediately purging the UI state the exact millisecond a new query was dispatched.

#### Fix 1: The Isolated Payload

The fetch call in the frontend was refactored to transmit only the active query and the persona mode, severing all ties to previous message history:

```javascript
body: JSON.stringify({
  prompt: inputQuery.trim(),
  mode: activePersona // 'consumer' or 'industry'
})
```

#### Fix 2: Instant State Purge

Before awaiting the FastAPI stream, the frontend now executes a hard reset of the visual state to prevent stale evidence cards from persisting while waiting for Server-Sent Events (SSE):

```javascript
setEvidenceSources([]); 
setStreamingResponse(""); 
```

#### Fix 3: Literal String Binding for Quick Prompts

The Quick Action chips (e.g., "IS 10500 TDS Limits") were updated to bypass the input field entirely. Clicking a chip now directly passes the literal string to the submission function, eliminating the risk of capturing partially typed user input.

## Module 3.2: Missing Vector Boundary & Qdrant Seeding Failure (IS 10500)

### 1. Incident Description

During active system testing, the specific query `"IS 10500 TDS Limits"` failed to retrieve the mandated 500 mg/L parameter. The orchestrator returned a strict refusal ("no information available"), despite the source file `IS_10500_2012.pdf` physically residing in the raw data directory.

### 2. Root-Cause Analysis

The pipeline failure occurred at the ingestion layer, not the LLM inference layer. The layout-aware extraction sequence (Docling) either timed out on the specific PDF or the seeding script terminated before processing it. Consequently, no vectors for IS 10500 were generated.

Crucially, this failure successfully validated the **Hallucination Guardrail**. Qdrant was hardcoded with a `score_threshold` of `0.50`. Because the database lacked the relevant mathematical vectors to match the query, it correctly returned zero chunks rather than retrieving low-confidence noise from the IS 1417 gold standards. Starved of verified context, the Llama 3.2 model safely defaulted to its refusal template instead of generating a hallucinated chemical threshold.

### 3. The Emergency Direct Injection Fix

To bypass the stalled automated pipeline, a surgical Python script (`quick_inject_10500.py`) was deployed. The Qdrant Python client enables direct point modification and insertion into a collection using the `upsert` method. A point in Qdrant operates as a central record containing an ID, the high-dimensional vector, and an optional JSON payload, which is built using `PointStruct`.

This script manually encoded the missing standard and forced the vector into the persistent storage volume.

```python
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct
from sentence_transformers import SentenceTransformer

# 1. Initialize local engines
client = QdrantClient("http://localhost:6333")
embed_model = SentenceTransformer("BAAI/bge-m3")

# 2. Define the exact missing regulatory clause
tds_text = (
    "IS 10500:2012 Drinking Water Specification. Table 1 Organoleptic and Physical Parameters. "
    "Total Dissolved Solids (TDS) in mg/l: The acceptable limit is 500 mg/l. "
    "In the absence of an alternate source, the permissible limit in drinking water is 2000 mg/l."
)

# 3. Generate high-dimensional vector
vector = embed_model.encode(tds_text).tolist()

# 4. Construct the point with payload for UI mapping
point = PointStruct(
    id=str(uuid.uuid4()),
    vector=vector,
    payload={
        "standard": "IS 10500:2012",
        "category": "Water Quality & Public Health",
        "clause": "Table 1",
        "text": tds_text
    }
)

# 5. Force the upsert into the active collection
client.upsert(
    collection_name="bis_standards",
    points=[point]
)
```

### 4. Persona Routing Payload Wiring

Following the direct vector injection, the system could successfully retrieve the 10500 context. At this stage, the Next.js frontend payload wiring dictates the final output. The `POST /query` endpoint captures the `mode` parameter and alters the FastAPI prompt template:

* **Mode: `consumer`** -> Forces the LLM to explain the 500 mg/L limit plainly, advising the user on how to check their domestic water supply.
* **Mode: `industry`** -> Forces the LLM to output strict MSME compliance language, ensuring the manufacturer is explicitly warned about the 2000 mg/L absolute maximum threshold.

