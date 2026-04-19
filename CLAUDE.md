# malu-games

Plataforma de jogos educativos para a Malu (4 anos). Sem propagandas, open source.

## Stack

**Monorepo com npm workspaces** (`frontend/` e `api/`):

- `frontend/`: React 18 + TypeScript + Vite + Vitest + CSS Modules + Supabase Auth
- `api/`: NestJS + Prisma (PostgreSQL) + JWT via Supabase strategy
- Deploy frontend: GitHub Pages via GitHub Actions

## Comandos

```bash
# Da raiz (monorepo)
npm run dev:frontend      # Vite dev server — http://localhost:5173
npm run dev:api           # NestJS watch — http://localhost:3000
npm run build:frontend    # tsc -b && vite build
npm run build:api         # nest build
npm run test              # roda testes de ambos os workspaces
npm run test:frontend     # vitest run (no workspace frontend/)
npm run test:api          # jest (no workspace api/)

# Dentro de frontend/
npm run test:watch        # vitest (modo watch)
npm run lint
npm run preview

# Dentro de api/
npm run prisma:migrate    # prisma migrate dev
npm run prisma:studio     # abre UI do banco
npm run prisma:generate   # prisma generate
npm run test:e2e          # jest --config ./test/jest-e2e.json
```

## Estrutura

```
frontend/src/
  games/
    memory/
      game/
        engine.ts      # funções puras: createDeck, flipCard, resolvePair, isComplete
        engine.test.ts
        useGame.ts     # hook: expõe estado + actions para a UI
        useSounds.ts   # sons via Web Audio API
        types.ts       # Animal, Card, GameState, GameConfig
      components/
        Board.tsx / Card.tsx / GameHeader.tsx / GameOver.tsx
        DeckSelector.tsx   # tela de seleção de deck antes do jogo
        Settings.tsx       # configurações acessíveis durante/após jogo
      assets/decks/
        decks.ts       # múltiplos decks (animais, etc.)
    alphabet-match/
      game/
        engine.ts / engine.test.ts / useGame.ts / useGame.test.ts
        useSounds.ts / types.ts
      components/
        RoundScreen.tsx / FeedbackPopup.tsx / GameHeader.tsx / GameOver.tsx
      assets/
        animals.ts + animals/*.jpeg   # fotos reais (não emojis)
  platform/
    components/
      GameOverScreen.tsx    # tela de fim de jogo compartilhada entre jogos
      GameStartScreen.tsx   # tela de início compartilhada
      GameSelector.tsx      # seleção de jogo na home
      TopBar.tsx            # barra superior com botão de saída
      ExitConfirmPopup.tsx  # popup de confirmação de saída
  auth/
    AuthContext.tsx    # contexto React de autenticação
    LoginButton.tsx
    supabase.ts        # cliente Supabase
  api/
    client.ts          # cliente HTTP para a API

api/src/
  modules/
    auth/              # JWT guard + Supabase strategy (valida tokens Supabase)
    users/             # CRUD de usuário (controller, service, dto)
  prisma/              # PrismaService
  health/              # GET /health
```

## Arquitetura

**Separação estrita entre lógica e UI (em cada jogo):**

- `engine.ts` — funções puras, sem React. Testável de forma isolada.
- `useGame.ts` — único ponto de acesso à lógica. Gerencia delays. A UI nunca importa `engine.ts` diretamente.
- Componentes recebem apenas dados e callbacks — sem lógica de negócio.

**Plataforma (`platform/`):** componentes de shell compartilhados por todos os jogos. `GameOverScreen` e `GameStartScreen` são reutilizados pelos jogos; cada jogo pode ter seu próprio `GameOver.tsx` interno se precisar de customização extra.

**Auth:** Supabase gerencia autenticação no frontend. A API valida tokens Supabase via `passport-jwt` + `SupabaseStrategy`.

**Sons:** Web Audio API em `useSounds.ts`. Sem arquivos `.mp3`/`.ogg`.

## Modelo de dados (memory)

```ts
type Animal = { id: string; emoji: string; label: string }
type Card   = { id: number; animalId: string; isFlipped: boolean; isMatched: boolean }
type GameState = { cards: Card[]; flippedIds: number[]; moves: number; isComplete: boolean }
type GameConfig = { deck: Animal[] }
```

## Variáveis de ambiente

```bash
# frontend/.env.local
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=http://localhost:3000

# api/.env
DATABASE_URL=postgresql://...
SUPABASE_JWT_SECRET=...
PORT=3000
```

## Visual

- Paleta: lilás/roxo (`#a855f7`, `#c084fc`) e rosa (`#ec4899`, `#f0abfc`)
- Fundo: gradiente suave lilás → rosa
- Bordas arredondadas (16–20px), sombras suaves
- Animação de flip: CSS puro (`transform: rotateY(180deg)`)
- Fonte arredondada (Nunito/Fredoka One)

## Regras de desenvolvimento

- Não adicionar features além do que foi pedido
- Não criar abstrações antecipadas — `shared/` dentro de `src/` não é usado
- Testes unitários para `engine.ts` e hooks críticos; componentes simples não precisam de testes
- Não usar bibliotecas de animação — CSS puro
- Não usar bibliotecas de som — Web Audio API

## Fora de escopo (v1)

- Upload de fotos personalizadas
- Progresso salvo por usuário
- App mobile

## Evolução planejada

- v2: seleção de tema (Animais, Frutas, Cores & Formas)
- v3: deck personalizado via upload de fotos
- v4: React Native/Expo para iOS/Android
