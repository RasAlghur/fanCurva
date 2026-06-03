## Architecture

With Vite in the mix, the separation is clean and honest:

| Layer | Tool | Why |
|---|---|---|
| **Frontend** | Vite + React + TypeScript | Fast dev, clean SPA, full separation from backend |
| **Backend API** | **Hono** on Node.js | Zero dependencies, ~14KB bundle, wakes up instantly — no cold start spikes during match-day traffic. Benchmarks at 78,200 req/s on a 4-core server — critical for the quest completion hot path |
| **Auth + Wallets** | Privy | Works natively with Vite — use `import.meta.env.VITE_PRIVY_APP_ID` for env vars |
| **NFT Minting** | Thirdweb SDK | ERC-721 passport, ERC-1155 badges, gasless |
| **Database** | Supabase | Postgres + realtime subscriptions |
| **Job Queue** | BullMQ + Redis | Exactly-once queue semantics, horizontal scaling — add more workers for parallel processing |
| **Leaderboard Cache** | Upstash Redis | Sorted sets, serverless-friendly |
| **Blockchain** | Base L2 | Low gas, fast finality |
| **Frontend deploy** | Vercel / Cloudflare Pages | Static SPA deploy |
| **Backend deploy** | Railway | API + workers as separate services |

---

## File Structure

```
fancurva/
│
├── apps/
│   │
│   ├── web/                          # Vite + React + TypeScript (frontend)
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   └── logo.svg
│   │   ├── src/
│   │   │   ├── main.tsx              # Entry point
│   │   │   ├── App.tsx               # Root, PrivyProvider wrapper, router
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── Landing.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Onboarding.tsx    # Team pick + passport mint
│   │   │   │   ├── Dashboard.tsx     # Quest feed, points, status tier
│   │   │   │   ├── Passport.tsx      # User passport + badge collection
│   │   │   │   ├── Leaderboard.tsx
│   │   │   │   ├── Quests.tsx
│   │   │   │   ├── QuestDetail.tsx
│   │   │   │   ├── WatchParties.tsx
│   │   │   │   ├── WatchPartyDetail.tsx
│   │   │   │   └── Rewards.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Shadcn/ui base components
│   │   │   │   ├── passport/
│   │   │   │   │   ├── PassportCard.tsx
│   │   │   │   │   ├── BadgeGrid.tsx
│   │   │   │   │   └── StatusBadge.tsx
│   │   │   │   ├── quests/
│   │   │   │   │   ├── QuestCard.tsx
│   │   │   │   │   ├── QuestFeed.tsx
│   │   │   │   │   └── QuestTimer.tsx    # Countdown to expiry
│   │   │   │   ├── leaderboard/
│   │   │   │   │   └── LeaderboardTable.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── TeamPicker.tsx
│   │   │   │       ├── MatchCountdown.tsx
│   │   │   │       └── ProtectedRoute.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── usePassport.ts
│   │   │   │   ├── useQuests.ts
│   │   │   │   ├── useLeaderboard.ts
│   │   │   │   ├── useBadges.ts
│   │   │   │   └── useWatchParties.ts
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── privy.ts          # PrivyProvider config
│   │   │   │   ├── thirdweb.ts       # Thirdweb client init
│   │   │   │   ├── api.ts            # Typed fetch wrapper → backend
│   │   │   │   └── utils.ts
│   │   │   │
│   │   │   ├── store/                # Zustand global state
│   │   │   │   ├── userStore.ts
│   │   │   │   └── questStore.ts
│   │   │   │
│   │   │   └── types/
│   │   │       └── index.ts          # Shared frontend types
│   │   │
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   ├── api/                          # Hono backend (Node.js)
│   │   ├── src/
│   │   │   ├── index.ts              # Hono app entry, route registration
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts           # Privy token verify, user sync
│   │   │   │   ├── passports.ts      # Mint, get passport
│   │   │   │   ├── quests.ts         # List, complete (HOT PATH)
│   │   │   │   ├── badges.ts         # List, holdings
│   │   │   │   ├── leaderboard.ts    # Read from Redis sorted sets
│   │   │   │   ├── points.ts         # Award points
│   │   │   │   ├── watchParties.ts   # Create, list, check-in
│   │   │   │   ├── referrals.ts      # Link, convert
│   │   │   │   ├── jobs.ts           # Poll async job status
│   │   │   │   └── webhooks.ts       # Outbound webhook dispatcher
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           # Verify Privy JWT on every request
│   │   │   │   ├── rateLimit.ts      # Per-route rate limiting via Redis
│   │   │   │   └── idempotency.ts    # Idempotency-Key dedup
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── passport.service.ts
│   │   │   │   ├── quest.service.ts      # Eligibility, completion logic
│   │   │   │   ├── badge.service.ts
│   │   │   │   ├── points.service.ts     # Award + leaderboard update
│   │   │   │   ├── leaderboard.service.ts # Redis sorted set ops
│   │   │   │   ├── watchParty.service.ts
│   │   │   │   └── referral.service.ts
│   │   │   │
│   │   │   ├── queues/
│   │   │   │   ├── index.ts              # BullMQ queue definitions
│   │   │   │   ├── passport.queue.ts     # Passport mint jobs
│   │   │   │   ├── badge.queue.ts        # Badge mint jobs
│   │   │   │   └── notification.queue.ts # Push + webhook jobs
│   │   │   │
│   │   │   └── lib/
│   │   │       ├── supabase.ts       # Supabase server client
│   │   │       ├── redis.ts          # Upstash Redis client
│   │   │       ├── thirdweb.ts       # Thirdweb server SDK
│   │   │       └── privy.ts          # Privy server-side verify
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── workers/                      # BullMQ workers (separate Railway service)
│       ├── src/
│       │   ├── index.ts              # Worker entry, registers all workers
│       │   ├── workers/
│       │   │   ├── passport.worker.ts    # Calls Thirdweb, mints passport NFT
│       │   │   ├── badge.worker.ts       # Calls Thirdweb, mints badge NFT
│       │   │   └── notification.worker.ts # Sends webhooks + push notifications
│       │   └── lib/
│       │       ├── thirdweb.ts
│       │       ├── redis.ts
│       │       └── supabase.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── Dockerfile
│
├── packages/
│   ├── db/                           # Shared DB types + migrations
│   │   ├── migrations/
│   │   │   ├── 001_users.sql
│   │   │   ├── 002_passports.sql
│   │   │   ├── 003_quests.sql
│   │   │   ├── 004_completions.sql
│   │   │   ├── 005_badges.sql
│   │   │   ├── 006_points.sql
│   │   │   ├── 007_leaderboard.sql
│   │   │   ├── 008_watch_parties.sql
│   │   │   └── 009_referrals.sql
│   │   └── types/
│   │       └── index.ts              # Supabase generated types
│   │
│   ├── contracts/                    # Smart contracts
│   │   ├── src/
│   │   │   ├── FanCurvaPassport.sol  # ERC-721 soulbound passport
│   │   │   └── FanCurvaBadge.sol     # ERC-1155 (soulbound + transferable)
│   │   ├── scripts/
│   │   │   └── deploy.ts
│   │   ├── test/
│   │   │   ├── Passport.test.ts
│   │   │   └── Badge.test.ts
│   │   └── hardhat.config.ts
│   │
│   ├── shared/                       # Types shared across all apps
│   │   └── src/
│   │       ├── types.ts              # Quest, Badge, Passport, User types
│   │       └── constants.ts          # Status tiers, point values, etc.
│   │
│   └── config/                       # Tournament data
│       ├── teams.ts                  # 48 World Cup teams + metadata
│       ├── matches.ts                # Full tournament schedule
│       └── badges.ts                 # Badge definitions + point values
│
├── docker-compose.yml                # Local Redis + Postgres
├── turbo.json                        # Turborepo monorepo config
├── pnpm-workspace.yaml
└── package.json
```

---

## Prerequisites — Everything to Install

**Step 1 — Accounts to create (do this first)**
```
privy.io          → Get PRIVY_APP_ID + PRIVY_SECRET
thirdweb.com      → Get THIRDWEB_SECRET_KEY + CLIENT_ID
supabase.com      → Get project URL + anon key + service role key
upstash.com       → Create Redis DB, get URL + token
nft.storage       → Get API key for IPFS metadata pinning
railway.app       → For API + worker deployments
vercel.com        → For frontend deployment
```

**Step 2 — Local tools**
```bash
node >= 20.x        # use nvm to manage versions
pnpm >= 9.x         # monorepo package manager
docker + docker-compose  # local Redis + Postgres
git
```

**Step 3 — Global CLIs**
```bash
npm i -g turbo          # monorepo orchestration
npm i -g supabase       # DB migrations
npm i -g thirdweb       # contract deployment
```

**Step 4 — Full `.env` across all services**
```bash
# ── Frontend (web/.env) ──────────────────────────
VITE_PRIVY_APP_ID=
VITE_THIRDWEB_CLIENT_ID=
VITE_API_URL=http://localhost:3001
VITE_PASSPORT_CONTRACT=
VITE_BADGE_CONTRACT=

# ── Backend API (api/.env) ───────────────────────
PORT=3001
PRIVY_APP_ID=
PRIVY_SECRET=
THIRDWEB_SECRET_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
PASSPORT_CONTRACT_ADDRESS=
BADGE_CONTRACT_ADDRESS=
WORKER_SECRET=
CORS_ORIGIN=http://localhost:5173

# ── Workers (workers/.env) ───────────────────────
THIRDWEB_SECRET_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
WORKER_SECRET=
MINTER_PRIVATE_KEY=   # wallet with MINTER_ROLE on contracts

# ── Contracts (contracts/.env) ───────────────────
PRIVATE_KEY=          # deployer wallet
BASE_SEPOLIA_RPC=
BASE_MAINNET_RPC=
```

---

The logical order to build from here is:

1. **Scaffold the monorepo** — `turbo`, `pnpm workspaces`, `docker-compose` up
2. **Database migrations** — Supabase tables first, everything depends on these
3. **Smart contracts** — deploy to Base Sepolia testnet
4. **Hono API skeleton** — auth middleware + quest completion route
5. **BullMQ workers** — passport and badge mint workers
6. **Vite frontend** — Privy login → team picker → dashboard