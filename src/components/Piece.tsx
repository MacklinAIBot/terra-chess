// Piece Component - Traditional chess pieces

import type { Piece as PieceType } from '../game/types';
import { PLAYER_COLOR_HEX } from '../game/types';
import './Piece.css';

interface PieceProps {
  piece: PieceType;
  size: number;
}

// Traditional chess piece SVG paths
const PIECE_SVGS: Record<string, string> = {
  // King - cross on top with 3 ridges
  king: "M50 5 L55 15 L60 10 L65 20 L58 25 L62 30 L55 35 L55 45 L75 50 L75 60 L55 65 L55 75 L70 85 L30 85 L45 75 L45 65 L25 60 L25 50 L45 45 L45 35 L38 30 L42 25 L35 20 L40 10 L45 15 Z",
  
  // Queen - crown with 5 peaks and flared base
  queen: "M50 5 L55 15 L58 12 L62 20 L65 15 L68 25 L75 30 L65 40 L70 50 L55 45 L55 35 L45 35 L45 45 L30 50 L35 40 L25 30 L32 25 L35 15 L38 20 L42 12 L45 15 Z M25 55 L75 55 L80 85 L20 85 Z",
  
  // Rook - castle turret with crenellations
  rook: "M25 15 L75 15 L75 25 L65 25 L65 20 L60 20 L60 25 L55 25 L55 20 L50 20 L50 25 L45 25 L45 20 L40 20 L40 25 L35 25 L35 20 L30 20 L30 25 L25 25 Z M25 30 L75 30 L75 40 L25 40 Z M20 45 L80 45 L80 85 L20 85 Z",
  
  // Bishop - mitre with slit
  bishop: "M50 5 L60 20 L55 20 L55 30 L65 35 L60 45 L70 55 L60 65 L65 75 L55 80 L55 90 L45 90 L45 80 L35 75 L40 65 L30 55 L40 45 L45 35 L55 30 L55 20 L40 20 Z M48 55 L52 55 L52 70 L48 70 Z",
  
  // Knight - horse head profile
  knight: "M20 20 L55 15 L65 25 L60 35 L70 40 L70 50 L75 55 L75 65 L60 65 L55 75 L45 85 L35 85 L40 70 L30 65 L30 55 L25 50 L35 40 L30 30 L20 30 Z",
  
  // Pawn - simple round shape
  pawn: "M50 10 L58 20 L62 18 L65 25 L70 30 L60 40 L65 50 L55 55 L55 80 L45 80 L45 55 L35 50 L40 40 L30 30 L35 25 L38 18 L42 20 Z",
};

export function Piece({ piece, size }: PieceProps) {
  const color = PLAYER_COLOR_HEX[piece.player];
  const path = PIECE_SVGS[piece.type];
  
  return (
    <div 
      className="piece-colored"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          width: '80%',
          height: '80%',
          fill: color,
          stroke: color,
          strokeWidth: 1,
          filter: `drop-shadow(0 2px 3px rgba(0,0,0,0.4))`,
        }}
      >
        <path d={path} />
      </svg>
    </div>
  );
}
