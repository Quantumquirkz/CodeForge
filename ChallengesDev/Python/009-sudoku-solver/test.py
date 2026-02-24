import unittest
from solucion import solveSudoku

class TestSudokuSolver(unittest.TestCase):
    def test_example(self):
        board = [
            ["5","3",".",".","7",".",".",".","."],
            ["6",".",".","1","9","5",".",".","."],
            [".","9","8",".",".",".",".","6","."],
            ["8",".",".",".","6",".",".",".","3"],
            ["4",".",".","8",".","3",".",".","1"],
            ["7",".",".",".","2",".",".",".","6"],
            [".","6",".",".",".",".","2","8","."],
            [".",".",".","4","1","9",".",".","5"],
            [".",".",".",".","8",".",".","7","9"]
        ]
        solveSudoku(board)
        # Verify some positions
        self.assertEqual(board[0][2], "4")
        self.assertEqual(board[4][4], "5")
        self.assertEqual(board[8][8], "9")

    def test_complete_row(self):
        # A small fragment
        pass

if __name__ == '__main__':
    unittest.main()
