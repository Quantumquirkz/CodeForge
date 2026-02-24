public class Test {
    public static void main(String[] args) {
        Solucion sol = new Solucion();

        // Create sample lists
        ListNode l1 = new ListNode(1, new ListNode(4, new ListNode(5)));
        ListNode l2 = new ListNode(1, new ListNode(3, new ListNode(4)));
        ListNode l3 = new ListNode(2, new ListNode(6));

        ListNode[] lists = {l1, l2, l3};
        ListNode result = sol.mergeKLists(lists);

        // Verify order
        int[] expected = {1, 1, 2, 3, 4, 4, 5, 6};
        int i = 0;
        while (result != null) {
            assert result.val == expected[i];
            result = result.next;
            i++;
        }

        System.out.println("Challenge 003 (Java): All cases passed.");
    }
}
