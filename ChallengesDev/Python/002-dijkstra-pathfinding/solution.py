import heapq
from typing import Dict, List, Tuple, Optional

def dijkstra(graph: Dict[int, List[Tuple[int, int]]], start: int) -> Tuple[Dict[int, float], Dict[int, Optional[int]]]:
    """
    Computes the shortest path in a weighted graph using Dijkstra's algorithm.
    
    Args:
        graph: Dictionary where keys are nodes and values are lists of (neighbor, weight).
        start: Starting node.
        
    Returns:
        Tuple: (distances, parents) for path reconstruction.
    """
    # Initialize distances as infinity and parents as None
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    parents = {node: None for node in graph}
    
    # Priority Queue: (accumulated_distance, current_node)
    pq = [(0, start)]
    
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        
        # If we already found a shorter path to this node, skip
        if current_distance > distances[current_node]:
            continue
            
        for neighbor, weight in graph[current_node]:
            distance = current_distance + weight
            
            # Edge relaxation
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                parents[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))
                
    return distances, parents

def reconstruct_path(parents: Dict[int, Optional[int]], target: int) -> List[int]:
    """Reconstruye el camino desde el inicio hasta el objetivo."""
    path = []
    curr = target
    while curr is not None:
        path.append(curr)
        curr = parents[curr]
    return path[::-1]

# --- Complexity Analysis ---
# Time: O((V + E) log V)
#   - Each node is extracted from the heap once: O(V log V)
#   - Each edge is relaxed once and may cause a heap push: O(E log V)
# Space: O(V + E)
#   - We store distances, parents, and the graph in memory.
