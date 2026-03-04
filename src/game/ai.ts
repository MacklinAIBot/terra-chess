// Simple AI for Empire Chess

import type { GameState, Position, Piece, PlayerColor, PieceType, Cell } from './types';
import { getConfig } from './gameLogic';

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100,
};

export function evaluateBoard(
  board: Cell[][],
  players: { color: PlayerColor; alive: boolean }[],
  currentPlayerIndex: number
): number {
  let score = 0;
  const currentPlayerColor = players[currentPlayerIndex]?.color;
  
  if (!currentPlayerColor) return 0;
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col].piece;
      if (!piece) continue;
      
      let value = PIECE_VALUES[piece.type];
      const centerDistance = Math.abs(row - board.length / 2) + Math.abs(col - board.length / 2);
      value += (32 - centerDistance) * 0.01;
      
      if (piece.player === currentPlayerColor) {
        score += value;
      } else {
        score -= value;
      }
    }
  }
  
  return score;
}

// Check if position is within board bounds
function isValidPos(row: number, col: number, boardSize: number): boolean {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

// Get basic moves for a piece
function getBasicMoves(board: Cell[][], piece: Piece, pos: Position): Position[] {
  const moves: Position[] = [];
  const boardSize = board.length;
  const { maxMovement } = getConfig(2);
  
  const addIfValid = (r: number, c: number) => {
    if (!isValidPos(r, c, boardSize)) return;
    const target = board[r]?.[c]?.piece;
    if (target?.player === piece.player) return;
    moves.push({ row: r, col: c });
  };
  
  switch (piece.type) {
    case 'pawn':
      // Red moves toward row 0 (up), Blue moves toward row 31 (down)
      const dir = piece.player === 'red' ? -1 : 1;
      // Forward up to 4 spaces
      for (let i = 1; i <= 4; i++) addIfValid(pos.row + dir * i, pos.col);
      // Backward up to 2 spaces  
      for (let i = 1; i <= 2; i++) addIfValid(pos.row - dir * i, pos.col);
      // Sideways
      for (let i = 1; i <= 2; i++) {
        addIfValid(pos.row, pos.col - i);
        addIfValid(pos.row, pos.col + i);
      }
      // Diagonal captures
      addIfValid(pos.row + dir, pos.col - 1);
      addIfValid(pos.row + dir, pos.col + 1);
      break;
      
    case 'knight':
      const knightMoves: [number, number][] = [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]];
      knightMoves.forEach(([dr, dc]) => addIfValid(pos.row + dr, pos.col + dc));
      break;
      
    case 'bishop':
    case 'rook':
    case 'queen':
      const directions: [number, number][] = [];
      if (piece.type !== 'rook') {
        directions.push([1,1], [1,-1], [-1,1], [-1,-1]);
      }
      if (piece.type !== 'bishop') {
        directions.push([1,0], [-1,0], [0,1], [0,-1]);
      }
      directions.forEach(([dr, dc]) => {
        for (let i = 1; i <= maxMovement; i++) {
          const r = pos.row + dr * i;
          const c = pos.col + dc * i;
          if (!isValidPos(r, c, boardSize)) break;
          addIfValid(r, c);
          if (board[r]?.[c]?.piece) break;
        }
      });
      break;
      
    case 'king':
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (dr === 0 && dc === 0) continue;
          addIfValid(pos.row + dr, pos.col + dc);
        }
      }
      break;
  }
  
  return moves;
}

function getAllMovesForPlayer(
  board: Cell[][],
  playerColor: PlayerColor
): { from: Position; to: Position; score: number }[] {
  const moves: { from: Position; to: Position; score: number }[] = [];
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col].piece;
      if (!piece || piece.player !== playerColor) continue;
      
      const pieceMoves = getBasicMoves(board, piece, { row, col });
      
      pieceMoves.forEach(to => {
        let moveScore = 0;
        const targetPiece = board[to.row]?.[to.col]?.piece;
        if (targetPiece) {
          moveScore += PIECE_VALUES[targetPiece.type] * 10;
        }
        // Center control bonus
        const centerDistance = Math.abs(to.row - board.length / 2) + Math.abs(to.col - board.length / 2);
        moveScore += (32 - centerDistance) * 0.1;
        
        // Prefer not moving king unless necessary
        if (piece.type === 'king') moveScore -= 5;
        
        moves.push({ from: { row, col }, to, score: moveScore });
      });
    }
  }
  
  return moves;
}

export function getAIMove(gameState: GameState): Position | null {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (!currentPlayer || !currentPlayer.alive) {
    console.log('AI: No current player or not alive');
    return null;
  }
  
  const playerColor = currentPlayer.color;
  console.log('AI: Computing for player', playerColor);
  
  const allMoves = getAllMovesForPlayer(gameState.board, playerColor);
  console.log('AI: Found', allMoves.length, 'moves');
  
  if (allMoves.length === 0) {
    console.log('AI: No moves available!');
    return null;
  }
  
  // Sort by score and add randomness
  allMoves.sort((a, b) => b.score - a.score);
  
  // Pick from top 3 moves randomly
  const topCount = Math.min(3, allMoves.length);
  const selected = allMoves[Math.floor(Math.random() * topCount)];
  
  console.log('AI: Selected move', selected);
  
  return selected.to;
}
