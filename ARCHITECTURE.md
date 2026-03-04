# Empire Chess - Technical Architecture (Full Version)

## Overview

Multiplayer chess variant supporting 2-8 players on scaled boards (2x, 4x, 8x) with async turn-based gameplay as primary mode, realtime as optional.

---

## Stack Recommendation

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | React 18 + TypeScript + Vite | Your existing skills, great ecosystem |
| **Mobile** | React Native (shared code) | One codebase for web + mobile |
| **Backend API** | Spring Boot (Java) | Your learning path, enterprise-ready |
| **Database** | PostgreSQL | Better JSON support, reliable |
| **Real-time** | Socket.io (separate service) | Layered in later for blitz mode |
| **Caching** | Redis | Session data, live game state |
| **Auth** | JWT + Spring Security | Standard, well-documented |
| **Hosting** | Railway or Render | Good Spring Boot support |
| **CDN** | Cloudflare | Assets, DDoS protection |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │ Mobile (RN)  │  │   PWA        │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼───────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER (Cloudflare)                │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Spring Boot)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  /auth/*    │  │ /games/*    │  │ /users/*    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌───────┐  ┌──────────┐
│PostgreSQL│  │  Redis  │
│  (data) │  │ (cache) │
└───────┘  └──────────┘
```

---

## Database Schema (PostgreSQL)

### Users
```sql
users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  avatar_url TEXT,
  rating INT DEFAULT 1200,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Games
```sql
games (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  scale INT, -- 2, 4, or 8
  board_size INT, -- 16, 32, or 64
  max_players INT,
  status VARCHAR(20), -- WAITING, ACTIVE, FINISHED
  current_turn INT, -- player index (0-7)
  winner_id UUID REFERENCES users(id),
  turn_timeout_hours INT DEFAULT 72,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Game Players
```sql
game_players (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  user_id UUID REFERENCES users(id),
  player_index INT, -- 0-7 (position on board)
  color VARCHAR(20),
  is_eliminated BOOLEAN DEFAULT FALSE,
  eliminated_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW()
)
```

### Game Moves (for history & undo)
```sql
game_moves (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  player_index INT,
  piece_type VARCHAR(20),
  from_x INT,
  from_y INT,
  to_x INT,
  to_y INT,
  captured BOOLEAN,
  captured_piece JSONB,
  move_number INT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Board State (JSONB - flexible for variants)
```sql
-- Stored in games table as JSONB column
board_state JSONB
-- Example: { "pieces": [...], "terrain": [...], "captured": {...} }
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Get current user |

### Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | List available games |
| POST | `/api/games` | Create new game |
| GET | `/api/games/{id}` | Get game state |
| POST | `/api/games/{id}/join` | Join a game |
| POST | `/api/games/{id}/move` | Make a move |
| POST | `/api/games/{id}/resign` | Resign from game |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/{id}` | Get user profile |
| GET | `/api/users/{id}/games` | Get user's game history |
| GET | `/api/leaderboard` | Top players |

---

## Game Logic Module (TypeScript)

```
src/
├── game/
│   ├── types.ts          # Piece, Position, GameState types
│   ├── board.ts          # Board rendering, coordinates
│   ├── moves.ts          # Movement rules
│   ├── validation.ts     # Is move valid?
│   ├── check.ts          # Check/checkmate detection
│   └── winCondition.ts   # Win detection
```

### Core Types
```typescript
type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'cyan';

interface Piece {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  player: number; // 0-7
  hasMoved: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface GameState {
  board: (Piece | null)[][];
  currentPlayer: number;
  players: Player[];
  scale: number;
  terrain: TerrainCell[];
  moveHistory: Move[];
}
```

---

## Feature Roadmap

### Phase 1: MVP (Async, Basic)
- [x] 32×32 board (4x scale)
- [x] 2-4 players
- [x] Standard movement rules
- [x] Turn-based async
- [x] Basic auth
- [x] Game creation/joining

### Phase 2: Core Features
- [ ] 8 players
- [ ] 2x and 8x scale variants
- [ ] Player-customizable starting positions
- [ ] Pawn lateral movement
- [ ] King check constraint (1-space when in check)
- [ ] Game chat
- [ ] Move history / replay
- [ ] Time controls (72hr turn limit)

### Phase 3: Polish
- [ ] Leaderboards
- [ ] User profiles & avatars
- [ ] Rating system (ELO)
- [ ] Game notifications (email/push)
- [ ] Analysis tools (review games)
- [ ] Spectator mode

### Phase 4: Real-time (Optional)
- [ ] Socket.io service for blitz mode
- [ ] 1v1 ranked matchmaking
- [ ] Live spectating
- [ ] Tournament support

### Phase 5: Advanced
- [ ] Terrain (mountains, water, forests)
- [ ] Special pieces (Prince, Wizard)
- [ ] Team mode (2v2, 4v4)
- [ ] Full-range movement variant
- [ ] AI opponent

---

## Scalability Considerations

### Read Replicas
- Game state reads hit replicas
- Writes go to primary

### Caching (Redis)
- Active game states cached
- User sessions
- Leaderboard data

### Horizontal Scaling
- Stateless API servers
- Game state in PostgreSQL (not memory)
- Socket.io can scale with Redis adapter

### CDN
- Static assets (images, sprites)
- Future: game replay videos

---

## Deployment

### Development
```
localhost:3000  (React dev)
localhost:8080  (Spring Boot)
localhost:6379  (Redis)
```

### Production (Railway/Render)
```
api.empirechess.com   → Spring Boot
empirechess.com       → React (CDN)
ws.empirechess.com    → Socket.io (Phase 4)
```

---

## Next Steps

1. **Deploy MVP** — Get current demo live first
2. **Set up backend** — Spring Boot + PostgreSQL skeleton
3. **Connect API** — Frontend calls backend
4. **Add auth** — Users, logins
5. **Add features** — Phase 2+ list above
