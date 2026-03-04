// Simple AI for Empire Chess - Simplified: Pawn forward moves only

import type { GameState, Position } from './types';
import { getValidMoves } from './gameLogic';

export interface AIMove {
  from: Position;
  to: Position;
}

export function getAIMove(gameState: GameState): AIMove | null {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (!currentPlayer || !currentPlayer.alive) {
    console.log('AI: No current player or not alive');
    return null;
  }
  
  const playerColor = currentPlayer.color;
  console.log('AI: Computing for player', playerColor);
  
  // Find all pieces for current player
  const pieces: { pos: Position; type: string; moves: Position[] }[] = [];
  const boardSize = gameState.board.length;
  
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = gameState.board[row][col].piece;
      if (!piece || piece.player !== playerColor) continue;
      
      // Use game's getValidMoves to get valid moves for this piece
      const validMoves = getValidMoves(gameState.board, piece, { row, col }, gameState.players, currentPlayer);
      
      if (validMoves.length > 0) {
        pieces.push({ pos: { row, col }, type: piece.type, moves: validMoves });
      }
    }
  }
  
  console.log('AI: Found', pieces.length, 'pieces with valid moves');
  
  if (pieces.length === 0) {
    console.log('AI: No pieces with moves!');
    return null;
  }
  
  // Pick a random piece
  const selectedPiece = pieces[Math.floor(Math.random() * pieces.length)];
  
  // Pick a random move
  const selectedMove = selectedPiece.moves[Math.floor(Math.random() * selectedPiece.moves.length)];
  
  console.log('AI: Selected', selectedPiece.type, 'at', selectedPiece.pos, 'moving to', selectedMove);
  
  // Return both source and destination
  return { from: selectedPiece.pos, to: selectedMove };
}
