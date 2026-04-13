# Multiplayer — Jogo da Memória — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add configurable 1 or 2 player mode to the memory game, with player names, alternating turns, per-player scoring, and a contextual game-over screen.

**Architecture:** Player state (`players[]`, `currentPlayerIndex`) lives in `GameState` and is managed by pure engine functions (`createGame`, updated `resolvePair`). The hook (`useGame`) remains the only bridge to React, and exposes the new fields to the UI. Settings stores mode + names; App derives `activePlayers` and threads it through.

**Tech Stack:** React 18, TypeScript, Vitest, React Testing Library, CSS Modules.

---

## File Map

| File | Change |
|---|---|
| `src/games/memory/game/types.ts` | Add `Player`, `PlayerMode`; extend `GameState`, `GameConfig` |
| `src/games/memory/game/engine.ts` | Add `createGame`; update `resolvePair` with turn + scoring |
| `src/games/memory/game/engine.test.ts` | Update `makeState`/`config` helpers; add `createGame` + player tests |
| `src/games/memory/game/useGame.ts` | Use `createGame`; expose `players`, `currentPlayerIndex` |
| `src/App.tsx` | Add `playerMode`/`playerNames` state; wire Settings + Game |
| `src/games/memory/components/Settings.tsx` | Add mode toggle + name inputs + unsaved-guard coverage |
| `src/games/memory/components/Settings.module.css` | Add `.modeOption`, `.nameField`, `.nameInput` |
| `src/games/memory/components/Settings.test.tsx` | Add mode + name field tests |
| `src/games/memory/components/GameHeader.tsx` | Show per-player score + current player indicator |
| `src/games/memory/components/GameHeader.module.css` | Add `.scoreboard`, `.scores`, `.player`, `.activePlayer`, `.turn` |
| `src/games/memory/components/GameHeader.test.tsx` | Add scoreboard + turn tests |
| `src/games/memory/components/GameOver.tsx` | Contextual solo/duo rendering; no auto-redirect in duo |
| `src/games/memory/components/GameOver.module.css` | Add `.scores`, `.scoreRow`, `.buttons`, `.buttonSecondary` |
| `src/games/memory/components/GameOver.test.tsx` | Update name test; add duo winner/tie/no-redirect tests |

---

## Task 1: Update types.ts

**Files:**
- Modify: `src/games/memory/game/types.ts`

- [ ] **Step 1: Replace the file contents**

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

export type Player = {
  name: string
  pairsFound: number
}

export type PlayerMode = 'solo' | 'duo'

export type GameState = {
  cards: Card[]
  flippedIds: number[]
  moves: number
  isComplete: boolean
  players: Player[]
  currentPlayerIndex: number
}

export type GameConfig = {
  deck: Animal[]
  pairCount: number
  players: string[]
}

export type DeckConfig = {
  id: string
  name: string
  emoji: string
  items: Animal[]
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build 2>&1 | head -40`

Expected: errors about `makeState` missing fields in `engine.test.ts` and `useGame` using `createDeck` — these are expected and will be fixed in subsequent tasks. No other new errors.

---

## Task 2: Add `createGame` to engine (TDD)

**Files:**
- Modify: `src/games/memory/game/engine.test.ts`
- Modify: `src/games/memory/game/engine.ts`

- [ ] **Step 1: Update test helpers and add failing `createGame` tests**

Replace the top section of `engine.test.ts` (the `config` constant, `makeState` helper, and the `createDeck` import) with the following. Leave all existing test cases unchanged — only update the helpers and add the new `createGame` describe block.

```ts
import { describe, it, expect } from 'vitest'
import { createDeck, createGame, flipCard, resolvePair, isComplete } from './engine'
import type { GameConfig, GameState } from './types'

const config: GameConfig = {
  deck: [
    { id: 'dog', emoji: '🐶', label: 'Cachorro' },
    { id: 'cat', emoji: '🐱', label: 'Gato' },
  ],
  pairCount: 2,
  players: ['P1'],
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
    players: [{ name: 'P1', pairsFound: 0 }],
    currentPlayerIndex: 0,
    ...overrides,
  }
}
```

Then add this describe block **before** the existing `createDeck` describe:

```ts
// ─── createGame ──────────────────────────────────────────────────────────────

describe('createGame', () => {
  it('initializes players from config names with pairsFound 0', () => {
    const state = createGame({ ...config, players: ['Ana', 'Beto'] })
    expect(state.players).toEqual([
      { name: 'Ana', pairsFound: 0 },
      { name: 'Beto', pairsFound: 0 },
    ])
  })

  it('starts with currentPlayerIndex 0', () => {
    expect(createGame(config).currentPlayerIndex).toBe(0)
  })

  it('starts with moves 0 and isComplete false', () => {
    const state = createGame(config)
    expect(state.moves).toBe(0)
    expect(state.isComplete).toBe(false)
  })

  it('creates the correct number of cards', () => {
    expect(createGame(config).cards).toHaveLength(4)
  })

  it('works with a single player (solo mode)', () => {
    const state = createGame({ ...config, players: ['Malu'] })
    expect(state.players).toEqual([{ name: 'Malu', pairsFound: 0 }])
  })
})
```

- [ ] **Step 2: Run tests — expect createGame tests to fail**

Run: `npm run test 2>&1 | tail -20`

Expected: `createGame` tests fail with "createGame is not a function" (or similar). Existing tests fail due to TypeScript errors from updated `GameState` shape — that's expected.

- [ ] **Step 3: Implement `createGame` in engine.ts**

Add this function **after** `createDeck` in `src/games/memory/game/engine.ts`:

```ts
export function createGame(config: GameConfig): GameState {
  return {
    cards: createDeck(config),
    flippedIds: [],
    moves: 0,
    isComplete: false,
    players: config.players.map(name => ({ name, pairsFound: 0 })),
    currentPlayerIndex: 0,
  }
}
```

Also update the `GameState` import at the top of `engine.ts` — `GameState` now needs `players` and `currentPlayerIndex`, which it has after Task 1. No import change needed; it imports from `./types`.

- [ ] **Step 4: Run tests — createGame tests should pass, resolvePair tests may still fail**

Run: `npm run test 2>&1 | tail -20`

Expected: `createGame` describe passes (5 tests). `resolvePair` tests still fail because `makeState` now includes `players` but `resolvePair` doesn't update them yet — that is the next task.

---

## Task 3: Update `resolvePair` for turn + scoring (TDD)

**Files:**
- Modify: `src/games/memory/game/engine.test.ts`
- Modify: `src/games/memory/game/engine.ts`

- [ ] **Step 1: Add CONTRACT and behavior tests after the existing `resolvePair` describe**

Append these new describe blocks **after** the closing `})` of the existing `describe('resolvePair', ...)`:

```ts
// ─── CONTRACT: turno de jogo ─────────────────────────────────────────────────

describe('CONTRACT: acerto mantém a vez', () => {
  it('solo — currentPlayerIndex permanece 0 após par encontrado', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 2],
    })
    expect(resolvePair(state).currentPlayerIndex).toBe(0)
  })

  it('duo — currentPlayerIndex não avança quando o jogador acerta', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 2],
      players: [{ name: 'P1', pairsFound: 0 }, { name: 'P2', pairsFound: 0 }],
      currentPlayerIndex: 1,
    })
    expect(resolvePair(state).currentPlayerIndex).toBe(1)
  })
})

describe('CONTRACT: erro passa a vez', () => {
  it('duo — currentPlayerIndex avança de 0 para 1 após erro', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
      players: [{ name: 'P1', pairsFound: 0 }, { name: 'P2', pairsFound: 0 }],
      currentPlayerIndex: 0,
    })
    expect(resolvePair(state).currentPlayerIndex).toBe(1)
  })

  it('duo — currentPlayerIndex volta para 0 quando o último jogador erra (wrap)', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
      players: [{ name: 'P1', pairsFound: 0 }, { name: 'P2', pairsFound: 0 }],
      currentPlayerIndex: 1,
    })
    expect(resolvePair(state).currentPlayerIndex).toBe(0)
  })

  it('solo — currentPlayerIndex permanece 0 após erro (nunca troca)', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
    })
    expect(resolvePair(state).currentPlayerIndex).toBe(0)
  })
})

describe('CONTRACT: placar isolado por jogador', () => {
  it('só o jogador atual recebe ponto ao acertar — o outro permanece inalterado', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 2],
      players: [{ name: 'P1', pairsFound: 0 }, { name: 'P2', pairsFound: 0 }],
      currentPlayerIndex: 1,
    })
    const next = resolvePair(state)
    expect(next.players[0].pairsFound).toBe(0)
    expect(next.players[1].pairsFound).toBe(1)
  })

  it('nenhum jogador recebe ponto em um erro', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
      players: [{ name: 'P1', pairsFound: 2 }, { name: 'P2', pairsFound: 1 }],
      currentPlayerIndex: 0,
    })
    const next = resolvePair(state)
    expect(next.players[0].pairsFound).toBe(2)
    expect(next.players[1].pairsFound).toBe(1)
  })
})
```

- [ ] **Step 2: Run tests — new resolvePair player tests should fail**

Run: `npm run test 2>&1 | grep -E 'FAIL|pass|fail'`

Expected: new player tests fail; existing card behavior tests pass.

- [ ] **Step 3: Replace `resolvePair` in engine.ts**

Replace the entire `resolvePair` function in `src/games/memory/game/engine.ts` with:

```ts
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

  const players = state.players.map((p, i) =>
    matched && i === state.currentPlayerIndex
      ? { ...p, pairsFound: p.pairsFound + 1 }
      : p
  )

  const currentPlayerIndex = matched
    ? state.currentPlayerIndex
    : (state.currentPlayerIndex + 1) % state.players.length

  const next: GameState = {
    ...state,
    cards,
    flippedIds: [],
    moves: state.moves + 1,
    isComplete: false,
    players,
    currentPlayerIndex,
  }

  return { ...next, isComplete: isComplete(next) }
}
```

- [ ] **Step 4: Run all tests — all should pass**

Run: `npm run test 2>&1 | tail -10`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/games/memory/game/types.ts src/games/memory/game/engine.ts src/games/memory/game/engine.test.ts
git commit -m "feat: add Player types and engine support for multiplayer (createGame, resolvePair with turns)"
```

---

## Task 4: Update `useGame.ts`

**Files:**
- Modify: `src/games/memory/game/useGame.ts`

- [ ] **Step 1: Replace useGame.ts contents**

```ts
import { useState, useCallback, useEffect } from 'react'
import { createGame, flipCard, resolvePair } from './engine'
import type { GameConfig, GameState } from './types'
import { useSounds } from './useSounds'

export function useGame(config: GameConfig) {
  const [state, setState] = useState<GameState>(() => createGame(config))

  const { playFlip, playMatch, playWin } = useSounds()

  useEffect(() => {
    if (state.flippedIds.length === 2) {
      const timer = setTimeout(() => {
        setState(s => {
          const next = resolvePair(s)
          const didMatch = next.cards.some(
            c => (c.id === s.flippedIds[0] || c.id === s.flippedIds[1]) && c.isMatched
          )
          if (next.isComplete) playWin()
          else if (didMatch) playMatch()
          return next
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.flippedIds, playMatch, playWin])

  const handleFlip = useCallback((id: number) => {
    setState(prev => {
      if (prev.flippedIds.length >= 2) return prev
      playFlip()
      return flipCard(prev, id)
    })
  }, [playFlip])

  const restart = useCallback(() => {
    setState(createGame(config))
  }, [config])

  return {
    cards: state.cards,
    moves: state.moves,
    isComplete: state.isComplete,
    players: state.players,
    currentPlayerIndex: state.currentPlayerIndex,
    flipCard: handleFlip,
    restart,
  }
}
```

- [ ] **Step 2: Verify build compiles cleanly**

Run: `npm run build 2>&1 | head -30`

Expected: only errors from `App.tsx` not yet passing `players` to `useGame` config, and `GameHeader`/`GameOver` prop mismatches. No engine errors.

- [ ] **Step 3: Commit**

```bash
git add src/games/memory/game/useGame.ts
git commit -m "feat: use createGame in useGame, expose players and currentPlayerIndex"
```

---

## Task 5: Update App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace App.tsx contents**

```tsx
import { useState } from 'react'
import { useGame } from './games/memory/game/useGame'
import { Board } from './games/memory/components/Board'
import { GameHeader } from './games/memory/components/GameHeader'
import { GameOver } from './games/memory/components/GameOver'
import { DeckSelector } from './games/memory/components/DeckSelector'
import { Settings } from './games/memory/components/Settings'
import { DECKS } from './games/memory/assets/decks/decks'
import type { DeckConfig, PlayerMode } from './games/memory/game/types'
import './App.css'

const DEFAULT_PAIR_COUNT = 8
const DEFAULT_PLAYER_NAMES = ['Jogador 1', 'Jogador 2']

export function App() {
  const [selectedDeck, setSelectedDeck] = useState<DeckConfig | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [pairCount, setPairCount] = useState(DEFAULT_PAIR_COUNT)
  const [playerMode, setPlayerMode] = useState<PlayerMode>('solo')
  const [playerNames, setPlayerNames] = useState<string[]>(DEFAULT_PLAYER_NAMES)

  if (showSettings) {
    return (
      <Settings
        pairCount={pairCount}
        onChangePairCount={setPairCount}
        playerMode={playerMode}
        playerNames={playerNames}
        onChangePlayerMode={setPlayerMode}
        onChangePlayerNames={setPlayerNames}
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

  const activePlayers = playerMode === 'duo' ? playerNames : [playerNames[0]]

  return (
    <Game
      deck={selectedDeck}
      pairCount={pairCount}
      players={activePlayers}
      onBackToMenu={() => setSelectedDeck(null)}
    />
  )
}

function Game({
  deck,
  pairCount,
  players,
  onBackToMenu,
}: {
  deck: DeckConfig
  pairCount: number
  players: string[]
  onBackToMenu: () => void
}) {
  const config = { deck: deck.items, pairCount, players }
  const {
    cards,
    moves,
    isComplete,
    players: playerState,
    currentPlayerIndex,
    flipCard,
    restart,
  } = useGame(config)

  return (
    <main className="app">
      <GameHeader
        moves={moves}
        players={playerState}
        currentPlayerIndex={currentPlayerIndex}
        onAbandon={onBackToMenu}
      />
      <Board cards={cards} animals={deck.items} onFlip={flipCard} />
      {isComplete && (
        <GameOver
          moves={moves}
          players={playerState}
          onRestart={restart}
          onBackToMenu={onBackToMenu}
        />
      )}
    </main>
  )
}
```

- [ ] **Step 2: Verify build — only GameHeader/GameOver prop errors remain**

Run: `npm run build 2>&1 | head -30`

Expected: TypeScript errors only on `GameHeader` (missing `players`, `currentPlayerIndex`) and `GameOver` (missing `players`). No App or engine errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire playerMode and playerNames through App"
```

---

## Task 6: Update Settings.tsx + CSS + tests

**Files:**
- Modify: `src/games/memory/components/Settings.tsx`
- Modify: `src/games/memory/components/Settings.module.css`
- Modify: `src/games/memory/components/Settings.test.tsx` (or create if not present in main)

- [ ] **Step 1: Write failing tests for new Settings fields**

Create or replace `src/games/memory/components/Settings.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Settings } from './Settings'

const defaultProps = {
  pairCount: 8,
  onChangePairCount: vi.fn(),
  playerMode: 'solo' as const,
  playerNames: ['Jogador 1', 'Jogador 2'],
  onChangePlayerMode: vi.fn(),
  onChangePlayerNames: vi.fn(),
  onBack: vi.fn(),
}

describe('Settings — exibição inicial', () => {
  it('exibe todos os botões de opção de pares', () => {
    render(<Settings {...defaultProps} />)
    for (const n of [4, 6, 8, 10, 12]) {
      expect(screen.getByRole('button', { name: String(n) })).toBeInTheDocument()
    }
  })

  it('exibe hint com pares e cartas corretos para o valor inicial', () => {
    render(<Settings {...defaultProps} />)
    expect(screen.getByText('8 pares = 16 cartas')).toBeInTheDocument()
  })

  it('atualiza hint ao selecionar nova opção', () => {
    render(<Settings {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '6' }))
    expect(screen.getByText('6 pares = 12 cartas')).toBeInTheDocument()
  })
})

describe('Settings — modo de jogo', () => {
  it('mostra os botões Solo e 2 Jogadores', () => {
    render(<Settings {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Solo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2 Jogadores' })).toBeInTheDocument()
  })

  it('input do Jogador 1 sempre visível', () => {
    render(<Settings {...defaultProps} playerMode="solo" />)
    expect(screen.getByPlaceholderText('Jogador 1')).toBeInTheDocument()
  })

  it('input do Jogador 2 oculto em modo solo', () => {
    render(<Settings {...defaultProps} playerMode="solo" />)
    expect(screen.queryByPlaceholderText('Jogador 2')).not.toBeInTheDocument()
  })

  it('input do Jogador 2 visível em modo duo', () => {
    render(<Settings {...defaultProps} playerMode="duo" />)
    expect(screen.getByPlaceholderText('Jogador 2')).toBeInTheDocument()
  })

  it('alternar para 2 Jogadores exibe input do Jogador 2', () => {
    render(<Settings {...defaultProps} playerMode="solo" />)
    fireEvent.click(screen.getByRole('button', { name: '2 Jogadores' }))
    expect(screen.getByPlaceholderText('Jogador 2')).toBeInTheDocument()
  })

  it('nome em branco usa o placeholder como valor ao salvar', () => {
    const onChangePlayerNames = vi.fn()
    render(<Settings {...defaultProps} onChangePlayerNames={onChangePlayerNames} />)
    fireEvent.change(screen.getByPlaceholderText('Jogador 1'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onChangePlayerNames).toHaveBeenCalledWith(
      expect.arrayContaining(['Jogador 1'])
    )
  })

  it('mudança de modo ativa guard de alterações não salvas', () => {
    render(<Settings {...defaultProps} playerMode="solo" />)
    fireEvent.click(screen.getByRole('button', { name: '2 Jogadores' }))
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    expect(screen.getByText('Sair sem salvar?')).toBeInTheDocument()
  })

  it('chamar onChangePlayerMode com modo selecionado ao salvar', () => {
    const onChangePlayerMode = vi.fn()
    render(<Settings {...defaultProps} playerMode="solo" onChangePlayerMode={onChangePlayerMode} />)
    fireEvent.click(screen.getByRole('button', { name: '2 Jogadores' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onChangePlayerMode).toHaveBeenCalledWith('duo')
  })
})

describe('Settings — botão voltar sem alterações', () => {
  it('chama onBack direto quando não há alterações', () => {
    const onBack = vi.fn()
    render(<Settings {...defaultProps} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('não mostra dialog de confirmação quando não há alterações', () => {
    render(<Settings {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    expect(screen.queryByText('Sair sem salvar?')).not.toBeInTheDocument()
  })
})

describe('CONTRACT: guard de alterações não salvas', () => {
  it('mostra dialog de confirmação ao voltar com alterações pendentes', () => {
    render(<Settings {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '6' }))
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    expect(screen.getByText('Sair sem salvar?')).toBeInTheDocument()
  })

  it('"Sair sem salvar" chama onBack sem salvar', () => {
    const onBack = vi.fn()
    const onChangePairCount = vi.fn()
    render(<Settings {...defaultProps} onBack={onBack} onChangePairCount={onChangePairCount} />)
    fireEvent.click(screen.getByRole('button', { name: '6' }))
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    fireEvent.click(screen.getByText('Sair sem salvar'))
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onChangePairCount).not.toHaveBeenCalled()
  })

  it('"Salvar" no dialog chama onChangePairCount com valor selecionado', () => {
    const onChangePairCount = vi.fn()
    render(<Settings {...defaultProps} onChangePairCount={onChangePairCount} />)
    fireEvent.click(screen.getByRole('button', { name: '6' }))
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    fireEvent.click(screen.getAllByText('Salvar')[0])
    expect(onChangePairCount).toHaveBeenCalledWith(6)
  })
})

describe('Settings — botão Salvar', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('chama onChangePairCount com o novo valor ao salvar', () => {
    const onChangePairCount = vi.fn()
    render(<Settings {...defaultProps} onChangePairCount={onChangePairCount} />)
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onChangePairCount).toHaveBeenCalledWith(4)
  })

  it('botão Salvar fica desabilitado após salvar', () => {
    render(<Settings {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(screen.getByRole('button', { name: '✓ Salvo!' })).toBeDisabled()
  })

  it('chama onBack após 800ms de feedback', () => {
    const onBack = vi.fn()
    render(<Settings {...defaultProps} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onBack).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(800) })
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('não chama onBack antes de 800ms', () => {
    const onBack = vi.fn()
    render(<Settings {...defaultProps} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    act(() => { vi.advanceTimersByTime(799) })
    expect(onBack).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests — new mode/name tests should fail**

Run: `npm run test src/games/memory/components/Settings.test.tsx 2>&1 | tail -20`

Expected: mode and name tests fail (Settings doesn't accept those props yet).

- [ ] **Step 3: Replace Settings.tsx**

```tsx
import { useState } from 'react'
import styles from './Settings.module.css'
import type { PlayerMode } from '../game/types'

const PAIR_OPTIONS = [4, 6, 8, 10, 12] as const
const DEFAULT_NAMES = ['Jogador 1', 'Jogador 2']

type Props = {
  pairCount: number
  onChangePairCount: (count: number) => void
  playerMode: PlayerMode
  playerNames: string[]
  onChangePlayerMode: (mode: PlayerMode) => void
  onChangePlayerNames: (names: string[]) => void
  onBack: () => void
}

export function Settings({
  pairCount,
  onChangePairCount,
  playerMode,
  playerNames,
  onChangePlayerMode,
  onChangePlayerNames,
  onBack,
}: Props) {
  const [localPairCount, setLocalPairCount] = useState(pairCount)
  const [localMode, setLocalMode] = useState<PlayerMode>(playerMode)
  const [localNames, setLocalNames] = useState<string[]>(playerNames)
  const [saved, setSaved] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasChanges =
    localPairCount !== pairCount ||
    localMode !== playerMode ||
    localNames[0] !== playerNames[0] ||
    localNames[1] !== playerNames[1]

  function handleSave() {
    const names = localNames.map((n, i) => n.trim() || DEFAULT_NAMES[i])
    onChangePairCount(localPairCount)
    onChangePlayerMode(localMode)
    onChangePlayerNames(names)
    setSaved(true)
    setTimeout(onBack, 800)
  }

  function handleBack() {
    if (hasChanges) {
      setShowConfirm(true)
    } else {
      onBack()
    }
  }

  function handleNameChange(index: number, value: string) {
    const next = [...localNames]
    next[index] = value
    setLocalNames(next)
  }

  return (
    <main className={styles.container}>
      <button className={styles.back} onClick={handleBack}>←</button>
      <h1 className={styles.title}>⚙️ Configurações</h1>

      <div className={styles.section}>
        <p className={styles.label}>Modo de jogo</p>
        <div className={styles.options}>
          <button
            className={`${styles.option} ${styles.modeOption} ${localMode === 'solo' ? styles.selected : ''}`}
            onClick={() => setLocalMode('solo')}
          >
            Solo
          </button>
          <button
            className={`${styles.option} ${styles.modeOption} ${localMode === 'duo' ? styles.selected : ''}`}
            onClick={() => setLocalMode('duo')}
          >
            2 Jogadores
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.nameField}>
          <label className={styles.label}>Jogador 1</label>
          <input
            className={styles.nameInput}
            value={localNames[0]}
            placeholder={DEFAULT_NAMES[0]}
            onChange={e => handleNameChange(0, e.target.value)}
          />
        </div>
        {localMode === 'duo' && (
          <div className={styles.nameField}>
            <label className={styles.label}>Jogador 2</label>
            <input
              className={styles.nameInput}
              value={localNames[1]}
              placeholder={DEFAULT_NAMES[1]}
              onChange={e => handleNameChange(1, e.target.value)}
            />
          </div>
        )}
      </div>

      <div className={styles.section}>
        <p className={styles.label}>Quantidade de pares</p>
        <div className={styles.options}>
          {PAIR_OPTIONS.map(n => (
            <button
              key={n}
              className={`${styles.option} ${n === localPairCount ? styles.selected : ''}`}
              onClick={() => setLocalPairCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p className={styles.hint}>{localPairCount} pares = {localPairCount * 2} cartas</p>
      </div>

      <button
        className={`${styles.save} ${saved ? styles.savedFeedback : ''}`}
        onClick={handleSave}
        disabled={saved}
      >
        {saved ? '✓ Salvo!' : 'Salvar'}
      </button>

      {showConfirm && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <p className={styles.dialogTitle}>Sair sem salvar?</p>
            <p className={styles.dialogBody}>As alterações serão perdidas.</p>
            <div className={styles.dialogButtons}>
              <button className={styles.btnSave} onClick={handleSave}>
                Salvar
              </button>
              <button className={styles.btnDiscard} onClick={onBack}>
                Sair sem salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 4: Add new CSS rules to Settings.module.css**

Append to the end of `src/games/memory/components/Settings.module.css`:

```css
/* Mode toggle (wider than pair-count options) */

.modeOption {
  width: auto;
  height: auto;
  padding: 0.5rem 1.25rem;
}

/* Player name inputs */

.nameField {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.nameField:first-child {
  margin-top: 0;
}

.nameInput {
  flex: 1;
  border: 2px solid rgba(192, 132, 252, 0.3);
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  background: rgba(255, 255, 255, 0.8);
  outline: none;
  transition: border-color 0.15s;
}

.nameInput:focus {
  border-color: #a855f7;
}
```

- [ ] **Step 5: Run Settings tests — all should pass**

Run: `npm run test src/games/memory/components/Settings.test.tsx 2>&1 | tail -15`

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/games/memory/components/Settings.tsx src/games/memory/components/Settings.module.css src/games/memory/components/Settings.test.tsx
git commit -m "feat: add player mode toggle and name inputs to Settings"
```

---

## Task 7: Update GameHeader.tsx + CSS + tests

**Files:**
- Modify: `src/games/memory/components/GameHeader.tsx`
- Modify: `src/games/memory/components/GameHeader.module.css`
- Modify: `src/games/memory/components/GameHeader.test.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/games/memory/components/GameHeader.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameHeader } from './GameHeader'
import type { Player } from '../game/types'

const soloPlayer: Player[] = [{ name: 'Malu', pairsFound: 3 }]
const duoPlayers: Player[] = [
  { name: 'Ana', pairsFound: 2 },
  { name: 'Beto', pairsFound: 1 },
]

describe('GameHeader — dialog de abandono', () => {
  it('não mostra dialog inicialmente', () => {
    render(<GameHeader moves={0} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.queryByText('Continuar jogando')).not.toBeInTheDocument()
  })

  it('clicar "Abandonar" abre dialog', () => {
    render(<GameHeader moves={0} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abandonar' }))
    expect(screen.getByText('Continuar jogando')).toBeInTheDocument()
  })

  it('"Continuar jogando" fecha dialog sem chamar onAbandon', () => {
    const onAbandon = vi.fn()
    render(<GameHeader moves={0} players={soloPlayer} currentPlayerIndex={0} onAbandon={onAbandon} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abandonar' }))
    fireEvent.click(screen.getByText('Continuar jogando'))
    expect(screen.queryByText('Continuar jogando')).not.toBeInTheDocument()
    expect(onAbandon).not.toHaveBeenCalled()
  })

  it('"Abandonar" no dialog chama onAbandon', () => {
    const onAbandon = vi.fn()
    render(<GameHeader moves={0} players={soloPlayer} currentPlayerIndex={0} onAbandon={onAbandon} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abandonar' }))
    const abandonButtons = screen.getAllByRole('button', { name: 'Abandonar' })
    fireEvent.click(abandonButtons[abandonButtons.length - 1])
    expect(onAbandon).toHaveBeenCalledTimes(1)
  })

  it('exibe o contador de moves correto', () => {
    render(<GameHeader moves={7} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})

describe('GameHeader — placar solo', () => {
  it('mostra o nome do jogador', () => {
    render(<GameHeader moves={5} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.getByText(/Malu/)).toBeInTheDocument()
  })

  it('mostra pares encontrados', () => {
    render(<GameHeader moves={5} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.getByText(/3 pares/)).toBeInTheDocument()
  })

  it('não exibe "Vez de" em modo solo', () => {
    render(<GameHeader moves={5} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.queryByText(/Vez de/)).not.toBeInTheDocument()
  })
})

describe('GameHeader — placar duo', () => {
  it('mostra o nome dos dois jogadores', () => {
    render(<GameHeader moves={5} players={duoPlayers} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.getByText(/Ana/)).toBeInTheDocument()
    expect(screen.getByText(/Beto/)).toBeInTheDocument()
  })

  it('exibe "Vez de" com o nome do jogador atual', () => {
    render(<GameHeader moves={5} players={duoPlayers} currentPlayerIndex={1} onAbandon={vi.fn()} />)
    expect(screen.getByText('Vez de: Beto')).toBeInTheDocument()
  })

  it('atualiza "Vez de" quando currentPlayerIndex muda', () => {
    render(<GameHeader moves={5} players={duoPlayers} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.getByText('Vez de: Ana')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — new scoreboard tests should fail**

Run: `npm run test src/games/memory/components/GameHeader.test.tsx 2>&1 | tail -15`

Expected: new tests fail (GameHeader doesn't accept `players` / `currentPlayerIndex` yet).

- [ ] **Step 3: Replace GameHeader.tsx**

```tsx
import { useState } from 'react'
import type { Player } from '../game/types'
import styles from './GameHeader.module.css'

type Props = {
  moves: number
  players: Player[]
  currentPlayerIndex: number
  onAbandon: () => void
}

export function GameHeader({ moves, players, currentPlayerIndex, onAbandon }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const isDuo = players.length > 1

  return (
    <>
      <header className={styles.header}>
        <div className={styles.stat}>
          <span className={styles.label}>Tentativas</span>
          <span className={styles.value}>{moves}</span>
        </div>
        <h1 className={styles.title}>Jogo da Memória</h1>
        <button className={styles.abandon} onClick={() => setShowConfirm(true)}>
          Abandonar
        </button>
      </header>

      <div className={styles.scoreboard}>
        <div className={styles.scores}>
          {players.map((p, i) => (
            <span
              key={i}
              className={isDuo && i === currentPlayerIndex ? styles.activePlayer : styles.player}
            >
              {p.name}: {p.pairsFound} {p.pairsFound === 1 ? 'par' : 'pares'}
            </span>
          ))}
        </div>
        {isDuo && (
          <p className={styles.turn}>Vez de: {players[currentPlayerIndex].name}</p>
        )}
      </div>

      {showConfirm && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <p className={styles.dialogTitle}>Abandonar a partida?</p>
            <p className={styles.dialogBody}>O progresso será perdido.</p>
            <div className={styles.dialogButtons}>
              <button className={styles.btnCancel} onClick={() => setShowConfirm(false)}>
                Continuar jogando
              </button>
              <button className={styles.btnConfirm} onClick={onAbandon}>
                Abandonar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 4: Add new CSS rules to GameHeader.module.css**

Append to the end of `src/games/memory/components/GameHeader.module.css`:

```css
/* Scoreboard bar */

.scoreboard {
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 0.5rem 1.25rem;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.scores {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.player {
  font-size: 0.8rem;
  font-weight: 700;
  color: #7c3aed;
}

.activePlayer {
  font-size: 0.8rem;
  font-weight: 800;
  color: #ec4899;
  text-decoration: underline;
}

.turn {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9333ea;
  margin: 0.25rem 0 0;
  letter-spacing: 0.03em;
}
```

- [ ] **Step 5: Run GameHeader tests — all should pass**

Run: `npm run test src/games/memory/components/GameHeader.test.tsx 2>&1 | tail -15`

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/games/memory/components/GameHeader.tsx src/games/memory/components/GameHeader.module.css src/games/memory/components/GameHeader.test.tsx
git commit -m "feat: add per-player scoreboard and turn indicator to GameHeader"
```

---

## Task 8: Update GameOver.tsx + CSS + tests

**Files:**
- Modify: `src/games/memory/components/GameOver.tsx`
- Modify: `src/games/memory/components/GameOver.module.css`
- Modify: `src/games/memory/components/GameOver.test.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/games/memory/components/GameOver.test.tsx`:

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi } from 'vitest'
import { GameOver } from './GameOver'
import type { Player } from '../game/types'

const soloPlayer: Player[] = [{ name: 'Bea', pairsFound: 4 }]
const duoWinner: Player[] = [{ name: 'Ana', pairsFound: 5 }, { name: 'Beto', pairsFound: 3 }]
const duoTie: Player[] = [{ name: 'Ana', pairsFound: 4 }, { name: 'Beto', pairsFound: 4 }]

describe('CONTRACT: auto-redirect após 3000ms (solo only)', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('não chama onBackToMenu antes de 3000ms em modo solo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={onBackToMenu} />)
    act(() => { vi.advanceTimersByTime(2999) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })

  it('chama onBackToMenu exatamente uma vez após 3000ms em modo solo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={onBackToMenu} />)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })

  it('timer é cancelado se componente desmonta (sem memory leak)', () => {
    const onBackToMenu = vi.fn()
    const { unmount } = render(
      <GameOver moves={10} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={onBackToMenu} />
    )
    unmount()
    act(() => { vi.advanceTimersByTime(3000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })

  it('NÃO chama onBackToMenu automaticamente em modo duo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={onBackToMenu} />)
    act(() => { vi.advanceTimersByTime(10000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })
})

describe('CONTRACT: auto-redirect ausente em modo duo', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('duo com vencedor — sem redirect após qualquer tempo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={onBackToMenu} />)
    act(() => { vi.advanceTimersByTime(60000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })

  it('duo em empate — sem redirect após qualquer tempo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoTie} onRestart={vi.fn()} onBackToMenu={onBackToMenu} />)
    act(() => { vi.advanceTimersByTime(60000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })
})

describe('GameOver — modo solo', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('exibe o nome do jogador no lugar de "Malu"', () => {
    render(<GameOver moves={10} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={vi.fn()} />)
    expect(screen.getByText('Parabéns, Bea!')).toBeInTheDocument()
  })

  it('exibe a contagem de moves', () => {
    render(<GameOver moves={42} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={vi.fn()} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('botão "Jogar de novo" chama onRestart', () => {
    const onRestart = vi.fn()
    render(<GameOver moves={5} players={soloPlayer} onRestart={onRestart} onBackToMenu={vi.fn()} />)
    fireEvent.click(screen.getByText('Jogar de novo'))
    expect(onRestart).toHaveBeenCalledTimes(1)
  })
})

describe('GameOver — modo duo', () => {
  it('exibe o nome do vencedor quando há um ganhador', () => {
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={vi.fn()} />)
    expect(screen.getByText('Ana ganhou!')).toBeInTheDocument()
  })

  it('exibe "Empate!" quando os pontos são iguais', () => {
    render(<GameOver moves={10} players={duoTie} onRestart={vi.fn()} onBackToMenu={vi.fn()} />)
    expect(screen.getByText('Empate!')).toBeInTheDocument()
  })

  it('exibe o placar dos dois jogadores', () => {
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={vi.fn()} />)
    expect(screen.getByText(/Ana/)).toBeInTheDocument()
    expect(screen.getByText(/Beto/)).toBeInTheDocument()
  })

  it('botão "Jogar de novo" chama onRestart em modo duo', () => {
    const onRestart = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={onRestart} onBackToMenu={vi.fn()} />)
    fireEvent.click(screen.getByText('Jogar de novo'))
    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('botão "Menu" chama onBackToMenu em modo duo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={onBackToMenu} />)
    fireEvent.click(screen.getByText('Menu'))
    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run tests — new tests should fail**

Run: `npm run test src/games/memory/components/GameOver.test.tsx 2>&1 | tail -20`

Expected: duo and name tests fail.

- [ ] **Step 3: Replace GameOver.tsx**

```tsx
import { useEffect } from 'react'
import type { Player } from '../game/types'
import styles from './GameOver.module.css'

type Props = {
  moves: number
  players: Player[]
  onRestart: () => void
  onBackToMenu: () => void
}

export function GameOver({ moves, players, onRestart, onBackToMenu }: Props) {
  const isDuo = players.length > 1

  useEffect(() => {
    if (isDuo) return
    const timer = setTimeout(onBackToMenu, 3000)
    return () => clearTimeout(timer)
  }, [onBackToMenu, isDuo])

  if (isDuo) {
    const winner =
      players[0].pairsFound > players[1].pairsFound
        ? players[0]
        : players[1].pairsFound > players[0].pairsFound
          ? players[1]
          : null

    return (
      <div className={styles.overlay}>
        <div className={styles.card}>
          <div className={styles.emoji}>{winner ? '🏆' : '🎉'}</div>
          <h2 className={styles.title}>
            {winner ? `${winner.name} ganhou!` : 'Empate!'}
          </h2>
          <div className={styles.scores}>
            {players.map((p, i) => (
              <p key={i} className={styles.scoreRow}>
                {p.name}: <strong>{p.pairsFound}</strong> {p.pairsFound === 1 ? 'par' : 'pares'}
              </p>
            ))}
          </div>
          <div className={styles.buttons}>
            <button className={styles.button} onClick={onRestart}>Jogar de novo</button>
            <button className={styles.buttonSecondary} onClick={onBackToMenu}>Menu</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.confetti} aria-hidden="true">
          {['🌟', '✨', '🎊', '⭐', '💫', '🌈', '🎉', '🦋'].map((e, i) => (
            <span key={i} className={styles.confettiPiece} style={{ '--ci': i } as React.CSSProperties}>
              {e}
            </span>
          ))}
        </div>
        <div className={styles.emoji}>🎉</div>
        <h2 className={styles.title}>Parabéns, {players[0].name}!</h2>
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

- [ ] **Step 4: Add new CSS rules to GameOver.module.css**

Append to the end of `src/games/memory/components/GameOver.module.css`:

```css
/* Duo scoreboard */

.scores {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.scoreRow {
  font-size: 1rem;
  color: #7c3aed;
  margin: 0;
}

/* Duo button group */

.buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.5rem;
}

.buttonSecondary {
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(192, 132, 252, 0.3);
  border-radius: 14px;
  color: #7c3aed;
  font-size: 1rem;
  font-weight: 700;
  padding: 0.75rem 1.75rem;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}

.buttonSecondary:hover {
  opacity: 0.85;
}
```

- [ ] **Step 5: Run all tests — all should pass**

Run: `npm run test 2>&1 | tail -15`

Expected: all test files pass, no failures.

- [ ] **Step 6: Verify full TypeScript build**

Run: `npm run build 2>&1 | tail -10`

Expected: build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/games/memory/components/GameOver.tsx src/games/memory/components/GameOver.module.css src/games/memory/components/GameOver.test.tsx
git commit -m "feat: contextual GameOver for solo/duo, no auto-redirect in duo"
```

---

## Final check

- [ ] **Run full test suite**

Run: `npm run test 2>&1`

Expected output (approximate):
```
✓ src/games/memory/assets/decks/decks.test.ts
✓ src/games/memory/game/engine.test.ts
✓ src/games/memory/game/useGame.test.ts   (if present)
✓ src/games/memory/components/GameOver.test.tsx
✓ src/games/memory/components/GameHeader.test.tsx
✓ src/games/memory/components/Settings.test.tsx
All tests passed
```

- [ ] **Smoke test in browser**

Run: `npm run dev`

Verify manually:
1. Default: solo mode, "Jogador 1" plays, name shown in header and game-over screen
2. Settings → toggle "2 Jogadores" → both name fields visible → save → play
3. Duo: header shows both scores; active player underlined; "Vez de: X" updates on misses
4. Duo match → same player keeps turn; miss → turn passes
5. Duo game over → correct winner or "Empate!"; no auto-redirect
6. Solo game over → player name shown; auto-redirects after 3s

---

## Task 9: Register new CONTRACTs in CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

The `CONTRACT: ...` test blocks added in Tasks 3 and 8 introduce new invariants. They must be registered in CLAUDE.md so future AI agents know they exist and must not be weakened.

- [ ] **Step 1: Add new contracts to the "Contratos de regressão" section in CLAUDE.md**

Find the existing `## Contratos de regressão (CONTRACT tests)` section and append the new entries to the list of known contracts:

```markdown
## Contratos de regressão (CONTRACT tests)

Blocos de teste nomeados `CONTRACT: ...` são invariantes do jogo.

**Regras para agentes de IA:**
- Nunca delete ou enfraqueça um bloco `CONTRACT: ...`
- Se sua implementação causar falha em um CONTRACT, pare e reporte o conflito — não altere o teste
- Para mudar um contrato intencionalmente, o humano deve instruir explicitamente (ex: "Mude o CONTRACT do delay para 500ms")
- Novos invariantes descobertos podem receber seu próprio bloco `CONTRACT: ...`

**Contratos ativos:**

| Arquivo | Contrato | Invariante |
|---|---|---|
| `GameOver.test.tsx` | `CONTRACT: auto-redirect após 3000ms` | Solo redireciona ao menu após 3s; o timer é cancelado se o componente desmonta |
| `engine.test.ts` | `CONTRACT: acerto mantém a vez` | Após par encontrado, `currentPlayerIndex` não avança — em solo ou duo |
| `engine.test.ts` | `CONTRACT: erro passa a vez` | Após erro, `currentPlayerIndex` avança (com wrap); em solo permanece 0 |
| `engine.test.ts` | `CONTRACT: placar isolado por jogador` | Só o jogador atual recebe ponto; erro não concede pontos a ninguém |
| `GameOver.test.tsx` | `CONTRACT: auto-redirect ausente em modo duo` | Tela de fim de jogo duo nunca chama `onBackToMenu` automaticamente |
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: register multiplayer CONTRACT tests in CLAUDE.md"
```
