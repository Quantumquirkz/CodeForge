import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings

class MemoryManager:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection(name="veronica_memory")

    def add_memory(self, content: str, metadata: dict = None):
        """Adds a new memory to the vector database."""
        # Simple ID generation for now
        mem_id = f"mem_{self.collection.count()}"
        self.collection.add(
            documents=[content],
            metadatas=[metadata or {}],
            ids=[mem_id]
        )

    def search_memories(self, query: str, n_results: int = 5):
        """Retrieves relevant memories based on a query."""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return results["documents"][0] if results["documents"] else []

memory_manager = MemoryManager()
