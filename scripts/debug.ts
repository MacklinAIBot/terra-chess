// Debug benchmark - Run a single game with logging
// Usage: npx ts-node scripts/debug.ts

import { initializeGame, getValidMoves, nextTurn, checkForCheck, checkWinCondition } from '../src/game/gameLogic';
import { getAIMove } from '../src/game/ai';
import type { GameState, Position, Player } from '../src/game/types';

function makeMove(gameState: GameState, from: Position, to: Position): GameState {
  const newBoard = gameState.board.map(row => row.map(cell => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const selectedPiece = newBoard[from.row][from.col].piece;
  const clickedCell = newBoard[to.row][to.col].piece;
  
  if (clickedCell) {
    currentPlayer.capturedPieces.push(clickedCell);
    if (clickedCell.type === 'king') {
      const capturedPlayerIndex = gameState.players.findIndex(p => p.color === clickedCell.player);
      if (capturedPlayerIndex !== -1) {
        gameState.players[capturedPlayerIndex].alive = false;
      }
    }
  }
  
  newBoard[to.row][to.col].piece = selectedPiece;
  newBoard[from.row][from.col].piece = null;
  if (selectedPiece) selectedPiece.hasMoved = true;
  
  const nextPlayerIndex = nextTurn(gameState.players, gameState.currentPlayerIndex);
  const updatedPlayers = gameState.players.map((player, idx) => ({
    ...player,
    inCheck: idx === nextPlayerIndex ? checkForCheck(newBoard, player.color, gameState.players) : player.inCheck,
  }));
  
  const winner = checkWinCondition(updatedPlayers);
  
  return {
    ...gameState,
    board: newBoard,
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    phase: winner ? 'finished' : 'playing',
    winner,
  };
}

// Run a single debug game
function runDebugGame(): void {
  let gameState = initializeGame(4);
  console.log('Game started. Current player:', gameState.players[gameState.currentPlayerIndex].color);
  console.log('Board size:', gameState.board.length);
  
  for (let turn = 0; turn < 50; turn++) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    console.log(`\nTurn ${turn + 1}: ${currentPlayer.color}'s turn`);
    console.log('  Alive:', gameState.players.filter(p => p.alive).map(p => p.color).join(', '));
    
    if (!currentPlayer.alive) {
      console.log('  Player eliminated, skipping');
      gameState = { ...gameState, currentPlayerIndex: nextTurn(gameState.players, gameState.currentPlayerIndex) };
      continue;
    }
    
    // Count pieces
    let pieceCount = 0;
    for (let r = 0; r < gameState.board.length; r++) {
      for (let c = 0; c < gameState.board[r].length; c++) {
        if (gameState.board[r][c].piece?.player === currentPlayer.color) pieceCount++;
      }
    }
    console.log(`  Pieces: ${pieceCount}`);
    
    // AI makes a move
    const aiMove = getAIMove(gameState);
    if (aiMove) {
      console.log(`  AI moving from (${aiMove.from.row},${aiMove.from.col}) to (${aiMove.to.row},${aiMove.to.col})`);
      gameState = makeMove(gameState, aiMove.from, aiMove.to);
    } else {
      console.log('  AI has NO VALID_MOVES!');
      console.log('  Checking pieces...');
      for (let r = 0; r < gameState.board.length; r++) {
        for (let c = 0; c < gameState.board[r].length; c++) {
          const piece = gameState.board[r][c].piece;
          if (piece && piece.player === currentPlayer.color) {
            const moves = getValidMoves(gameState.board, piece, { row: r, col: c }, gameState.players, currentPlayer);
            console.log(`    ${piece.type} at (${r},${c}): ${moves.length} moves`);
          }
        }
      }
      break;
    }
    
    if (gameState.phase === 'finished') {
      console.log(`\n=== GAME OVER: ${gameState.winner} WINS! ===`);
      break;
    }
  }
  
  if (gameState.phase !== 'finished') {
    console.log('\nGame ended without winner after 50 turns');
  }
}

runDebugGame();
