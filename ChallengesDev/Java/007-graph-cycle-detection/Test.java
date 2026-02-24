public class Test {
    public static void main(String[] args) {
        Solucion sol = new Solucion();

        // Case 1: With cycle
        int v1 = 4;
        int[][] e1 = {{0, 1}, {1, 2}, {2, 0}, {2, 3}};
        assert sol.hasCycle(v1, e1) == true;

        // Case 2: Without cycle
        int v2 = 3;
        int[][] e2 = {{0, 1}, {1, 2}};
        assert sol.hasCycle(v2, e2) == false;

        // Case 3: Multiple components, one with cycle
        int v3 = 5;
        int[][] e3 = {{0, 1}, {2, 3}, {3, 4}, {4, 2}};
        assert sol.hasCycle(v3, e3) == true;

        System.out.println("Challenge 007 (Java): All cases passed.");
    }
}
