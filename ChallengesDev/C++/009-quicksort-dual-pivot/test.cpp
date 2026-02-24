#include "solucion.cpp"
#include <iostream>
#include <cassert>
#include <vector>

int main() {
    DualPivotSorting sorter;

    std::vector<int> nums = {24, 8, 42, 75, 29, 77, 38, 57};
    sorter.sort(nums, 0, nums.size() - 1);

    std::vector<int> expected = {8, 24, 29, 38, 42, 57, 75, 77};
    assert(nums == expected);

    std::vector<int> nums2 = {5, 2, 9, 1, 5, 6};
    sorter.sort(nums2, 0, nums2.size() - 1);
    std::vector<int> expected2 = {1, 2, 5, 5, 6, 9};
    assert(nums2 == expected2);

    std::cout << "Challenge 009 (C++): Dual-Pivot Quicksort verified." << std::endl;
    return 0;
}
