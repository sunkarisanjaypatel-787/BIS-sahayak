import json
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import MarkdownTextSplitter

from pathlib import Path

embed_model = SentenceTransformer("BAAI/bge-m3", device="cpu")
client = QdrantClient(host="localhost", port=6333)

COLLECTION_NAME = "bis_standards"
client.recreate_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
)

data_file = Path(__file__).resolve().parent.parent / "parsed_bis_knowledge.json"
with open(data_file, "r", encoding="utf-8") as f:
    documents = json.load(f)

# Chunk at 1000 characters with a 200 character overlap to preserve table context
splitter = MarkdownTextSplitter(chunk_size=1000, chunk_overlap=200)
points = []

for doc in documents:
    chunks = splitter.split_text(doc["raw_markdown"])
    for i, chunk in enumerate(chunks):
        points.append(
            PointStruct(
                id=str(uuid.uuid4()),
                vector=embed_model.encode(chunk).tolist(),
                payload={
                    "standard": doc["source_file"],
                    "category": doc["category"],
                    "clause": f"Section {i+1}",
                    "text": chunk
                }
            )
        )

# Upload in batches of 100 to prevent Qdrant overload
for i in range(0, len(points), 100):
    client.upsert(collection_name=COLLECTION_NAME, points=points[i:i + 100])

print(f"[*] Indexed {len(points)} structured BIS clauses into Qdrant.")