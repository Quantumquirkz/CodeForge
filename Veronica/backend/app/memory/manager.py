from __future__ import annotations

from uuid import uuid4

import chromadb

from app.core.config import settings


class MemoryManager:
    def __init__(self) -> None:
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection(name="veronica_memory")

    def add_memory(self, content: str, metadata: dict | None = None) -> None:
        """Adds a new memory to the vector database using collision-safe IDs."""
        mem_id = f"mem_{uuid4()}"
        self.collection.add(
            documents=[content],
            metadatas=[metadata or {}],
            ids=[mem_id],
        )

    def search_memories(self, query: str, n_results: int = 5) -> list[str]:
        """Retrieves relevant memories based on a query."""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
        )
        return results["documents"][0] if results["documents"] else []


memory_manager = MemoryManager()
