#include "solucion.cpp"
#include <iostream>
#include <cassert>

int main() {
    std::vector<int> nums = {1, 3, 5, 7, 9, 11};
    SegmentTree st(nums);

    assert(st.query(1, 3) == 15);
    st.update(1, 10);
    assert(st.query(1, 3) == 22);
    assert(st.query(0, 5) == 43);

    std::cout << "Challenge 006 (C++): SegmentTree verified." << std::endl;
    return 0;
}
