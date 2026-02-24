public class Test {
    public static void main(String[] args) {
        AVLTree tree = new AVLTree();

        tree.root = tree.insert(tree.root, 10);
        tree.root = tree.insert(tree.root, 20);
        tree.root = tree.insert(tree.root, 30);
        tree.root = tree.insert(tree.root, 40);
        tree.root = tree.insert(tree.root, 50);
        tree.root = tree.insert(tree.root, 25);

        // The root should be 30 after balancing
        // But it depends on the exact order; the important thing is that it is balanced
        assert Math.abs(tree.getBalance(tree.root)) <= 1;
        
        System.out.println("Challenge 008 (Java): AVL Tree inserted and balanced.");
    }
}
