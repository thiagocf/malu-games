# Settings: Pair Count — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a settings screen where the player can choose how many pairs (4, 6, 8, 10, or 12) to play with in the memory game.

**Architecture:** A new `Settings` component accessed via a gear icon on `DeckSelector`. The pair count state lives in `App.tsx` and flows down through `Game → useGame → createDeck`. Each deck is expanded from 8 to 12 items.

**Tech Stack:** React 18 + TypeScript + Vite + CSS Modules + Vitest

**Spec:** `docs/superpowers/specs/2026-04-12-settings-pair-count-design.md`

---

### Task 1: Update types

**Files:**
- Modify: `src/games/memory/game/types.ts`

- [ ] **Step 1: Add `pairCount` to `GameConfig`**

```ts
export type GameConfig = {
  deck: Animal[]
  pairCount: number
}
```

- [ ] **Step 2: Verify the project compiles**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: Type errors in `engine.test.ts` and `App.tsx` because they don't pass `pairCount` yet. That's expected — we'll fix them in subsequent tasks.

- [ ] **Step 3: Commit**

```bash
git add src/games/memory/game/types.ts
git commit -m "feat: add pairCount to GameConfig type"
```

---

### Task 2: Update engine to use `pairCount`

**Files:**
- Modify: `src/games/memory/game/engine.ts`

- [ ] **Step 1: Update `createDeck` to slice by `pairCount`**

Replace the current `createDeck` function:

```ts
export function createDeck(config: GameConfig): Card[] {
  const selected = config.deck.slice(0, config.pairCount)
  const doubled = [...selected, ...selected]
  const shuffled = doubled.sort(() => Math.random() - 0.5)
  return shuffled.map((animal, index) => ({
    id: index,
    animalId: animal.id,
    isFlipped: false,
    isMatched: false,
  }))
}
```

- [ ] **Step 2: Commit**

```bash
git add src/games/memory/game/engine.ts
git commit -m "feat: createDeck slices deck by pairCount"
```

---

### Task 3: Update existing tests and add new `pairCount` tests

**Files:**
- Modify: `src/games/memory/game/engine.test.ts`

- [ ] **Step 1: Update the test config to include `pairCount`**

Replace the config at the top of `engine.test.ts`:

```ts
const config: GameConfig = {
  deck: [
    { id: 'dog', emoji: '🐶', label: 'Cachorro' },
    { id: 'cat', emoji: '🐱', label: 'Gato' },
  ],
  pairCount: 2,
}
```

- [ ] **Step 2: Run existing tests to verify they still pass**

Run: `npm run test`
Expected: All existing tests pass (the behavior hasn't changed — 2 items, pairCount 2).

- [ ] **Step 3: Add new tests for `pairCount`**

Add inside the `describe('createDeck', ...)` block, after the existing tests:

```ts
it('creates only the number of pairs specified by pairCount', () => {
  const bigDeck: GameConfig = {
    deck: [
      { id: 'dog', emoji: '🐶', label: 'Cachorro' },
      { id: 'cat', emoji: '🐱', label: 'Gato' },
      { id: 'frog', emoji: '🐸', label: 'Sapo' },
      { id: 'lion', emoji: '🦁', label: 'Leão' },
      { id: 'rabbit', emoji: '🐰', label: 'Coelho' },
      { id: 'bear', emoji: '🐻', label: 'Urso' },
    ],
    pairCount: 4,
  }
  const deck = createDeck(bigDeck)
  expect(deck).toHaveLength(8)
  const uniqueIds = new Set(deck.map(c => c.animalId))
  expect(uniqueIds.size).toBe(4)
})

it('creates 24 cards when pairCount is 12', () => {
  const items = Array.from({ length: 12 }, (_, i) => ({
    id: `item-${i}`,
    emoji: '🔵',
    label: `Item ${i}`,
  }))
  const deck = createDeck({ deck: items, pairCount: 12 })
  expect(deck).toHaveLength(24)
  const uniqueIds = new Set(deck.map(c => c.animalId))
  expect(uniqueIds.size).toBe(12)
})

it('each animalId appears exactly twice', () => {
  const items = Array.from({ length: 6 }, (_, i) => ({
    id: `item-${i}`,
    emoji: '🔵',
    label: `Item ${i}`,
  }))
  const deck = createDeck({ deck: items, pairCount: 6 })
  const counts = new Map<string, number>()
  deck.forEach(c => counts.set(c.animalId, (counts.get(c.animalId) ?? 0) + 1))
  counts.forEach(count => expect(count).toBe(2))
})
```

- [ ] **Step 4: Run all tests**

Run: `npm run test`
Expected: All tests pass (existing + 3 new).

- [ ] **Step 5: Commit**

```bash
git add src/games/memory/game/engine.test.ts
git commit -m "test: add pairCount tests for createDeck"
```

---

### Task 4: Expand decks from 8 to 12 items

**Files:**
- Modify: `src/games/memory/assets/decks/decks.ts`

- [ ] **Step 1: Add 4 new items to each deck**

Add to the end of `ANIMALS_ITEMS` array (after fox):
```ts
{ id: 'cow',       emoji: '🐮', label: 'Vaca'       },
{ id: 'pig',       emoji: '🐷', label: 'Porco'      },
{ id: 'butterfly', emoji: '🦋', label: 'Borboleta'  },
{ id: 'turtle',    emoji: '🐢', label: 'Tartaruga'  },
```

Add to the end of `FRUITS_ITEMS` array (after peach):
```ts
{ id: 'cherry',    emoji: '🍒', label: 'Cereja'   },
{ id: 'mango',     emoji: '🥭', label: 'Manga'    },
{ id: 'pineapple', emoji: '🍍', label: 'Abacaxi'  },
{ id: 'blueberry', emoji: '🫐', label: 'Mirtilo'  },
```

Add to the end of `FACES_ITEMS` array (after laughing):
```ts
{ id: 'excited',  emoji: '🤩', label: 'Empolgado'  },
{ id: 'party',    emoji: '🥳', label: 'Festeiro'   },
{ id: 'hug',      emoji: '🤗', label: 'Abraço'     },
{ id: 'playful',  emoji: '😜', label: 'Brincalhão' },
```

Add to the end of `VEHICLES_ITEMS` array (after racecar):
```ts
{ id: 'bicycle',   emoji: '🚲', label: 'Bicicleta'            },
{ id: 'scooter',   emoji: '🛵', label: 'Moto'                 },
{ id: 'tractor',   emoji: '🚜', label: 'Trator'               },
{ id: 'firetruck', emoji: '🚒', label: 'Caminhão de bombeiro' },
```

Add to the end of `FOODS_ITEMS` array (after sandwich):
```ts
{ id: 'fries',   emoji: '🍟', label: 'Batata frita'      },
{ id: 'hotdog',  emoji: '🌭', label: 'Cachorro-quente'   },
{ id: 'cupcake', emoji: '🧁', label: 'Cupcake'           },
{ id: 'pasta',   emoji: '🍝', label: 'Espaguete'         },
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds (or only type errors from App.tsx which we fix next).

- [ ] **Step 3: Commit**

```bash
git add src/games/memory/assets/decks/decks.ts
git commit -m "feat: expand all decks from 8 to 12 items"
```

---

### Task 5: Update `App.tsx` with settings state and `pairCount` plumbing

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add settings state and pass `pairCount` to Game**

Replace the entire `src/App.tsx` with:

```tsx
import { useState } from 'react'
import { useGame } from './games/memory/game/useGame'
import { Board } from './games/memory/components/Board'
import { GameHeader } from './games/memory/components/GameHeader'
import { GameOver } from './games/memory/components/GameOver'
import { DeckSelector } from './games/memory/components/DeckSelector'
import { Settings } from './games/memory/components/Settings'
import { DECKS } from './games/memory/assets/decks/decks'
import type { DeckConfig } from './games/memory/game/types'
import './App.css'

const DEFAULT_PAIR_COUNT = 8

export function App() {
  const [selectedDeck, setSelectedDeck] = useState<DeckConfig | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [pairCount, setPairCount] = useState(DEFAULT_PAIR_COUNT)

  if (showSettings) {
    return (
      <Settings
        pairCount={pairCount}
        onChangePairCount={setPairCount}
        onBack={() => setShowSettings(false)}
      />
    )
  }

  if (!selectedDeck) {
    return (
      <DeckSelector
        decks={DECKS}
        onSelect={setSelectedDeck}
        onOpenSettings={() => setShowSettings(true)}
      />
    )
  }

  return <Game deck={selectedDeck} pairCount={pairCount} onBackToMenu={() => setSelectedDeck(null)} />
}

function Game({ deck, pairCount, onBackToMenu }: { deck: DeckConfig; pairCount: number; onBackToMenu: () => void }) {
  const config = { deck: deck.items, pairCount }
  const { cards, moves, isComplete, flipCard, restart } = useGame(config)

  return (
    <main className="app">
      <GameHeader moves={moves} onRestart={restart} />
      <Board cards={cards} animals={deck.items} onFlip={flipCard} />
      {isComplete && <GameOver moves={moves} onRestart={restart} onBackToMenu={onBackToMenu} />}
    </main>
  )
}
```

- [ ] **Step 2: Verify build compiles** (will fail until Settings and updated DeckSelector exist)

Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: Errors about missing `Settings` component and `onOpenSettings` prop. This is expected.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire pairCount state and settings navigation in App"
```

---

### Task 6: Add gear icon to `DeckSelector`

**Files:**
- Modify: `src/games/memory/components/DeckSelector.tsx`
- Modify: `src/games/memory/components/DeckSelector.module.css`

- [ ] **Step 1: Add `onOpenSettings` prop and gear button**

Replace the entire `DeckSelector.tsx` with:

```tsx
import type { DeckConfig } from '../game/types'
import styles from './DeckSelector.module.css'

type Props = {
  decks: DeckConfig[]
  onSelect: (deck: DeckConfig) => void
  onOpenSettings: () => void
}

export function DeckSelector({ decks, onSelect, onOpenSettings }: Props) {
  return (
    <main className={styles.container}>
      <button className={styles.gear} onClick={onOpenSettings}>⚙️</button>
      <h1 className={styles.title}>🎮 Jogo da Memória</h1>
      <p className={styles.subtitle}>Escolhe um tema para jogar!</p>
      <div className={styles.grid}>
        {decks.map((deck, i) => (
          <button
            key={deck.id}
            className={`${styles.card}${i === decks.length - 1 && decks.length % 2 !== 0 ? ` ${styles.cardLast}` : ''}`}
            onClick={() => onSelect(deck)}
          >
            <span className={styles.emoji}>{deck.emoji}</span>
            <span className={styles.name}>{deck.name}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Add gear button styles**

Add to the end of `DeckSelector.module.css`:

```css
.gear {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.85);
  border: 2px solid rgba(192, 132, 252, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.15);
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.gear:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.22);
  border-color: #c084fc;
}

.gear:active {
  transform: scale(0.96);
}
```

Also add `position: relative;` to the existing `.container` rule so the gear is positioned correctly:

In `.container`, add `position: relative;`

- [ ] **Step 3: Commit**

```bash
git add src/games/memory/components/DeckSelector.tsx src/games/memory/components/DeckSelector.module.css
git commit -m "feat: add gear icon to DeckSelector for settings access"
```

---

### Task 7: Create `Settings` component

**Files:**
- Create: `src/games/memory/components/Settings.tsx`
- Create: `src/games/memory/components/Settings.module.css`

- [ ] **Step 1: Create `Settings.tsx`**

```tsx
import styles from './Settings.module.css'

const PAIR_OPTIONS = [4, 6, 8, 10, 12] as const

type Props = {
  pairCount: number
  onChangePairCount: (count: number) => void
  onBack: () => void
}

export function Settings({ pairCount, onChangePairCount, onBack }: Props) {
  return (
    <main className={styles.container}>
      <button className={styles.back} onClick={onBack}>←</button>
      <h1 className={styles.title}>⚙️ Configurações</h1>

      <div className={styles.section}>
        <p className={styles.label}>Quantidade de pares</p>
        <div className={styles.options}>
          {PAIR_OPTIONS.map(n => (
            <button
              key={n}
              className={`${styles.option} ${n === pairCount ? styles.selected : ''}`}
              onClick={() => onChangePairCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p className={styles.hint}>{pairCount} pares = {pairCount * 2} cartas</p>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create `Settings.module.css`**

```css
.container {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  position: relative;
}

.back {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.85);
  border: 2px solid rgba(192, 132, 252, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.15);
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  color: #7c3aed;
  font-weight: 700;
  font-family: inherit;
}

.back:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.22);
  border-color: #c084fc;
}

.back:active {
  transform: scale(0.96);
}

.title {
  font-size: clamp(1.4rem, 5vw, 1.8rem);
  font-weight: 900;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-top: 2rem;
}

.section {
  background: rgba(255, 255, 255, 0.85);
  border: 2px solid rgba(192, 132, 252, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.1);
}

.label {
  font-weight: 800;
  color: #374151;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  text-align: center;
  margin: 0 0 1rem;
}

.options {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.option {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(192, 132, 252, 0.2);
  color: #374151;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.option:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.22);
  border-color: #c084fc;
}

.option:active {
  transform: scale(0.96);
}

.selected {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: #fff;
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.selected:hover {
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4);
}

.hint {
  color: #9ca3af;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  text-align: center;
  margin: 0.75rem 0 0;
  font-weight: 600;
}
```

- [ ] **Step 3: Verify full build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Run all tests**

Run: `npm run test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/games/memory/components/Settings.tsx src/games/memory/components/Settings.module.css
git commit -m "feat: create Settings component with pair count selector"
```

---

### Task 8: Manual smoke test

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify the full flow**

Test in browser:
1. Tela inicial mostra ícone de engrenagem no canto superior direito
2. Clicar na engrenagem abre a tela de configurações
3. O valor 8 está selecionado por padrão (destacado em gradiente)
4. Texto mostra "8 pares = 16 cartas"
5. Clicar em outro valor (ex: 4) atualiza a seleção e o texto ("4 pares = 8 cartas")
6. Clicar "←" volta para a tela de seleção de deck
7. Escolher um deck inicia o jogo com a quantidade de pares configurada
8. Verificar que o grid tem o número correto de cartas (ex: 8 cartas para 4 pares)
9. Voltar ao menu e escolher 12 pares — verificar que gera 24 cartas em grid 4x6

- [ ] **Step 3: Final commit (if any adjustments needed)**
