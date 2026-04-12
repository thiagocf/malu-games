# Memory Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based memory card game with 8 animal pairs for Malu (age 4), deployed to GitHub Pages.

**Architecture:** Pure game logic lives in `engine.ts` (no React/DOM dependencies), exposed to UI via `useGame` hook. UI components are stateless renderers that only call hook actions. This separation makes the logic fully testable and portable to React Native later.

**Tech Stack:** React 18, Vite, TypeScript, CSS Modules, Vitest, GitHub Actions

---

## File Map

| File | Responsibility |
|---|---|
| `src/games/memory/game/types.ts` | Shared types: `Animal`, `Card`, `GameState`, `GameConfig` |
| `src/games/memory/game/engine.ts` | Pure functions: `createDeck`, `flipCard`, `resolvePair`, `isComplete` |
| `src/games/memory/game/engine.test.ts` | Unit tests for all engine functions |
| `src/games/memory/game/useGame.ts` | React hook: state + actions + setTimeout for pair resolution |
| `src/games/memory/assets/animals/animals.ts` | Static data: the 8 animals |
| `src/games/memory/components/Card.tsx` | Single card with CSS flip animation |
| `src/games/memory/components/Card.module.css` | Flip animation and card face styles |
| `src/games/memory/components/Board.tsx` | 4×4 responsive grid |
| `src/games/memory/components/Board.module.css` | Grid layout |
| `src/games/memory/components/GameHeader.tsx` | Move counter + restart button |
| `src/games/memory/components/GameHeader.module.css` | Header styles |
| `src/games/memory/components/GameOver.tsx` | Congratulations overlay |
| `src/games/memory/components/GameOver.module.css` | Overlay + card styles |
| `src/App.tsx` | Root: wires hook + components |
| `src/App.css` | Global styles: gradient background, font, layout |
| `index.html` | Entry point: Google Fonts link |
| `vite.config.ts` | Vite + Vitest config, GitHub Pages base path |
| `.github/workflows/deploy.yml` | CI: build + deploy to GitHub Pages |

---

## Task 1: Project Scaffold

**Files:**
- Create: `vite.config.ts` (modify generated)
- Modify: `index.html` (add Google Fonts)
- Modify: `package.json` (add test scripts)

- [ ] **Step 1: Scaffold the Vite project**

Run in the repo root (answer prompts: framework = React, variant = TypeScript):
```bash
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install -D vitest
```

- [ ] **Step 3: Update `vite.config.ts`**

Replace the generated file with:
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/malu-games/',
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 4: Add test scripts to `package.json`**

In the `"scripts"` block, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Final scripts block:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: Add Google Fonts to `index.html`**

Add inside `<head>`, before `</head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```
Expected: Vite starts on `http://localhost:5173`, browser shows default React page.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold React + Vite + TypeScript project"
```

---

## Task 2: Types and Animal Data

**Files:**
- Create: `src/games/memory/game/types.ts`
- Create: `src/games/memory/assets/animals/animals.ts`

- [ ] **Step 1: Create `src/games/memory/game/types.ts`**

```ts
export type Animal = {
  id: string
  emoji: string
  label: string
}

export type Card = {
  id: number
  animalId: string
  isFlipped: boolean
  isMatched: boolean
}

export type GameState = {
  cards: Card[]
  flippedIds: number[]
  moves: number
  isComplete: boolean
}

export type GameConfig = {
  deck: Animal[]
}
```

- [ ] **Step 2: Create `src/games/memory/assets/animals/animals.ts`**

```ts
import type { Animal } from '../../game/types'

export const ANIMALS: Animal[] = [
  { id: 'dog',     emoji: '🐶', label: 'Cachorro' },
  { id: 'cat',     emoji: '🐱', label: 'Gato'     },
  { id: 'frog',    emoji: '🐸', label: 'Sapo'     },
  { id: 'lion',    emoji: '🦁', label: 'Leão'     },
  { id: 'rabbit',  emoji: '🐰', label: 'Coelho'   },
  { id: 'bear',    emoji: '🐻', label: 'Urso'     },
  { id: 'penguin', emoji: '🐧', label: 'Pinguim'  },
  { id: 'fox',     emoji: '🦊', label: 'Raposa'   },
]
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "feat: add types and animal data"
```

---

## Task 3: Game Engine (TDD)

**Files:**
- Create: `src/games/memory/game/engine.test.ts`
- Create: `src/games/memory/game/engine.ts`

- [ ] **Step 1: Create `src/games/memory/game/engine.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { createDeck, flipCard, resolvePair, isComplete } from './engine'
import type { GameConfig, GameState } from './types'

const config: GameConfig = {
  deck: [
    { id: 'dog', emoji: '🐶', label: 'Cachorro' },
    { id: 'cat', emoji: '🐱', label: 'Gato' },
  ],
}

function makeState(overrides?: Partial<GameState>): GameState {
  return {
    cards: [
      { id: 0, animalId: 'dog', isFlipped: false, isMatched: false },
      { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
      { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
      { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
    ],
    flippedIds: [],
    moves: 0,
    isComplete: false,
    ...overrides,
  }
}

// ─── createDeck ─────────────────────────────────────────────────────────────

describe('createDeck', () => {
  it('creates 2x the number of animals as cards', () => {
    expect(createDeck(config)).toHaveLength(4)
  })

  it('has exactly 2 cards for each animal', () => {
    const deck = createDeck(config)
    expect(deck.filter(c => c.animalId === 'dog')).toHaveLength(2)
    expect(deck.filter(c => c.animalId === 'cat')).toHaveLength(2)
  })

  it('assigns unique sequential ids starting at 0', () => {
    const deck = createDeck(config)
    expect(deck.map(c => c.id).sort((a, b) => a - b)).toEqual([0, 1, 2, 3])
  })

  it('starts all cards unflipped and unmatched', () => {
    const deck = createDeck(config)
    expect(deck.every(c => !c.isFlipped && !c.isMatched)).toBe(true)
  })
})

// ─── flipCard ────────────────────────────────────────────────────────────────

describe('flipCard', () => {
  it('flips the target card and adds its id to flippedIds', () => {
    const next = flipCard(makeState(), 0)
    expect(next.cards.find(c => c.id === 0)?.isFlipped).toBe(true)
    expect(next.flippedIds).toContain(0)
  })

  it('returns the same state reference if card is already flipped', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0],
    })
    expect(flipCard(state, 0)).toBe(state)
  })

  it('returns the same state reference if 2 cards are already flipped', () => {
    const state = makeState({ flippedIds: [0, 1] })
    expect(flipCard(state, 2)).toBe(state)
  })

  it('returns the same state reference if card is matched', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: true },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
    })
    expect(flipCard(state, 0)).toBe(state)
  })
})

// ─── resolvePair ─────────────────────────────────────────────────────────────

describe('resolvePair', () => {
  it('marks both cards as matched when they share the same animalId', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 2],
    })
    const next = resolvePair(state)
    expect(next.cards.find(c => c.id === 0)?.isMatched).toBe(true)
    expect(next.cards.find(c => c.id === 2)?.isMatched).toBe(true)
  })

  it('unflips both cards when they have different animalIds', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
    })
    const next = resolvePair(state)
    expect(next.cards.find(c => c.id === 0)?.isFlipped).toBe(false)
    expect(next.cards.find(c => c.id === 1)?.isFlipped).toBe(false)
  })

  it('increments the move counter', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
    })
    expect(resolvePair(state).moves).toBe(1)
  })

  it('clears flippedIds', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
    })
    expect(resolvePair(state).flippedIds).toHaveLength(0)
  })

  it('sets isComplete to true when all pairs are found', () => {
    const state: GameState = {
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true,  isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true,  isMatched: true  },
        { id: 2, animalId: 'dog', isFlipped: true,  isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: true,  isMatched: true  },
      ],
      flippedIds: [0, 2],
      moves: 1,
      isComplete: false,
    }
    expect(resolvePair(state).isComplete).toBe(true)
  })
})

// ─── isComplete ──────────────────────────────────────────────────────────────

describe('isComplete', () => {
  it('returns false when some cards are unmatched', () => {
    expect(isComplete(makeState())).toBe(false)
  })

  it('returns true when all cards are matched', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: true },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: true },
        { id: 2, animalId: 'dog', isFlipped: true, isMatched: true },
        { id: 3, animalId: 'cat', isFlipped: true, isMatched: true },
      ],
    })
    expect(isComplete(state)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests — confirm they all fail**

```bash
npm test
```
Expected: all tests FAIL with "Cannot find module './engine'".

- [ ] **Step 3: Create `src/games/memory/game/engine.ts`**

```ts
import type { GameConfig, GameState } from './types'

export function createDeck(config: GameConfig): import('./types').Card[] {
  const doubled = [...config.deck, ...config.deck]
  const shuffled = doubled.sort(() => Math.random() - 0.5)
  return shuffled.map((animal, index) => ({
    id: index,
    animalId: animal.id,
    isFlipped: false,
    isMatched: false,
  }))
}

export function flipCard(state: GameState, id: number): GameState {
  const card = state.cards.find(c => c.id === id)
  if (!card || card.isFlipped || card.isMatched || state.flippedIds.length >= 2) {
    return state
  }
  return {
    ...state,
    cards: state.cards.map(c => c.id === id ? { ...c, isFlipped: true } : c),
    flippedIds: [...state.flippedIds, id],
  }
}

export function resolvePair(state: GameState): GameState {
  const [firstId, secondId] = state.flippedIds
  const first = state.cards.find(c => c.id === firstId)!
  const second = state.cards.find(c => c.id === secondId)!
  const matched = first.animalId === second.animalId

  const cards = state.cards.map(c => {
    if (c.id === firstId || c.id === secondId) {
      return matched ? { ...c, isMatched: true } : { ...c, isFlipped: false }
    }
    return c
  })

  const next: GameState = {
    ...state,
    cards,
    flippedIds: [],
    moves: state.moves + 1,
    isComplete: false,
  }

  return { ...next, isComplete: isComplete(next) }
}

export function isComplete(state: GameState): boolean {
  return state.cards.every(c => c.isMatched)
}
```

- [ ] **Step 4: Run tests — confirm they all pass**

```bash
npm test
```
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/games/
git commit -m "feat: add game engine with unit tests"
```

---

## Task 4: useGame Hook

**Files:**
- Create: `src/games/memory/game/useGame.ts`

- [ ] **Step 1: Create `src/games/memory/game/useGame.ts`**

```ts
import { useState, useCallback } from 'react'
import { createDeck, flipCard, resolvePair } from './engine'
import type { GameConfig, GameState } from './types'

export function useGame(config: GameConfig) {
  const [state, setState] = useState<GameState>(() => ({
    cards: createDeck(config),
    flippedIds: [],
    moves: 0,
    isComplete: false,
  }))

  const handleFlip = useCallback((id: number) => {
    setState(prev => {
      if (prev.flippedIds.length >= 2) return prev
      const next = flipCard(prev, id)
      if (next.flippedIds.length === 2) {
        setTimeout(() => {
          setState(s => resolvePair(s))
        }, 1000)
      }
      return next
    })
  }, [])

  const restart = useCallback(() => {
    setState({
      cards: createDeck(config),
      flippedIds: [],
      moves: 0,
      isComplete: false,
    })
  }, [config])

  return {
    cards: state.cards,
    moves: state.moves,
    isComplete: state.isComplete,
    flipCard: handleFlip,
    restart,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/games/memory/game/useGame.ts
git commit -m "feat: add useGame hook"
```

---

## Task 5: Card Component

**Files:**
- Create: `src/games/memory/components/Card.tsx`
- Create: `src/games/memory/components/Card.module.css`

- [ ] **Step 1: Create `src/games/memory/components/Card.module.css`**

```css
.scene {
  width: 100%;
  aspect-ratio: 1;
  perspective: 600px;
  cursor: pointer;
}

.scene.matched {
  cursor: default;
  opacity: 0.55;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
}

.card.flipped {
  transform: rotateY(180deg);
}

.face {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back {
  background: linear-gradient(135deg, #c084fc, #f0abfc);
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  font-weight: 800;
  color: #fff;
  box-shadow: 0 4px 12px rgba(192, 132, 252, 0.4);
  user-select: none;
}

.front {
  background: rgba(255, 255, 255, 0.85);
  font-size: clamp(1.6rem, 5vw, 2.4rem);
  transform: rotateY(180deg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.matched .front {
  border-color: rgba(134, 239, 172, 0.8);
}
```

- [ ] **Step 2: Create `src/games/memory/components/Card.tsx`**

```tsx
import type { Card as CardType } from '../game/types'
import styles from './Card.module.css'

type Props = {
  card: CardType
  animalEmoji: string
  onClick: () => void
}

export function Card({ card, animalEmoji, onClick }: Props) {
  const isActive = card.isFlipped || card.isMatched
  return (
    <div
      className={`${styles.scene} ${card.isMatched ? styles.matched : ''}`}
      onClick={!card.isFlipped && !card.isMatched ? onClick : undefined}
    >
      <div className={`${styles.card} ${isActive ? styles.flipped : ''}`}>
        <div className={`${styles.face} ${styles.back}`}>?</div>
        <div className={`${styles.face} ${styles.front}`}>{animalEmoji}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/games/memory/components/Card.tsx src/games/memory/components/Card.module.css
git commit -m "feat: add Card component with flip animation"
```

---

## Task 6: Board Component

**Files:**
- Create: `src/games/memory/components/Board.tsx`
- Create: `src/games/memory/components/Board.module.css`

- [ ] **Step 1: Create `src/games/memory/components/Board.module.css`**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(8px, 2vw, 12px);
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}
```

- [ ] **Step 2: Create `src/games/memory/components/Board.tsx`**

```tsx
import type { Animal, Card as CardType } from '../game/types'
import { Card } from './Card'
import styles from './Board.module.css'

type Props = {
  cards: CardType[]
  animals: Animal[]
  onFlip: (id: number) => void
}

export function Board({ cards, animals, onFlip }: Props) {
  const emojiMap = Object.fromEntries(animals.map(a => [a.id, a.emoji]))
  return (
    <div className={styles.grid}>
      {cards.map(card => (
        <Card
          key={card.id}
          card={card}
          animalEmoji={emojiMap[card.animalId]}
          onClick={() => onFlip(card.id)}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/games/memory/components/Board.tsx src/games/memory/components/Board.module.css
git commit -m "feat: add Board component"
```

---

## Task 7: GameHeader Component

**Files:**
- Create: `src/games/memory/components/GameHeader.tsx`
- Create: `src/games/memory/components/GameHeader.module.css`

- [ ] **Step 1: Create `src/games/memory/components/GameHeader.module.css`**

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 0.75rem 1.25rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #9333ea;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #581c87;
  line-height: 1;
}

.title {
  font-size: 1rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}

.restart {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.5rem 0.9rem;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
  transition: opacity 0.15s;
}

.restart:hover {
  opacity: 0.85;
}
```

- [ ] **Step 2: Create `src/games/memory/components/GameHeader.tsx`**

```tsx
import styles from './GameHeader.module.css'

type Props = {
  moves: number
  onRestart: () => void
}

export function GameHeader({ moves, onRestart }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.stat}>
        <span className={styles.label}>Tentativas</span>
        <span className={styles.value}>{moves}</span>
      </div>
      <h1 className={styles.title}>Jogo da Memória</h1>
      <button className={styles.restart} onClick={onRestart}>↺ Novo</button>
    </header>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/games/memory/components/GameHeader.tsx src/games/memory/components/GameHeader.module.css
git commit -m "feat: add GameHeader component"
```

---

## Task 8: GameOver Component

**Files:**
- Create: `src/games/memory/components/GameOver.tsx`
- Create: `src/games/memory/components/GameOver.module.css`

- [ ] **Step 1: Create `src/games/memory/components/GameOver.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(243, 232, 255, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: appear 0.3s ease;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  padding: 2.5rem 3rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.emoji {
  font-size: 4rem;
  line-height: 1;
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1rem;
  color: #7c3aed;
}

.button {
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  padding: 0.75rem 1.75rem;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
  transition: opacity 0.15s;
}

.button:hover {
  opacity: 0.85;
}
```

- [ ] **Step 2: Create `src/games/memory/components/GameOver.tsx`**

```tsx
import styles from './GameOver.module.css'

type Props = {
  moves: number
  onRestart: () => void
}

export function GameOver({ moves, onRestart }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.emoji}>🎉</div>
        <h2 className={styles.title}>Parabéns, Malu!</h2>
        <p className={styles.subtitle}>
          Você completou em <strong>{moves}</strong> tentativas!
        </p>
        <button className={styles.button} onClick={onRestart}>
          Jogar de novo
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/games/memory/components/GameOver.tsx src/games/memory/components/GameOver.module.css
git commit -m "feat: add GameOver component"
```

---

## Task 9: App Integration and Global Styles

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `src/index.css`

- [ ] **Step 1: Replace `src/index.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
  font-family: 'Nunito', sans-serif;
}

#root {
  min-height: 100vh;
}
```

- [ ] **Step 2: Replace `src/App.css`**

```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(1rem, 4vw, 2rem);
  gap: 1.5rem;
}
```

- [ ] **Step 3: Replace `src/App.tsx`**

```tsx
import { useGame } from './games/memory/game/useGame'
import { Board } from './games/memory/components/Board'
import { GameHeader } from './games/memory/components/GameHeader'
import { GameOver } from './games/memory/components/GameOver'
import { ANIMALS } from './games/memory/assets/animals/animals'
import './App.css'

const config = { deck: ANIMALS }

export function App() {
  const { cards, moves, isComplete, flipCard, restart } = useGame(config)

  return (
    <main className="app">
      <GameHeader moves={moves} onRestart={restart} />
      <Board cards={cards} animals={ANIMALS} onFlip={flipCard} />
      {isComplete && <GameOver moves={moves} onRestart={restart} />}
    </main>
  )
}
```

- [ ] **Step 4: Run the app and verify it works**

```bash
npm run dev
```

Expected: browser opens, shows 4×4 grid of cards face-down, header with "Tentativas: 0" and "↺ Novo" button. Clicking a card flips it, clicking a second card either keeps both face-up (match) or flips both back after 1s. Completing all pairs shows the congratulations overlay.

- [ ] **Step 5: Run tests to confirm nothing broke**

```bash
npm test
```
Expected: all engine tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.css src/index.css
git commit -m "feat: wire up app — memory game is playable"
```

---

## Task 10: GitHub Actions Deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm test
      - run: npm run build

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 2: Commit**

```bash
git add .github/
git commit -m "feat: add GitHub Actions deploy workflow"
```

- [ ] **Step 3: Enable GitHub Pages in the repository settings (manual)**

1. Push the repo to GitHub: `git remote add origin https://github.com/<usuario>/malu-games.git && git push -u origin main`
2. Go to **Settings → Pages** in the GitHub repo
3. Under **Source**, select **GitHub Actions**
4. The next push to `main` will trigger deployment

Expected: the workflow runs, tests pass, build succeeds, and the game is live at `https://<usuario>.github.io/malu-games/`.

---

## Done

After Task 10, the game is live. Verify by opening the GitHub Pages URL on a phone — the 4×4 grid should fit comfortably on mobile screens thanks to `clamp()` sizing and the `max-width: 480px` constraint.
