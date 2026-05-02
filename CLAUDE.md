# malu-games

Educational games platform for Malu (4 years old). No ads, open source.

## General guidelines

- Be concise and direct
- Avoid extensive files inspection, when needed, ask for permission
- Avoid reading complete files, try serena tools.
- Prefer minimal diffs over full rewrites
- Avoid unnecessary explanations
- Ask before making broad changes

## Stack

**Monorepo with npm workspaces** (`frontend/` and `api/`):

- `frontend/`: React 18 + TypeScript + Vite + Vitest + CSS Modules + Supabase Auth
- `api/`: NestJS + Prisma (PostgreSQL) + JWT via Supabase strategy
- Frontend deploy: GitHub Pages via GitHub Actions

## Commands

```bash
# From root (monorepo)
npm run dev:frontend      # Vite dev server — http://localhost:5173
npm run dev:api           # NestJS watch — http://localhost:3000
npm run build:frontend    # tsc -b && vite build
npm run build:api         # nest build
npm run test              # runs tests for both workspaces
npm run test:frontend     # vitest run (in frontend workspace)
npm run test:api          # jest (in api workspace)

# Inside frontend/
npm run test:watch        # vitest (watch mode)
npm run lint
npm run preview

# Inside api/
npm run prisma:migrate    # prisma migrate dev
npm run prisma:studio     # opens DB UI
npm run prisma:generate   # prisma generate
npm run test:e2e          # jest --config ./test/jest-e2e.json
```

## Structure

```
frontend/src/
  games/
    memory/
      game/
        engine.ts      # pure functions: createDeck, flipCard, resolvePair, isComplete
        engine.test.ts
        useGame.ts     # hook: exposes state + actions to the UI
        useSounds.ts   # sounds via Web Audio API
        types.ts       # Animal, Card, GameState, GameConfig
      components/
        Settings.tsx       # settings accessible during/after the game
      assets/decks/
        engine.ts / engine.test.ts / useGame.ts / useGame.test.ts
        RoundScreen.tsx / FeedbackPopup.tsx / GameHeader.tsx / GameOver.tsx
      assets/
        animals.ts + animals/*.jpeg   # real photos (not emojis)
  platform/
    components/
      GameOverScreen.tsx    # shared end-of-game screen
      GameStartScreen.tsx   # shared start screen
      GameSelector.tsx      # game selection on home
      TopBar.tsx            # top bar with exit button
      ExitConfirmPopup.tsx  # exit confirmation popup
  auth/
    AuthContext.tsx    # authentication context
    LoginButton.tsx
    supabase.ts        # Supabase client
  api/
    client.ts          # HTTP client for the API

api/src/
  modules/
    auth/              # JWT guard + Supabase strategy (validates Supabase tokens)
    users/             # user CRUD (controller, service, dto)
  prisma/              # PrismaService
  health/              # GET /health
```

## Design tokens

All CSS values for color, shadow, border, radius, and motion **must use the custom properties defined in `frontend/src/index.css`** (prefix `--mg-`). Never hardcode color hex values or shadow/radius values in component CSS modules. If a token doesn't exist yet, add it to `index.css` first.

Palette summary: teal (`--mg-teal-*`) as primary, amber (`--mg-amber-*`) as warm accent, ink (`--mg-ink-*`) for text, flat cream background (`--mg-bg`). No purple, violet, or pink — those are v1 and have been replaced.

## Architecture

**Strict separation between logic and UI (per game):**

- `engine.ts` — pure functions, no React. Fully testable in isolation.
- `useGame.ts` — single entry point for logic. Handles delays. UI never imports `engine.ts` directly.
- Components receive only data and callbacks — no business logic.

**Platform (`platform/`):** shared shell components across all games. `GameOverScreen` and `GameStartScreen` are reused; each game can still have its own `GameOver.tsx` if customization is needed.

**Auth:** Supabase handles authentication on the frontend. The API validates Supabase tokens via `passport-jwt` + `SupabaseStrategy`.

**Sounds:** Web Audio API in `useSounds.ts`. No `.mp3`/`.ogg` files.

## Data model (memory)

```ts
type Animal = { id: string; emoji: string; label: string };
type Card = {
  id: number;
  animalId: string;
  isFlipped: boolean;
  isMatched: boolean;
};
type GameState = {
  cards: Card[];
  flippedIds: number[];
  moves: number;
  isComplete: boolean;
};
type GameConfig = { deck: Animal[] };
```

## Environment variables

```bash
# frontend/.env.local
```
