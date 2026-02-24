import unittest
from solucion import solveNQueens

class TestNQueens(unittest.TestCase):
    def test_n4(self):
        solutions = solveNQueens(4)
        self.assertEqual(len(solutions), 2)
        # Verify that one of the solutions matches the expected result
        expected = [".Q..", "...Q", "Q...", "..Q."]
        self.assertIn(expected, solutions)

    def test_n1(self):
        self.assertEqual(solveNQueens(1), [["Q"]])

    def test_n2_n3(self):
        # No solutions for 2 and 3
        self.assertEqual(solveNQueens(2), [])
        self.assertEqual(solveNQueens(3), [])

if __name__ == '__main__':
    unittest.main()
