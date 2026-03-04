// Board Component

import { useRef, useEffect, useState } from 'react';
import type { GameState, Position } from '../game/types';
import { Cell } from './Cell';
import './Board.css';

interface BoundingBox {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

interface BoardProps {
  gameState: GameState;
  onCellClick: (position: Position) => void;
  boundingBox: BoundingBox | null;
}

// Convert column index to letter (0=A, 1=B, ..., 25=Z, 26=AA, 27=BB, ..., 31=FF)
function colToLetter(col: number): string {
  if (col < 26) {
    return String.fromCharCode(65 + col); // A-Z
  } else {
    // AA=26, BB=27, CC=28, DD=29, EE=30, FF=31
    const letterIndex = col - 26; // 0-5
    const letter = String.fromCharCode(65 + letterIndex);
    return letter + letter;
  }
}

export function Board({ gameState, onCellClick, boundingBox }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(20);
  
  const BOARD_SIZE = gameState.board.length;
  
  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        // Account for labels (30px on each side)
        const availableWidth = containerWidth - 60;
        const availableHeight = containerHeight - 60;
        const maxCellSize = Math.min(
          Math.floor(availableWidth / BOARD_SIZE),
          Math.floor(availableHeight / BOARD_SIZE)
        );
        const baseSize = BOARD_SIZE <= 32 ? 20 : 12;
        setCellSize(Math.max(8, Math.min(maxCellSize, baseSize)));
      }
    };
    
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [BOARD_SIZE]);
  
  const boardWidth = BOARD_SIZE * cellSize;
  const boardHeight = BOARD_SIZE * cellSize;
  
  // Generate column labels (A to FF)
  const colLabels = Array.from({ length: BOARD_SIZE }, (_, i) => colToLetter(i));
  // Generate row labels (1 to 32, bottom to top)
  const rowLabels = Array.from({ length: BOARD_SIZE }, (_, i) => (BOARD_SIZE - i).toString());
  
  return (
    <div className="board-container" ref={containerRef}>
      <div className="board-scroll">
        <div className="board-wrapper">
          {/* Top column labels */}
          <div className="col-labels top">
            {colLabels.map((label, i) => (
              <span key={i} style={{ width: cellSize }}>{label}</span>
            ))}
          </div>
          
          <div className="board-middle">
            {/* Left row labels */}
            <div className="row-labels">
              {rowLabels.map((label, i) => (
                <span key={i} style={{ height: cellSize }}>{label}</span>
              ))}
            </div>
            
            {/* Board grid */}
            <div className="board-container-outer" style={{ position: 'relative' }}>
              <div 
                className="board"
                style={{ 
                  width: boardWidth, 
                  height: boardHeight,
                  minWidth: boardWidth,
                  minHeight: boardHeight,
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                  gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
                }}
              >
                {gameState.board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isSelected = 
                      gameState.selectedCell?.row === rowIndex && 
                      gameState.selectedCell?.col === colIndex;
                    const isValidMove = gameState.validMoves.some(
                      m => m.row === rowIndex && m.col === colIndex
                    );
                    
                    return (
                      <Cell
                        key={`${rowIndex}-${colIndex}`}
                        cell={cell}
                        isSelected={isSelected}
                        isValidMove={isValidMove}
                        onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
                        cellSize={cellSize}
                      />
                    );
                  })
                )}
              </div>
              {/* Attack range bounding box */}
              {boundingBox && (
                <div 
                  className="attack-range-box"
                  style={{
                    position: 'absolute',
                    left: boundingBox.minCol * cellSize + 1,
                    top: boundingBox.minRow * cellSize + 1,
                    width: (boundingBox.maxCol - boundingBox.minCol + 1) * cellSize - 2,
                    height: (boundingBox.maxRow - boundingBox.minRow + 1) * cellSize - 2,
                  }}
                />
              )}
            </div>
            
            {/* Right row labels */}
            <div className="row-labels">
              {rowLabels.map((label, i) => (
                <span key={i} style={{ height: cellSize }}>{label}</span>
              ))}
            </div>
          </div>
          
          {/* Bottom column labels */}
          <div className="col-labels bottom">
            {colLabels.map((label, i) => (
              <span key={i} style={{ width: cellSize }}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
