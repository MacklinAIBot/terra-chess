// Benchmark script - Run multiple Empire Chess games headlessly
// Usage: npx ts-node scripts/benchmark.ts

import { initializeGame, getValidMoves, nextTurn, checkForCheck, checkWinCondition } from '../src/game/gameLogic';
import { getAIMove } from '../src/game/ai';
import type { GameState, Position, Player } from '../src/game/types';

interface GameResult {
  winner: string | null;
  moves: number;
  turns: number;
}

// Make a move on the board
function makeMove(gameState: GameState, from: Position, to: Position): GameState {
  const newBoard = gameState.board.map(row => row.map(cell => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const selectedPiece = newBoard[from.row][from.col].piece;
  const clickedCell = newBoard[to.row][to.col].piece;
  
  // Capture
  if (clickedCell) {
    currentPlayer.capturedPieces.push(clickedCell);
    if (clickedCell.type === 'king') {
      const capturedPlayerIndex = gameState.players.findIndex(p => p.color === clickedCell.player);
      if (capturedPlayerIndex !== -1) {
        gameState.players[capturedPlayerIndex].alive = false;
      }
    }
  }
  
  // Move piece
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

// Run a single game with current AI
function runGame(): GameResult {
  let gameState = initializeGame(4);
  let moves = 0;
  let turns = 0;
  const maxMoves = 5000; // Games can be very long!
  
  while (gameState.phase !== 'finished' && moves < maxMoves) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Skip eliminated players
    if (!currentPlayer.alive) {
      gameState = { ...gameState, currentPlayerIndex: nextTurn(gameState.players, gameState.currentPlayerIndex) };
      continue;
    }
    
    // AI makes a move
    const aiMove = getAIMove(gameState);
    if (aiMove) {
      gameState = makeMove(gameState, aiMove.from, aiMove.to);
      moves++;
    }
    
    turns++;
  }
  
  return {
    winner: gameState.winner,
    moves,
    turns,
  };
}

// Run benchmark
function runBenchmark(numGames: number = 20) {
  console.log(`Running ${numGames} Empire Chess games (4 players, 5000 move limit)...\n`);
  
  const results: GameResult[] = [];
  const winsByColor: Record<string, number> = { blue: 0, red: 0, green: 0, yellow: 0 };
  const totalMoves: number[] = [];
  const totalTurns: number[] = [];
  
  for (let i = 0; i < numGames; i++) {
    const result = runGame();
    results.push(result);
    
    if (result.winner) {
      winsByColor[result.winner]++;
    }
    totalMoves.push(result.moves);
    totalTurns.push(result.turns);
    
    console.log(`Game ${i + 1}: ${result.winner || 'draw'} in ${result.turns} turns`);
  }
  
  // Calculate statistics
  const avgMoves = totalMoves.reduce((a, b) => a + b, 0) / numGames;
  const avgTurns = totalTurns.reduce((a, b) => a + b, 0) / numGames;
  const wins = Object.values(winsByColor).reduce((a, b) => a + b, 0);
  
  console.log('\n=== RESULTS ===\n');
  console.log('Win counts by color:');
  for (const [color, count] of Object.entries(winsByColor)) {
    const pct = wins > 0 ? ((count / wins) * 100).toFixed(1) : '0.0';
    console.log(`  ${color}: ${count} wins (${pct}%)`);
  }
  console.log(`\nTotal wins: ${wins}`);
  console.log(`Draws/Max moves: ${numGames - wins}`);
  console.log(`\nAverage moves per game: ${avgMoves.toFixed(1)}`);
  console.log(`Average turns per game: ${avgTurns.toFixed(1)}`);
}

// Run with default 20 games
runBenchmark(20);
