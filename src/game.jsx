import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// ––––––– TYPES & CONSTANTS –––––––

interface Cell {
  row: number;
  col: number;
  letter: string;
  isFound: boolean;
}

type Coordinate = { row: number; col: number };

const WORD_LIST = ["REACT", "JAVASCRIPT", "HTML", "CSS", "NODE", "API"];
const GRID_SIZE = 10;

// Allowed directions for word placement (and valid selection)
const directions: { dx: number; dy: number }[] = [
  { dx: 0, dy: 1 },    // right
  { dx: 1, dy: 0 },    // down
  { dx: 0, dy: -1 },   // left
  { dx: -1, dy: 0 },   // up
  { dx: 1, dy: 1 },    // down-right
  { dx: -1, dy: -1 },  // up-left
  { dx: 1, dy: -1 },   // down-left
  { dx: -1, dy: 1 }    // up-right
];

// ––––––– HELPER FUNCTIONS –––––––

// Return a random uppercase letter.
function randomLetter() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[Math.floor(Math.random() * letters.length)];
}

// Generate an empty grid (cells with an empty letter)
function generateEmptyGrid(size: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let row = 0; row < size; row++) {
    const currentRow: Cell[] = [];
    for (let col = 0; col < size; col++) {
      currentRow.push({ row, col, letter: "", isFound: false });
    }
    grid.push(currentRow);
  }
  return grid;
}

// Try to place a given word into the grid along one of the eight directions.
// Returns an array of coordinates where the word was placed (or null on failure).
function placeWord(grid: Cell[][], word: string): Coordinate[] | null {
  const size = grid.length;
  for (let attempt = 0; attempt < 100; attempt++) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    // Calculate starting limits so that the word fits
    let maxRow = size;
    let maxCol = size;
    let minRow = 0;
    let minCol = 0;
    if (dir.dx === 1) maxRow = size - word.length;
    if (dir.dx === -1) minRow = word.length - 1;
    if (dir.dy === 1) maxCol = size - word.length;
    if (dir.dy === -1) minCol = word.length - 1;
    
    const startRow = Math.floor(Math.random() * (maxRow - minRow)) + minRow;
    const startCol = Math.floor(Math.random() * (maxCol - minCol)) + minCol;
    
    let canPlace = true;
    const positions: Coordinate[] = [];
    for (let i = 0; i < word.length; i++) {
      const r = startRow + i * dir.dx;
      const c = startCol + i * dir.dy;
      // Make sure we’re in bounds
      if (r < 0 || r >= size || c < 0 || c >= size) {
        canPlace = false;
        break;
      }
      const currentCell = grid[r][c];
      // Allow overlapping only if the letter is the same
      if (currentCell.letter !== "" && currentCell.letter !== word[i]) {
        canPlace = false;
        break;
      }
      positions.push({ row: r, col: c });
    }
    if (canPlace) {
      // Place the word into the grid
      for (let i = 0; i < word.length; i++) {
        const { row, col } = positions[i];
        grid[row][col].letter = word[i];
      }
      return positions;
    }
  }
  return null;
}

// Fill any empty cells in the grid with random letters.
function fillGrid(grid: Cell[][]) {
  for (let row of grid) {
    for (let cell of row) {
      if (cell.letter === "") {
        cell.letter = randomLetter();
      }
    }
  }
}

// A mapping from word to the coordinates of its placement.
interface PlacementMap {
  [word: string]: Coordinate[];
}

// ––––––– MAIN COMPONENT –––––––

const WordSearchGame: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [placements, setPlacements] = useState<PlacementMap>({});
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<Coordinate[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start a new game on mount and when “New Game” is clicked.
  useEffect(() => {
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // When a word is found, check win condition.
  useEffect(() => {
    if (foundWords.length === WORD_LIST.length) {
      setMessage("Congratulations! You found all the words!");
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [foundWords]);

  // Start the timer once the grid is generated.
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [grid]);

  // Generate a new grid, place all words, and reset state.
  const startNewGame = () => {
    setMessage("");
    setFoundWords([]);
    setTime(0);
    const newGrid = generateEmptyGrid(GRID_SIZE);
    const newPlacements: PlacementMap = {};
    for (const word of WORD_LIST) {
      const positions = placeWord(newGrid, word);
      if (positions) {
        newPlacements[word] = positions;
      } else {
        console.warn(`Could not place word: ${word}`);
      }
    }
    fillGrid(newGrid);
    setGrid(newGrid);
    setPlacements(newPlacements);
  };

  // When the user presses the mouse down on a cell, start the selection.
  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    setSelectedCells([{ row, col }]);
  };

  // As the user drags over cells, update the selection to form a straight line
  // (horizontal, vertical, or diagonal) from the starting cell to the hovered cell.
  const handleMouseEnter = (row: number, col: number) => {
    if (!isDragging) return;
    const last = selectedCells[selectedCells.length - 1];
    if (last && last.row === row && last.col === col) return;
    const start = selectedCells[0];
    const dRow = row - start.row;
    const dCol = col - start.col;
    
    // Determine if the movement is along a straight line
    if (dRow === 0 && dCol !== 0) {
      // Horizontal selection
      const step = { row: 0, col: dCol > 0 ? 1 : -1 };
      const length = Math.abs(dCol) + 1;
      const newSelection: Coordinate[] = [];
      for (let i = 0; i < length; i++) {
        newSelection.push({ row: start.row, col: start.col + i * step.col });
      }
      setSelectedCells(newSelection);
    } else if (dCol === 0 && dRow !== 0) {
      // Vertical selection
      const step = { row: dRow > 0 ? 1 : -1, col: 0 };
      const length = Math.abs(dRow) + 1;
      const newSelection: Coordinate[] = [];
      for (let i = 0; i < length; i++) {
        newSelection.push({ row: start.row + i * step.row, col: start.col });
      }
      setSelectedCells(newSelection);
    } else if (Math.abs(dRow) === Math.abs(dCol)) {
      // Diagonal selection
      const step = { row: dRow > 0 ? 1 : -1, col: dCol > 0 ? 1 : -1 };
      const length = Math.abs(dRow) + 1;
      const newSelection: Coordinate[] = [];
      for (let i = 0; i < length; i++) {
        newSelection.push({ row: start.row + i * step.row, col: start.col + i * step.col });
      }
      setSelectedCells(newSelection);
    }
    // If not a straight line, ignore the movement.
  };

  // When the user releases the mouse, finalize the selection.
  const handleMouseUp = () => {
    setIsDragging(false);
    if (selectedCells.length === 0) return;
    // Build the selected word from the grid letters.
    const letters = selectedCells
      .map(({ row, col }) => grid[row][col].letter)
      .join("");
    const reversedLetters = letters.split("").reverse().join("");
    let foundWord = "";
    // Check each word from our list that has not yet been found.
    for (const word of WORD_LIST) {
      if ((word === letters || word === reversedLetters) && !foundWords.includes(word)) {
        const placement = placements[word];
        // Check if the selection exactly matches the word’s placement
        if (
          isSameSelection(placement, selectedCells) ||
          isSameSelection(placement, [...selectedCells].reverse())
        ) {
          foundWord = word;
          break;
        }
      }
    }
    if (foundWord) {
      setFoundWords((prev) => [...prev, foundWord]);
      // Update grid cells for the found word (so that they can be highlighted)
      const newGrid = grid.map((rowArr) =>
        rowArr.map((cell) => {
          if (placements[foundWord].some(pos => pos.row === cell.row && pos.col === cell.col)) {
            return { ...cell, isFound: true };
          }
          return cell;
        })
      );
      setGrid(newGrid);
    }
    setSelectedCells([]);
  };

  // Helper function to check if two coordinate arrays are the same.
  const isSameSelection = (a: Coordinate[], b: Coordinate[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].row !== b[i].row || a[i].col !== b[i].col) return false;
    }
    return true;
  };

  // ––––––– RENDERING –––––––

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Word Search Game</h1>
          <button
            onClick={startNewGame}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            New Game
          </button>
        </div>
        <div className="flex flex-col md:flex-row">
          {/* Game Grid */}
          <div className="grid grid-cols-10 gap-1 mr-4 select-none">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                // Determine if this cell is part of the current selection.
                const isSelected = selectedCells.some(
                  (pos) => pos.row === rowIndex && pos.col === colIndex
                );
                return (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-8 h-8 flex items-center justify-center border border-gray-300 text-lg font-mono cursor-pointer
                      ${cell.isFound
                        ? "bg-green-300"
                        : isSelected
                        ? "bg-yellow-300"
                        : "bg-white"}`}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    onMouseUp={handleMouseUp}
                    layout
                  >
                    {cell.letter}
                  </motion.div>
                );
              })
            )}
          </div>
          {/* Word List & Timer */}
          <div className="mt-4 md:mt-0">
            <h2 className="text-xl font-bold mb-2">Words to Find:</h2>
            <ul>
              {WORD_LIST.map((word) => (
                <li
                  key={word}
                  className={`text-lg ${
                    foundWords.includes(word)
                      ? "line-through text-green-600"
                      : "text-gray-800"
                  }`}
                >
                  {word}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-lg">
              Timer: {time} seconds
            </div>
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-green-200 text-green-800 rounded"
              >
                {message}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordSearchGame;
