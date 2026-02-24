#include "solucion.cpp"
#include <iostream>
#include <cassert>

struct MyObject {
    int x, y;
};

int main() {
    MemoryPool pool(sizeof(MyObject), 2);

    void* p1 = pool.allocate();
    void* p2 = pool.allocate();
    void* p3 = pool.allocate();

    assert(p1 != nullptr);
    assert(p2 != nullptr);
    assert(p3 == nullptr); // Pool full

    pool.deallocate(p1);
    void* p4 = pool.allocate();
    assert(p4 == p1); // Memory reuse

    std::cout << "Challenge 003 (C++): MemoryPool verified." << std::endl;
    return 0;
}
