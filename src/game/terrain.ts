// Terrain System for Empire Chess

export export type TerrainType = 'normal' | 'mountain' | 'water' | 'forest' | 'lava';

export interface TerrainCell {
  type: TerrainType;
}

// Terrain movement rules
export const TERRAIN_RULES = {
  normal: {
    canEnter: true,
    canTraverse: true,
    maxSpaces: 8, // Full movement range
    moveType: 'normal', // Can move through multiple normal spaces
  },
  mountain: {
    canEnter: true,
    canTraverse: true,
    maxSpaces: 1, // Can only move 1 space at a time in mountains
    moveType: 'king', // Like a king - one space at a time
  },
  water: {
    canEnter: true,
    canTraverse: true,
    maxSpaces: 4, // Max 4 spaces through water
    moveType: 'slow',
  },
  forest: {
    canEnter: true,
    canTraverse: true,
    maxSpaces: 2, // Max 2 spaces through forest
    moveType: 'slow',
  },
  lava: {
    canEnter: false, // Can't enter lava
    canTraverse: false, // Can't pass through lava (except knights jumping over)
    maxSpaces: 0,
    moveType: 'blocked',
  },
};

export export const TERRAIN_COLORS: Record<TerrainType, string> = {
  normal: '#2d2d44', // Default board color
  mountain: '#6b6b7a', // Gray
  water: '#5dade2', // Light blue
  forest: '#1e6b1e', // Dark green
  lava: '#e74c3c', // Orange/red
};

// Seeded random number generator (like Minecraft)
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  // Simple seeded random - returns 0-1
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
  
  // Returns random integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// Generate terrain for the board using seed
export function generateTerrain(boardSize: number, seed: number): TerrainCell[][] {
  const rng = new SeededRandom(seed);
  const terrain: TerrainCell[][] = [];
  
  // Initialize all as normal
  for (let row = 0; row < boardSize; row++) {
    terrain[row] = [];
    for (let col = 0; col < boardSize; col++) {
      terrain[row][col] = { type: 'normal' };
    }
  }
  
  // Generate terrain clusters
  // Use noise-like approach: each cell influenced by nearby "seed" points
  
  // Generate seed points for each terrain type
  const numSeeds = Math.floor(boardSize / 4); // ~8 seeds for 32x32
  
  const seeds: { x: number; y: number; type: TerrainType; strength: number }[] = [];
  
  // Mountain ranges (more numerous, longer)
  for (let i = 0; i < numSeeds * 2; i++) {
    seeds.push({
      x: rng.nextInt(0, boardSize - 1),
      y: rng.nextInt(0, boardSize - 1),
      type: 'mountain',
      strength: rng.next() * 0.5 + 0.5,
    });
  }
  
  // Lakes/oceans (moderate)
  for (let i = 0; i < numSeeds; i++) {
    seeds.push({
      x: rng.nextInt(0, boardSize - 1),
      y: rng.nextInt(0, boardSize - 1),
      type: 'water',
      strength: rng.next() * 0.5 + 0.4,
    });
  }
  
  // Forests (moderate number)
  for (let i = 0; i < numSeeds * 1.5; i++) {
    seeds.push({
      x: rng.nextInt(0, boardSize - 1),
      y: rng.nextInt(0, boardSize - 1),
      type: 'forest',
      strength: rng.next() * 0.5 + 0.45,
    });
  }
  
  // Lava pools (fewer, smaller)
  for (let i = 0; i < numSeeds * 0.5; i++) {
    seeds.push({
      x: rng.nextInt(0, boardSize - 1),
      y: rng.nextInt(0, boardSize - 1),
      type: 'lava',
      strength: rng.next() * 0.3 + 0.6, // Stronger but smaller
    });
  }
  
  // Apply terrain based on distance to seeds
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      let bestTerrain: TerrainType = 'normal';
      let bestScore = 0.3; // Threshold for normal terrain
      
      for (const seed of seeds) {
        const dist = Math.sqrt((row - seed.y) ** 2 + (col - seed.x) ** 2);
        const maxDist = boardSize / 3; // Influence radius
        const score = seed.strength * (1 - dist / maxDist);
        
        if (score > bestScore) {
          bestScore = score;
          bestTerrain = seed.type;
        }
      }
      
      terrain[row][col] = { type: bestTerrain };
    }
  }
  
  // Clear starting zones (where pieces start)
  // Blue top, Red bottom, Yellow left, Green right
  const startZone = 4;
  
  // Blue start (top rows)
  for (let row = 0; row < startZone; row++) {
    for (let col = 0; col < boardSize; col++) {
      terrain[row][col] = { type: 'normal' };
    }
  }
  
  // Red start (bottom rows)
  for (let row = boardSize - startZone; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      terrain[row][col] = { type: 'normal' };
    }
  }
  
  // Yellow start (left columns)
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < startZone; col++) {
      terrain[row][col] = { type: 'normal' };
    }
  }
  
  // Green start (right columns)
  for (let row = 0; row < boardSize; row++) {
    for (let col = boardSize - startZone; col < boardSize; col++) {
      terrain[row][col] = { type: 'normal' };
    }
  }
  
  return terrain;
}
