#include "solucion.cpp"
#include <iostream>
#include <cassert>

int main() {
    RedBlackTree tree;

    tree.insert(7);
    tree.insert(3);
    tree.insert(18);
    tree.insert(10);
    tree.insert(22);
    tree.insert(8);
    tree.insert(11);
    tree.insert(26);
    tree.insert(2);
    tree.insert(6);
    tree.insert(13);

    // In a Red-Black Tree, the root is always black
    assert(tree.getRoot()->color == BLACK);

    std::cout << "Challenge 005 (C++): Red-Black Tree inserted and balanced." << std::endl;
    return 0;
}
