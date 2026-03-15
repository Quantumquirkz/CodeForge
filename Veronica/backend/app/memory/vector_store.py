"""ChromaDB vector store for RAG."""

from typing import Any

from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

from app.core.config import settings


def get_embeddings() -> OpenAIEmbeddings:
    """Return configured embeddings model."""
    return OpenAIEmbeddings(
        model=settings.embeddings_model,
        api_key=settings.openai_api_key,
    )


def get_vector_store() -> Chroma:
    """Return Chroma vector store with persistent storage."""
    embeddings = get_embeddings()
    return Chroma(
        collection_name=settings.chroma_collection_name,
        embedding_function=embeddings,
        persist_directory=settings.chroma_db_path,
    )


def get_retriever(top_k: int = 5):
    """Return retriever for RAG."""
    vectorstore = get_vector_store()
    return vectorstore.as_retriever(search_kwargs={"k": top_k})


def add_documents(texts: list[str], metadatas: list[dict[str, Any]] | None = None) -> None:
    """Add documents to the vector store."""
    store = get_vector_store()
    store.add_texts(texts, metadatas=metadatas or [{}] * len(texts))
