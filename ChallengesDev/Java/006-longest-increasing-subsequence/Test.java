public class Test {
    public static void main(String[] args) {
        Solucion sol = new Solucion();

        // Case 1
        int[] n1 = {10, 9, 2, 5, 3, 7, 101, 18};
        assert sol.lengthOfLIS(n1) == 4;

        // Case 2
        int[] n2 = {0, 1, 0, 3, 2, 3};
        assert sol.lengthOfLIS(n2) == 4;

        // Case 3: All equal
        int[] n3 = {7, 7, 7, 7};
        assert sol.lengthOfLIS(n3) == 1;

        System.out.println("Challenge 006 (Java): All cases passed.");
    }
}
