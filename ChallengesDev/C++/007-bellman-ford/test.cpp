#include "solucion.cpp"
#include <iostream>
#include <cassert>

int main() {
    BellmanFord bf;
    int V = 5;
    std::vector<Edge> edges = {
        {0, 1, -1}, {0, 2, 4}, {1, 2, 3}, {1, 3, 2}, 
        {1, 4, 2}, {3, 2, 5}, {3, 1, 1}, {4, 3, -3}
    };

    std::vector<int> dist = bf.shortestPath(V, edges, 0);

    assert(!dist.empty());
    assert(dist[0] == 0);
    assert(dist[1] == -1);
    assert(dist[2] == 2);
    assert(dist[3] == -2);
    assert(dist[4] == 1);

    // Negative cycle case
    std::vector<Edge> neg_cycle = {{0, 1, 1}, {1, 2, -1}, {2, 0, -1}};
    dist = bf.shortestPath(3, neg_cycle, 0);
    assert(dist.empty());

    std::cout << "Challenge 007 (C++): Bellman-Ford verified." << std::endl;
    return 0;
}
