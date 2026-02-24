public class Test {
    public static void main(String[] args) {
        Solucion sol = new Solucion();

        // Case 1: Odd
        int[] n1 = {1, 3};
        int[] n2 = {2};
        assert sol.findMedianSortedArrays(n1, n2) == 2.0;

        // Case 2: Even
        int[] n3 = {1, 2};
        int[] n4 = {3, 4};
        assert sol.findMedianSortedArrays(n3, n4) == 2.5;

        // Case 3: One empty
        int[] n5 = {};
        int[] n6 = {1};
        assert sol.findMedianSortedArrays(n5, n6) == 1.0;

        System.out.println("Challenge 002 (Java): All cases passed.");
    }
}
