// Main App

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Board } from './components/Board';
import { GameInfo } from './components/GameInfo';
import type { GameState, Position, PieceType } from './game/types';
import { 
  initializeGame,
  getValidMoves,
  checkForCheck,
  checkWinCondition,
  nextTurn,
  getConfig,
} from './game/gameLogic';
import { getAIMove } from './game/ai';
import './App.css';

interface BoundingBox {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

interface PlayerType {
  color: string;
  isAI: boolean;
}

function calculateAttackRange(piece: { type: PieceType; player: string }, position: Position, boardSize: number): BoundingBox | null {
  const { maxMovement } = getConfig(2);
  
  const { row, col } = position;
  
  let minRow = row;
  let maxRow = row;
  let minCol = col;
  let maxCol = col;
  
  switch (piece.type) {
    case 'queen':
    case 'rook':
    case 'bishop':
      minRow = Math.max(0, row - maxMovement);
      maxRow = Math.min(boardSize - 1, row + maxMovement);
      minCol = Math.max(0, col - maxMovement);
      maxCol = Math.min(boardSize - 1, col + maxMovement);
      break;
    case 'knight':
      minRow = Math.max(0, row - 4);
      maxRow = Math.min(boardSize - 1, row + 4);
      minCol = Math.max(0, col - 4);
      maxCol = Math.min(boardSize - 1, col + 4);
      break;
    case 'king':
      minRow = Math.max(0, row - 2);
      maxRow = Math.min(boardSize - 1, row + 2);
      minCol = Math.max(0, col - 2);
      maxCol = Math.min(boardSize - 1, col + 2);
      break;
    case 'pawn':
      const direction = piece.player === 'blue' ? 1 : -1;
      minRow = Math.max(0, row - 2 * Math.abs(direction));
      maxRow = Math.min(boardSize - 1, row + 4 * direction);
      if (maxRow < minRow) { const temp = maxRow; maxRow = minRow; minRow = temp; }
      minCol = Math.max(0, col - 2);
      maxCol = Math.min(boardSize - 1, col + 2);
      break;
    default:
      return null;
  }
  
  return { minRow, maxRow, minCol, maxCol };
}

function App() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(2));
  const [playerTypes, setPlayerTypes] = useState<PlayerType[]>([
    { color: 'blue', isAI: false },
    { color: 'red', isAI: true },
  ]);
  const [isAITurn, setIsAITurn] = useState(false);
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  
  const boundingBox = useMemo(() => {
    if (!gameState.selectedCell) return null;
    const piece = gameState.board[gameState.selectedCell.row][gameState.selectedCell.col].piece;
    if (!piece) return null;
    return calculateAttackRange(piece, gameState.selectedCell, gameState.board.length);
  }, [gameState.selectedCell, gameState.board]);
  
  // Check if current player is AI
  const currentPlayerIsAI = useMemo(() => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return false;
    const playerType = playerTypes.find(p => p.color === currentPlayer.color);
    return playerType?.isAI || false;
  }, [gameState.currentPlayerIndex, gameState.players, playerTypes]);
  
  // Trigger AI move
  useEffect(() => {
    if (currentPlayerIsAI && gameState.phase === 'playing' && !isAITurn) {
      setIsAITurn(true);
      
      const timer = setTimeout(() => {
        const aiMove = getAIMove(gameStateRef.current);
        if (aiMove) {
          handleCellClick(aiMove);
        }
        setIsAITurn(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIsAI, gameState.phase, gameState.currentPlayerIndex, isAITurn]);
  
  const handleCellClick = useCallback((position: Position) => {
    setGameState((prev) => {
      if (prev.phase === 'finished') return prev;
      
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const playerType = playerTypes.find(p => p.color === currentPlayer?.color);
      if (playerType?.isAI && prev.phase === 'playing') return prev;
      
      const clickedCell = prev.board[position.row][position.col];
      
      if (prev.selectedCell) {
        const isValidMove = prev.validMoves.some(
          m => m.row === position.row && m.col === position.col
        );
        
        if (isValidMove) {
          const newBoard = prev.board.map(row => row.map(cell => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));
          const selectedPiece = newBoard[prev.selectedCell.row][prev.selectedCell.col].piece;
          
          if (clickedCell.piece) {
            currentPlayer.capturedPieces.push(clickedCell.piece);
            
            if (clickedCell.piece.type === 'king') {
              const capturedPlayerIndex = prev.players.findIndex(p => p.color === clickedCell.piece!.player);
              if (capturedPlayerIndex !== -1) {
                prev.players[capturedPlayerIndex].alive = false;
              }
            }
          }
          
          newBoard[position.row][position.col].piece = selectedPiece;
          newBoard[prev.selectedCell.row][prev.selectedCell.col].piece = null;
          
          if (selectedPiece) {
            selectedPiece.hasMoved = true;
          }
          
          const nextPlayerIndex = nextTurn(prev.players, prev.currentPlayerIndex);
          const updatedPlayers = prev.players.map((player, idx) => ({
            ...player,
            inCheck: idx === nextPlayerIndex ? checkForCheck(newBoard, player.color, prev.players) : player.inCheck,
          }));
          
          const winner = checkWinCondition(updatedPlayers);
          
          return {
            ...prev,
            board: newBoard,
            players: updatedPlayers,
            currentPlayerIndex: nextPlayerIndex,
            selectedCell: null,
            validMoves: [],
            phase: winner ? 'finished' : 'playing',
            winner,
          };
        }
        
        if (clickedCell.piece && clickedCell.piece.player === currentPlayer.color) {
          const moves = getValidMoves(prev.board, clickedCell.piece, position, prev.players, currentPlayer);
          return { ...prev, selectedCell: position, validMoves: moves };
        }
        
        return { ...prev, selectedCell: null, validMoves: [] };
      }
      
      if (clickedCell.piece && clickedCell.piece.player === currentPlayer.color) {
        const moves = getValidMoves(prev.board, clickedCell.piece, position, prev.players, currentPlayer);
        return { ...prev, selectedCell: position, validMoves: moves };
      }
      
      return prev;
    });
  }, [playerTypes]);
  
  const handleNewGame = useCallback((numPlayers: number) => {
    setGameState(initializeGame(numPlayers));
    // Reset player types for new game
    if (numPlayers === 2) {
      setPlayerTypes([
        { color: 'blue', isAI: false },
        { color: 'red', isAI: true },
      ]);
    } else {
      setPlayerTypes([
        { color: 'blue', isAI: false },
        { color: 'red', isAI: true },
        { color: 'green', isAI: false },
        { color: 'yellow', isAI: false },
      ]);
    }
  }, []);
  
  const toggleAI = useCallback((color: string) => {
    setPlayerTypes(prev => prev.map(p => 
      p.color === color ? { ...p, isAI: !p.isAI } : p
    ));
  }, []);
  
  return (
    <div className="app">
      <div className="game-area">
        <Board gameState={gameState} onCellClick={handleCellClick} boundingBox={boundingBox} />
      </div>
      <div className="sidebar">
        <GameInfo 
          gameState={gameState} 
          onNewGame={handleNewGame}
          selectedPiece={gameState.selectedCell ? gameState.board[gameState.selectedCell.row][gameState.selectedCell.col].piece : null}
          selectedPosition={gameState.selectedCell}
          playerTypes={playerTypes}
          onToggleAI={toggleAI}
          isAITurn={isAITurn}
        />
      </div>
    </div>
  );
}

export default App;
