import chromadb
from chromadb.config import Settings
import os

# Set up local embedded ChromaDB
db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
client = chromadb.PersistentClient(path=db_path)

# Get or create the collection
collection = client.get_or_create_collection(name="chat_memory")

def store_memory(user_id: int, message: str, role: str):
    """Stores a message in the semantic memory."""
    import time
    doc_id = f"user_{user_id}_{role}_{int(time.time() * 1000)}"
    
    collection.add(
        documents=[message],
        metadatas=[{"user_id": user_id, "role": role}],
        ids=[doc_id]
    )

def recall_memory(user_id: int, query: str, top_k: int = 3) -> str:
    """Recalls the most relevant past messages for this user."""
    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        where={"user_id": user_id}
    )
    
    if not results or not results['documents'] or not results['documents'][0]:
        return ""
        
    context_msgs = results['documents'][0]
    return "\n".join([f"Past relevant context: {msg}" for msg in context_msgs])
