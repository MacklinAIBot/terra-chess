// Piece Component - Colored chess pieces

import type { Piece as PieceType } from '../game/types';
import { PLAYER_COLOR_HEX } from '../game/types';
import './Piece.css';

interface PieceProps {
  piece: PieceType;
  size: number;
}

// SVG paths for chess pieces
const PIECE_SVGS: Record<string, { path: string; viewBox: string }> = {
  king: {
    viewBox: "0 0 100 100",
    path: "M50 10 L55 25 L45 25 L50 10 M50 28 L60 40 L40 40 L50 28 M35 45 L65 45 L65 55 L35 55 L35 45 M40 58 L60 58 L60 65 L40 65 L40 58 M30 68 L70 68 L70 85 L30 85 L30 68"
  },
  queen: {
    viewBox: "0 0 100 100",
    path: "M50 5 L55 20 L45 20 L50 5 M50 22 L58 35 L42 35 L50 22 M50 38 L60 45 L40 45 L50 38 M40 48 L60 48 L60 55 L40 55 L40 48 M35 58 L65 58 L65 68 L35 68 L35 58 M30 70 L70 70 L70 85 L30 85 L30 70"
  },
  rook: {
    viewBox: "0 0 100 100",
    path: "M25 15 L75 15 L75 30 L25 30 L25 15 M20 32 L80 32 L80 45 L20 45 L20 32 M25 48 L75 48 L75 85 L25 85 L25 48"
  },
  bishop: {
    viewBox: "0 0 100 100",
    path: "M50 8 L58 25 L42 25 L50 8 M50 28 L55 38 L45 38 L50 28 M48 40 L52 40 L52 48 L48 48 L48 40 M45 50 L55 50 L55 60 L45 60 L45 50 M40 62 L60 62 L60 68 L40 68 L40 62 M35 70 L65 70 L65 85 L35 85 L35 70"
  },
  knight: {
    viewBox: "0 0 100 100",
    path: "M25 15 L55 15 L65 35 L50 40 L50 55 L70 70 L65 85 L35 85 L25 70 L35 55 L35 40 L20 35 L25 15"
  },
  pawn: {
    viewBox: "0 0 100 100",
    path: "M50 10 L58 25 L42 25 L50 10 M35 30 L65 30 L65 40 L35 40 L35 30 M30 42 L70 42 L70 55 L30 55 L30 42 M25 58 L75 58 L75 85 L25 85 L25 58"
  },
};

export function Piece({ piece, size }: PieceProps) {
  const color = PLAYER_COLOR_HEX[piece.player];
  const svgData = PIECE_SVGS[piece.type];
  
  return (
    <div 
      className="piece-colored"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        viewBox={svgData.viewBox}
        style={{
          width: '75%',
          height: '75%',
          fill: color,
          filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.5))`,
        }}
      >
        <path d={svgData.path} />
      </svg>
    </div>
  );
}
