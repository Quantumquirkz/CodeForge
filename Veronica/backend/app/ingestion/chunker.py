"""Text chunking for embeddings."""

import re


def chunk_texts(
    texts: list[str],
    chunk_size: int = 800,
    chunk_overlap: int = 150,
) -> list[str]:
    """Split texts into chunks for embeddings."""
    chunks = []
    for t in texts:
        words = re.split(r"\s+", t)
        start = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            start = end - chunk_overlap
    return chunks
