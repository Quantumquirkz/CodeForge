#include "solucion.cpp"
#include <cassert>

int main() {
    {
        CustomSharedPtr<int> ptr1(new int(100));
        assert(ptr1.use_count() == 1);
        assert(*ptr1 == 100);

        {
            CustomSharedPtr<int> ptr2 = ptr1;
            assert(ptr1.use_count() == 2);
            assert(ptr2.use_count() == 2);
            assert(*ptr2 == 100);
        }
        assert(ptr1.use_count() == 1);
    }
    
    // Self-assignment test
    CustomSharedPtr<int> ptr3(new int(50));
    ptr3 = ptr3;
    assert(ptr3.use_count() == 1);

    std::cout << "Challenge 002 (C++): CustomSharedPtr verified." << std::endl;
    return 0;
}
