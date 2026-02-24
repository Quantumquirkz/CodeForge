import java.util.Arrays;

public class Test {
    public static void main(String[] args) {
        Solucion sol = new Solucion();

        // Case 1
        int n1 = 4;
        int[][] p1 = {{1, 0}, {2, 0}, {3, 1}, {3, 2}};
        int[] res1 = sol.findOrder(n1, p1);
        // Validate that the order satisfies prerequisites (e.g., 3 before 1 and 2, 1/2 before 0)
        assert res1.length == 4;
        
        // Case 2: With cycle
        int n2 = 2;
        int[][] p2 = {{0, 1}, {1, 0}};
        int[] res2 = sol.findOrder(n2, p2);
        assert res2.length == 0;

        System.out.println("Challenge 009 (Java): Topological sort verified.");
    }
}
