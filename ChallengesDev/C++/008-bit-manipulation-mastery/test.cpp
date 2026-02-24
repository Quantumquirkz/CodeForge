#include "solucion.cpp"
#include <iostream>
#include <cassert>

int main() {
    BitMaster bm;

    assert(bm.countSetBits(7) == 3);
    assert(bm.countSetBits(16) == 1);

    assert(bm.isPowerOfTwo(16) == true);
    assert(bm.isPowerOfTwo(15) == false);

    std::vector<int> nums = {4, 1, 2, 1, 2};
    assert(bm.getSingleNumber(nums) == 4);

    // reverseBits test (example: 1 is 00...01, reversed is 10...00)
    assert(bm.reverseBits(1) == 2147483648u);

    std::cout << "Challenge 008 (C++): Bit Manipulation Mastery verified." << std::endl;
    return 0;
}
