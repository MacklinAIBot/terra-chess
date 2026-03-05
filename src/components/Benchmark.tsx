// Benchmark Component - AI Parameter Testing

import { useState } from 'react';
import { initializeGame, nextTurn, checkForCheck, checkWinCondition } from '../game/gameLogic';
import { getAIMove } from '../game/ai';
import { STRATEGIES, STRATEGY_KEYS, type AIStrategy } from '../game/strategy';
import './Benchmark.css';

interface BenchmarkParams {
  numPlayers: number;
  numGames: number;
  maxMoves: number;
}

interface PlayerStrategy {
  color: string;
  strategy: string;
}

interface GameMetrics {
  winner: string | null;
  moves: number;
  captures: Record<string, number>;
  checks: Record<string, number>;
}

interface BenchmarkResult {
  wins: Record<string, number>;
  avgMoves: number;
  avgCaptures: Record<string, number>;
  avgChecks: Record<string, number>;
  totalGames: number;
}

export function Benchmark() {
  const [params, setParams] = useState<BenchmarkParams>({
    numPlayers: 4,
    numGames: 10,
    maxMoves: 2000,
  });
  
  const [playerStrategies, setPlayerStrategies] = useState<PlayerStrategy[]>([
    { color: 'blue', strategy: 'balanced' },
    { color: 'red', strategy: 'aggressive' },
    { color: 'green', strategy: 'defensive' },
    { color: 'yellow', strategy: 'material' },
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [progress, setProgress] = useState(0);
  
  const getStrategyForColor = (color: string): AIStrategy => {
    const ps = playerStrategies.find(p => p.color === color);
    if (ps) {
      return STRATEGIES[ps.strategy] || STRATEGIES.balanced;
    }
    return STRATEGIES.balanced;
  };
  
  const runGame = (): GameMetrics => {
    let gs = initializeGame(params.numPlayers);
    let moves = 0;
    
    // Track metrics per player
    const captures: Record<string, number> = { blue: 0, red: 0, green: 0, yellow: 0 };
    const checks: Record<string, number> = { blue: 0, red: 0, green: 0, yellow: 0 };
    
    while (gs.phase !== 'finished' && moves < params.maxMoves) {
      const player = gs.players[gs.currentPlayerIndex];
      
      if (!player.alive) {
        gs.currentPlayerIndex = nextTurn(gs.players, gs.currentPlayerIndex);
        continue;
      }
      
      // Track checks
      if (player.inCheck) {
        checks[player.color]++;
      }
      
      const strategy = getStrategyForColor(player.color);
      const aiMove = getAIMove(gs, strategy);
      if (!aiMove) break;
      
      // Make move
      const newBoard = gs.board.map(row => row.map(cell => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));
      const currentPlayer = gs.players[gs.currentPlayerIndex];
      const selectedPiece = newBoard[aiMove.from.row][aiMove.from.col].piece;
      const clickedCell = newBoard[aiMove.to.row][aiMove.to.col].piece;
      
      // Track captures
      if (clickedCell) {
        captures[currentPlayer.color]++;
      }
      
      if (clickedCell?.type === 'king') {
        const capturedPlayerIndex = gs.players.findIndex(p => p.color === clickedCell.player);
        if (capturedPlayerIndex !== -1) {
          gs.players[capturedPlayerIndex].alive = false;
        }
      }
      
      newBoard[aiMove.to.row][aiMove.to.col].piece = selectedPiece;
      newBoard[aiMove.from.row][aiMove.from.col].piece = null;
      if (selectedPiece) selectedPiece.hasMoved = true;
      
      const nextPlayerIndex = nextTurn(gs.players, gs.currentPlayerIndex);
      const updatedPlayers = gs.players.map((p, idx) => ({
        ...p,
        inCheck: idx === nextPlayerIndex ? checkForCheck(newBoard, p.color, gs.players) : p.inCheck,
      }));
      
      const winner = checkWinCondition(updatedPlayers);
      
      gs = {
        ...gs,
        board: newBoard,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        phase: winner ? 'finished' : 'playing',
        winner,
      };
      moves++;
    }
    
    return { winner: gs.winner, moves, captures, checks };
  };
  
  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    setProgress(0);
    
    const wins: Record<string, number> = { blue: 0, red: 0, green: 0, yellow: 0, draws: 0 };
    const totalCaptures: Record<string, number> = { blue: 0, red: 0, green: 0, yellow: 0 };
    const totalChecks: Record<string, number> = { blue: 0, red: 0, green: 0, yellow: 0 };
    let totalMoves = 0;
    
    for (let i = 0; i < params.numGames; i++) {
      const { winner, moves, captures, checks } = runGame();
      totalMoves += moves;
      
      // Add captures and checks to totals
      for (const color of ['blue', 'red', 'green', 'yellow']) {
        totalCaptures[color] += captures[color];
        totalChecks[color] += checks[color];
      }
      
      // Track wins
      if (winner) {
        wins[winner] = (wins[winner] || 0) + 1;
      } else {
        wins.draws = (wins.draws || 0) + 1;
      }
      
      setProgress(Math.round(((i + 1) / params.numGames) * 100));
      await new Promise(r => setTimeout(r, 10));
    }
    
    // Calculate averages
    const avgCaptures: Record<string, number> = {};
    const avgChecks: Record<string, number> = {};
    for (const color of ['blue', 'red', 'green', 'yellow']) {
      avgCaptures[color] = Math.round((totalCaptures[color] / params.numGames) * 10) / 10;
      avgChecks[color] = Math.round((totalChecks[color] / params.numGames) * 10) / 10;
    }
    
    setResult({
      wins,
      avgMoves: Math.round(totalMoves / params.numGames),
      avgCaptures,
      avgChecks,
      totalGames: params.numGames,
    });
    setIsRunning(false);
  };
  
  const handleStrategyChange = (color: string, strategy: string) => {
    setPlayerStrategies(prev => 
      prev.map(p => p.color === color ? { ...p, strategy } : p)
    );
  };
  
  const resultColors = ['blue', 'red', 'green', 'yellow'];
  
  return (
    <div className="benchmark-page">
      <div className="benchmark-container">
        <h2>🧪 AI Benchmark</h2>
        <p className="benchmark-desc">
          Test different AI strategies against each other.
        </p>
        
        <div className="params-section">
          <h3>Game Settings</h3>
          
          <div className="param-row">
            <label>Players:</label>
            <select 
              value={params.numPlayers}
              onChange={(e) => setParams({...params, numPlayers: Number(e.target.value)})}
              disabled={isRunning}
            >
              <option value={2}>2 Players</option>
              <option value={4}>4 Players</option>
            </select>
          </div>
          
          <div className="param-row">
            <label>Games per run:</label>
            <input 
              type="number" 
              value={params.numGames}
              onChange={(e) => setParams({...params, numGames: Number(e.target.value)})}
              disabled={isRunning}
              min={1}
              max={100}
            />
          </div>
          
          <div className="param-row">
            <label>Max Moves/Game:</label>
            <input 
              type="number" 
              value={params.maxMoves}
              onChange={(e) => setParams({...params, maxMoves: Number(e.target.value)})}
              disabled={isRunning}
              min={100}
              max={10000}
              step={100}
            />
          </div>
        </div>
        
        <div className="params-section">
          <h3>Player Strategies</h3>
          
          {playerStrategies.slice(0, params.numPlayers).map(ps => (
            <div key={ps.color} className="param-row">
              <label style={{ textTransform: 'capitalize' }}>{ps.color}:</label>
              <select 
                value={ps.strategy}
                onChange={(e) => handleStrategyChange(ps.color, e.target.value)}
                disabled={isRunning}
              >
                {STRATEGY_KEYS.map(key => (
                  <option key={key} value={key}>{STRATEGIES[key].name}</option>
                ))}
              </select>
            </div>
          ))}
          
          <div className="strategy-desc">
            {playerStrategies.slice(0, params.numPlayers).map(ps => (
              <div key={ps.color} className={`strategy-desc-item ${ps.color}`}>
                <strong>{ps.color}:</strong> {STRATEGIES[ps.strategy].description}
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="run-button"
          onClick={handleRun}
          disabled={isRunning}
        >
          {isRunning ? `Running... ${progress}%` : '▶ Run Benchmark'}
        </button>
        
        {result && (
          <div className="results-section">
            <h3>Results</h3>
            
            <div className="results-grid">
              {resultColors.slice(0, params.numPlayers).map(color => (
                <div key={color} className={`result-card ${color}`}>
                  <div className="result-header">
                    <span className="result-title">{color}</span>
                    <span className="result-strategy">{playerStrategies.find(p => p.color === color)?.strategy}</span>
                  </div>
                  <div className="result-stats">
                    <div className="stat-row">
                      <span>Wins:</span>
                      <span className="stat-value">{result.wins[color] || 0}</span>
                    </div>
                    <div className="stat-row">
                      <span>Avg Captures:</span>
                      <span className="stat-value">{result.avgCaptures[color]}</span>
                    </div>
                    <div className="stat-row">
                      <span>Avg Checks:</span>
                      <span className="stat-value">{result.avgChecks[color]}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="result-card draws">
                <div className="result-header">
                  <span className="result-title">Draws</span>
                </div>
                <div className="result-stats">
                  <div className="stat-row">
                    <span>Total:</span>
                    <span className="stat-value">{result.wins.draws || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="result-summary">
              <div>Avg moves per game: <strong>{result.avgMoves}</strong></div>
              <div>Total games: <strong>{result.totalGames}</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
