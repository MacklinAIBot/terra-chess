// Game Info Component

import type { GameState, Piece, Position } from '../game/types';
import { PLAYER_COLOR_HEX, PIECE_SYMBOLS } from '../game/types';
import './GameInfo.css';

interface PlayerType {
  color: string;
  isAI: boolean;
}

interface GameInfoProps {
  gameState: GameState;
  onNewGame: (numPlayers: number) => void;
  selectedPiece: Piece | null;
  selectedPosition: Position | null;
  playerTypes: PlayerType[];
  onToggleAI: (color: string) => void;
  isAITurn?: boolean;
}

const PIECE_DESCRIPTIONS: Record<string, string> = {
  king: 'Moves 2 squares any direction. Limited to 1 when in check or attacking. Cannot move through or into attacked squares.',
  queen: 'Moves up to 8 squares in any direction (horizontal, vertical, or diagonal).',
  rook: 'Moves up to 8 squares horizontally or vertically.',
  bishop: 'Moves up to 8 squares diagonally.',
  knight: 'Moves in L-shapes: 1×2, 2×1, 2×4, or 4×2 squares. Can jump over pieces.',
  pawn: 'Moves 2 spaces any direction (forward, backward, sideways). 4 spaces on first move. Captures diagonally 1 space.',
};

function colToLetter(col: number): string {
  if (col < 26) {
    return String.fromCharCode(65 + col);
  } else {
    const letterIndex = col - 26;
    const letter = String.fromCharCode(65 + letterIndex);
    return letter + letter;
  }
}

export function GameInfo({ gameState, onNewGame, selectedPiece, selectedPosition, playerTypes, onToggleAI, isAITurn }: GameInfoProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentPlayerType = playerTypes.find(p => p.color === currentPlayer?.color);
  const isThinking = isAITurn && currentPlayerType?.isAI;
  
  const positionNotation = selectedPosition 
    ? `${colToLetter(selectedPosition.col)}${gameState.board.length - selectedPosition.row}`
    : null;
  
  return (
    <div className="game-info">
      <h1 className="game-title">Empire Chess</h1>
      
      <div className="selection-card">
        {selectedPiece ? (
          <>
            <div className="selection-header">
              <span 
                className="selection-piece"
                style={{ color: PLAYER_COLOR_HEX[selectedPiece.player] }}
              >
                {PIECE_SYMBOLS[selectedPiece.type]}
              </span>
              <span className="selection-name">
                {selectedPiece.type.charAt(0).toUpperCase() + selectedPiece.type.slice(1)}
              </span>
              <span 
                className="selection-player"
                style={{ color: PLAYER_COLOR_HEX[selectedPiece.player] }}
              >
                ({selectedPiece.player})
              </span>
            </div>
            <div className="selection-position">
              Position: {positionNotation}
            </div>
            <div className="selection-description">
              {PIECE_DESCRIPTIONS[selectedPiece.type]}
            </div>
          </>
        ) : (
          <div className="selection-placeholder">
            Select a piece to see details
          </div>
        )}
      </div>
      
      {gameState.phase === 'finished' && gameState.winner && (
        <div className="winner-banner">
          🎉 {gameState.winner.toUpperCase()} Wins! 🎉
        </div>
      )}
      
      <div className="turn-indicator">
        <span 
          className="player-dot"
          style={{ backgroundColor: PLAYER_COLOR_HEX[currentPlayer.color] }}
        />
        <span className="turn-text">
          {gameState.phase === 'finished' 
            ? 'Game Over' 
            : `${currentPlayer.color.charAt(0).toUpperCase() + currentPlayer.color.slice(1)}'s Turn`
          }
        </span>
        {isThinking && <span className="thinking-indicator">🤔</span>}
        {currentPlayer.inCheck && gameState.phase !== 'finished' && (
          <span className="check-warning">⚠️ CHECK!</span>
        )}
      </div>
      
      <div className="players-list">
        <h3>Players</h3>
        {gameState.players.map((player) => {
          const playerType = playerTypes.find(p => p.color === player.color);
          return (
            <div 
              key={player.color} 
              className={`player-item ${!player.alive ? 'eliminated' : ''} ${player.color === currentPlayer.color && gameState.phase !== 'finished' ? 'active' : ''}`}
            >
              <span 
                className="player-dot"
                style={{ backgroundColor: PLAYER_COLOR_HEX[player.color] }}
              />
              <span className="player-name">
                {player.color.charAt(0).toUpperCase() + player.color.slice(1)}
              </span>
              <button 
                className={`ai-toggle ${playerType?.isAI ? 'ai-on' : ''}`}
                onClick={() => onToggleAI(player.color)}
                title={playerType?.isAI ? 'Click to make human' : 'Click to make AI'}
              >
                {playerType?.isAI ? '🤖' : '👤'}
              </button>
              {!player.alive && <span className="eliminated-text">(Eliminated)</span>}
            </div>
          );
        })}
      </div>
      
      <div className="game-controls">
        <label>New Game:</label>
        <div className="player-buttons">
          <button onClick={() => onNewGame(2)}>2 Players</button>
          <button onClick={() => onNewGame(4)}>4 Players</button>
        </div>
      </div>
      
      <div className="rules-info">
        <h4>Empire Chess Rules:</h4>
        <ul>
          <li>32×32 board (all modes)</li>
          <li>32 pieces per player</li>
          <li>Pieces move up to 8× normal distance</li>
          <li>King limited to 1 square when in check</li>
          <li>Pawns can move sideways</li>
          <li>Turn order: Clockwise</li>
          <li>Win: Capture all enemy kings</li>
        </ul>
      </div>
    </div>
  );
}
