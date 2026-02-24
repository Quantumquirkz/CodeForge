#include "solucion.cpp"
#include <iostream>
#include <cassert>

int main() {
    MatrixChainOptimizer optimizer;

    // Case 1
    std::vector<int> p1 = {10, 30, 5, 60};
    assert(optimizer.solve(p1) == 4500);

    // Case 2
    std::vector<int> p2 = {40, 20, 30, 10, 30};
    assert(optimizer.solve(p2) == 26000);

    // Case 3: Single matrix (two dimensions)
    std::vector<int> p3 = {10, 20};
    assert(optimizer.solve(p3) == 0);

    std::cout << "Challenge 010 (C++): Matrix Chain Multiplication verified." << std::endl;
    return 0;
}
