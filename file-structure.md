# FanCurva — Project File Structure
Last updated: June 2026

## Monorepo Overview

```
fancurva/
│
├── apps/
│   ├── web/                          # Vite + React + TypeScript (frontend)
│   │   ├── public/
│   │   │   ├── favicon.svg
│   │   │   └── icons.svg
│   │   ├── src/
│   │   │   ├── main.tsx              # Entry point, PrivyProvider wrapper
│   │   │   ├── App.tsx               # Router, auth sync, protected routes
│   │   │   ├── pages/
│   │   │   │   ├── Landing.tsx       # Public home page
│   │   │   │   ├── Login.tsx         # Privy login, referral code capture
│   │   │   │   ├── Onboarding.tsx    # Display name + team pick + passport mint
│   │   │   │   ├── Dashboard.tsx     # Quest feed, points, status tier
│   │   │   │   ├── Passport.tsx      # Passport card, badges, referral link
│   │   │   │   ├── Leaderboard.tsx   # Overall and team leaderboards
│   │   │   │   └── Quests.tsx        # All quests list
│   │   │   ├── lib/
│   │   │   │   └── api.ts            # Axios client + all API calls
│   │   │   └── store/
│   │   │       └── userStore.ts      # Zustand global user state
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.node.json
│   │   ├── eslint.config.js
│   │   └── .env                      # VITE_PRIVY_APP_ID, VITE_API_URL
│   │
│   ├── api/                          # Hono backend (Node.js)
│   │   ├── src/
│   │   │   ├── index.ts              # App entry, middleware, route registration
│   │   │   ├── routes/
│   │   │   │   ├── users.ts          # GET /users/me, POST /users, PATCH /users/me
│   │   │   │   ├── passports.ts      # GET /passports/:id, POST /passports/mint
│   │   │   │   ├── quests.ts         # GET /quests, POST /quests/:id/complete
│   │   │   │   ├── badges.ts         # GET /badges, GET /badges/holdings
│   │   │   │   ├── leaderboard.ts    # GET /leaderboard, GET /leaderboard/rank
│   │   │   │   ├── points.ts         # GET /points/:id, POST /points/award
│   │   │   │   ├── watchParties.ts   # GET/POST /watch-parties, POST checkin
│   │   │   │   └── referrals.ts      # GET link/stats, POST convert/milestone
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts           # requireAuth, softAuth (Privy JWT verify)
│   │   │   └── lib/
│   │   │       ├── db.ts             # pg Pool connection
│   │   │       └── redis.ts          # Redis client + leaderboard helpers
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env
│   │
│   └── workers/                      # BullMQ workers (separate Railway service)
│       ├── src/
│       │   ├── index.ts              # Worker entry point
│       │   └── workers/
│       │       ├── passport.worker.ts   # Thirdweb passport NFT minting
│       │       ├── badge.worker.ts      # Thirdweb badge NFT minting
│       │       └── notification.worker.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── Dockerfile
│
├── packages/
│   ├── db/
│   │   ├── migrations/
│   │   │   ├── 001_users.sql
│   │   │   ├── 002_passports.sql
│   │   │   ├── 003_quests.sql
│   │   │   ├── 004_completions.sql
│   │   │   ├── 005_badges.sql
│   │   │   ├── 006_points.sql
│   │   │   ├── 007_watch_parties.sql
│   │   │   ├── 008_referrals.sql
│   │   │   └── 009_jobs.sql
│   │   └── types/
│   │       └── index.ts
│   ├── contracts/
│   │   ├── src/
│   │   │   ├── FanCurvaPassport.sol  # ERC-721 soulbound passport
│   │   │   └── FanCurvaBadge.sol     # ERC-1155 soulbound + transferable
│   │   ├── scripts/deploy.ts
│   │   ├── test/
│   │   └── hardhat.config.ts
│   ├── shared/
│   │   └── src/
│   │       └── index.ts              # Shared types, STATUS_TIERS, POINT_VALUES
│   └── config/
│       └── src/
│           ├── teams.ts              # 48 World Cup teams
│           ├── matches.ts            # Tournament schedule
│           └── badges.ts             # Badge definitions
│
├── scripts/
│   └── generate.js                   # File generator (avoids Git Bash heredoc issues)
├── docker-compose.yml                # Local Postgres + Redis
├── turbo.json
├── package.json                      # npm workspaces root
└── .gitignore
```

## Key Decisions

- npm workspaces (not pnpm) — Windows Git Bash compatibility
- Hono (not Express/NestJS) — 78,200 req/s, zero cold start, critical for match-day spikes
- node -e and scripts/generate.js for file writing — Git Bash heredoc issues on Windows
- Postgres via Docker locally, Supabase in production
- Redis via Docker locally, Upstash in production
- Privy for auth — email login creates embedded wallet silently, no crypto friction
- Thirdweb for NFT minting — handles ERC-721 and ERC-1155, gasless transactions
- Base L2 for blockchain — low gas, fast finality, EVM compatible

## Environment Files

Each app has its own .env file. Never commit .env files — they are in .gitignore.

Web: apps/web/.env
API: apps/api/.env
Workers: apps/workers/.env
