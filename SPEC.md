# Empire Chess - Project Specification

## Overview

- **Project Name:** Empire Chess
- **Type:** Multiplayer chess variant web/mobile game
- **Core Functionality:** Scalable chess variant supporting 2-8 players on expanded boards (2x, 4x, 8x) with async turn-based gameplay
- **Target Users:** Chess enthusiasts, strategy game players, casual gamers

---

## Game Rules

### Scale Variants

| Variant | Board Size | Pieces per Player | Max Movement |
|---------|------------|-------------------|--------------|
| 2x | 16×16 | 32 | 2x |
| 4x | 32×32 | 64 | 4x |
| 8x | 64×64 | 128 | 8x |

### Players
- 2-8 players
- Starting positions: evenly spaced along edges
- Player colors: red, blue, green, yellow, purple, orange, pink, cyan

### Pieces (4x scale shown, scales proportionally)
- 4 Kings (player designates main king)
- 4 Queens
- 8 Rooks
- 8 Bishops
- 8 Knights
- 32 Pawns

### Movement Rules
- **Standard mode:** Pieces move up to N× normal distance (N = scale)
- **King in check:** Limited to 1 square only
- **Pawns:** Move forward, forward-diagonal (capture), and sideways
- **Turn order:** Clockwise
- **Starting setup:** Standard or player choice (variant)

### Winning Condition
- **Last player/team standing** — eliminate all opponent kings
- Capture of main king = player elimination
- Game ends when 1 player remains

---

## Tech Stack

### Current (MVP)
| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Deployment | Vercel |
| Repository | GitHub |

### Full Version
| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | React 18 + TypeScript + Vite | Your skills, great ecosystem |
| Mobile | React Native | Shared code for mobile |
| Backend API | Spring Boot (Java) | Your learning path |
| Database | PostgreSQL | JSONB flexibility, reliable |
| Real-time | Socket.io | Later, for blitz mode |
| Caching | Redis | Sessions, live game state |
| Auth | JWT + Spring Security | Standard, secure |
| Hosting | Railway or Render | Good Spring Boot support |
| CDN | Cloudflare | Assets, DDoS protection |

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
  board_state JSONB,
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
  player_index INT,
  color VARCHAR(20),
  is_eliminated BOOLEAN DEFAULT FALSE,
  eliminated_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW()
)
```

### Game Moves
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
| GET | `/api/users/{id}/games` | Game history |
| GET | `/api/leaderboard` | Top players |

---

## UI/UX Requirements

### Layout
- Responsive (desktop + mobile)
- Scrollable/zoomable board (especially for 8x)
- Player panels showing pieces/captured
- Turn indicator with countdown

### Interactions
- Click to select piece
- Click valid cell to move
- Highlight legal moves
- Show capture animations

### Visual Style
- Clean, modern aesthetic
- Distinct player colors
- Clear piece differentiation (Unicode or SVG)
- Smooth transitions

---

## Feature Roadmap

### Phase 1: MVP ✅ (Current)
- [x] 32×32 board (4x scale)
- [x] 2-4 players
- [x] Standard movement rules
- [x] Turn-based async
- [x] Click-to-select/move

### Phase 2: Core Features
- [ ] 8-player support
- [ ] 2x and 8x scale variants
- [ ] Player-customizable starting positions
- [ ] Turn timeout (72hr default)
- [ ] Game chat
- [ ] Move history & replay

### Phase 3: Polish
- [ ] User authentication
- [ ] Leaderboards
- [ ] Rating system (ELO)
- [ ] User profiles & avatars
- [ ] Game notifications
- [ ] Spectator mode

### Phase 4: Real-time (Optional)
- [ ] Socket.io for blitz mode
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

## Acceptance Criteria (MVP)

1. ✅ 32×32 board renders correctly
2. ✅ 2-4 players selectable at start
3. ✅ Pieces display with distinct colors
4. ✅ Click-to-select and click-to-move works
5. ✅ Movement rules apply (4x range, king in check constraint)
6. ✅ Turn rotates clockwise
7. ✅ Capture works
8. ✅ Win condition triggers
9. ✅ Responsive on mobile
10. ✅ Deployed on Vercel

---

## Project Structure

```
empire-chess/
├── src/
│   ├── components/
│   │   ├── Board.tsx
│   │   ├── Cell.tsx
│   │   ├── Piece.tsx
│   │   ├── GameInfo.tsx
│   │   └── ...
│   ├── game/
│   │   ├── types.ts
│   │   ├── board.ts
│   │   ├── moves.ts
│   │   ├── validation.ts
│   │   └── check.ts
│   ├── App.tsx
│   └── ...
├── SPEC.md
├── ARCHITECTURE.md
└── package.json
```
