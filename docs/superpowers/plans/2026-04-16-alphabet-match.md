# Alphabet Match Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Alphabet Match game (letter-to-animal matching) and the platform module (game selector, top bar, exit confirmation) for the malu-games project.

**Architecture:** New game module at `frontend/src/games/alphabet-match/` following the same engine/hook/components separation as the memory game. New platform module at `frontend/src/platform/` for cross-game navigation. `App.tsx` refactored to orchestrate game selection.

**Tech Stack:** React 18, TypeScript, CSS Modules, Vitest, Web Audio API

---

## File Map

### New files — Platform

| File | Responsibility |
|------|---------------|
| `frontend/src/platform/components/TopBar.tsx` | Fixed top bar with "Malu Games" text, click triggers exit confirmation when inside a game |
| `frontend/src/platform/components/TopBar.module.css` | Styles for top bar |
| `frontend/src/platform/components/ExitConfirmPopup.tsx` | "Quer sair do jogo?" popup with icon+text buttons |
| `frontend/src/platform/components/ExitConfirmPopup.module.css` | Styles for exit popup |
| `frontend/src/platform/components/GameSelector.tsx` | Home screen with game cards |
| `frontend/src/platform/components/GameSelector.module.css` | Styles for game selector |

### New files — Alphabet Match

| File | Responsibility |
|------|---------------|
| `frontend/src/games/alphabet-match/game/types.ts` | Animal, Round, GameState, GameConfig types |
| `frontend/src/games/alphabet-match/game/engine.ts` | Pure functions: buildAvailableLetters, createGame, checkAnswer, recordAttempt, completeRound, advanceRound |
| `frontend/src/games/alphabet-match/game/engine.test.ts` | Unit tests for engine |
| `frontend/src/games/alphabet-match/game/useGame.ts` | Hook: state + actions (selectAnimal, dismissFeedback, restart) |
| `frontend/src/games/alphabet-match/game/useSounds.ts` | Web Audio API sounds (correct, wrong, victory) |
| `frontend/src/games/alphabet-match/assets/animals.ts` | Animal catalog: id, label, imagePath, firstLetter for all 56 animals |
| `frontend/src/games/alphabet-match/components/GameHeader.tsx` | Progress display ("Turno 2 de 5") |
| `frontend/src/games/alphabet-match/components/GameHeader.module.css` | Styles |
| `frontend/src/games/alphabet-match/components/RoundScreen.tsx` | Letter display + 2x2 animal image grid |
| `frontend/src/games/alphabet-match/components/RoundScreen.module.css` | Styles |
| `frontend/src/games/alphabet-match/components/FeedbackPopup.tsx` | Error feedback: animal image + "Esse é o **G**ato!" + retry button |
| `frontend/src/games/alphabet-match/components/FeedbackPopup.module.css` | Styles |
| `frontend/src/games/alphabet-match/components/GameOver.tsx` | End screen: congratulations + total attempts + action buttons |
| `frontend/src/games/alphabet-match/components/GameOver.module.css` | Styles |
| `frontend/src/games/alphabet-match/AlphabetMatchGame.tsx` | Root component that wires hook to UI components |

### Modified files

| File | Change |
|------|--------|
| `frontend/src/App.tsx` | Add `selectedGame` state, render TopBar + GameSelector/Memory/AlphabetMatch |
| `frontend/src/App.css` | Add `.appWithTopBar` padding to account for fixed TopBar |
| `frontend/src/games/memory/components/GameOver.tsx` | Replace "Voltar ao menu" with "Jogar novamente" + "Outro jogo" buttons with icons |

---

### Task 1: Types and Animal Catalog

**Files:**
- Create: `frontend/src/games/alphabet-match/game/types.ts`
- Create: `frontend/src/games/alphabet-match/assets/animals.ts`

- [ ] **Step 1: Create types file**

```ts
// frontend/src/games/alphabet-match/game/types.ts

export type Animal = {
  id: string
  label: string
  imagePath: string
  firstLetter: string
}

export type Round = {
  letter: string
  correctAnimal: Animal
  options: Animal[]
  attempts: number
  completed: boolean
}

export type GameState = {
  rounds: Round[]
  currentRoundIndex: number
  totalAttempts: number
  isComplete: boolean
}

export type GameConfig = {
  totalRounds: number
  animals: Animal[]
}
```

- [ ] **Step 2: Create animal catalog**

Create `frontend/src/games/alphabet-match/assets/animals.ts` with all 56 animals. Each entry maps the jpeg filename to its metadata. The `imagePath` uses a dynamic import pattern via Vite's asset handling.

```ts
// frontend/src/games/alphabet-match/assets/animals.ts

import type { Animal } from '../game/types'

import abelha from './animals/abelha.jpeg'
import aguia from './animals/aguia.jpeg'
import alce from './animals/alce.jpeg'
import baleia from './animals/baleia.jpeg'
import beijaFlor from './animals/beija-flor.jpeg'
import besouro from './animals/besouro.jpeg'
import borboleta from './animals/borboleta.jpeg'
import burro from './animals/burro.jpeg'
import cachorro from './animals/cachorro.jpeg'
import cavalo from './animals/cavalo.jpeg'
import cobra from './animals/cobra.jpeg'
import coelho from './animals/coelho.jpeg'
import dinossauro from './animals/dinossauro.jpeg'
import elefante from './animals/elefante.jpeg'
import esquilo from './animals/esquilo.jpeg'
import estrelaDoMar from './animals/estrela-do-mar.jpeg'
import flamingo from './animals/flamingo.jpeg'
import foca from './animals/foca.jpeg'
import formiga from './animals/formiga.jpeg'
import gato from './animals/gato.jpeg'
import girafa from './animals/girafa.jpeg'
import hamster from './animals/hamster.jpeg'
import hiena from './animals/hiena.jpeg'
import hipopotamo from './animals/hipopotamo.jpeg'
import iguana from './animals/iguana.jpeg'
import jacare from './animals/jacaré.jpeg'
import joaninha from './animals/joaninha.jpeg'
import leao from './animals/leao.jpeg'
import lobo from './animals/lobo.jpeg'
import lontra from './animals/lontra.jpeg'
import macaco from './animals/macaco.jpeg'
import minhoca from './animals/minhoca.jpeg'
import morcego from './animals/morcego.jpeg'
import mosquito from './animals/mosquito.jpeg'
import onca from './animals/onça.jpeg'
import ornitorrinco from './animals/ornitorrinco.jpeg'
import ovelha from './animals/ovelha.jpeg'
import pato from './animals/pato.jpeg'
import peixe from './animals/peixe.jpeg'
import porco from './animals/porco.jpeg'
import quati from './animals/quati.jpeg'
import queroQuero from './animals/quero-quero.jpeg'
import raposa from './animals/raposa.jpeg'
import rato from './animals/rato.jpeg'
import rinoceronte from './animals/rinoceronte.jpeg'
import sapo from './animals/sapo.jpeg'
import suricato from './animals/suricato.jpeg'
import tartaruga from './animals/tartaruga.jpeg'
import tigre from './animals/tigre.jpeg'
import touro from './animals/touro.jpeg'
import tucanucu from './animals/tucanuçu.jpeg'
import urso from './animals/urso.jpeg'
import urubu from './animals/urubu.jpeg'
import vaca from './animals/vaca.jpeg'
import veado from './animals/veado.jpeg'
import zebra from './animals/zebra.jpeg'

export const ANIMALS: Animal[] = [
  { id: 'abelha',        label: 'Abelha',        imagePath: abelha,        firstLetter: 'A' },
  { id: 'aguia',         label: 'Águia',         imagePath: aguia,         firstLetter: 'A' },
  { id: 'alce',          label: 'Alce',          imagePath: alce,          firstLetter: 'A' },
  { id: 'baleia',        label: 'Baleia',        imagePath: baleia,        firstLetter: 'B' },
  { id: 'beija-flor',    label: 'Beija-flor',    imagePath: beijaFlor,    firstLetter: 'B' },
  { id: 'besouro',       label: 'Besouro',       imagePath: besouro,       firstLetter: 'B' },
  { id: 'borboleta',     label: 'Borboleta',     imagePath: borboleta,     firstLetter: 'B' },
  { id: 'burro',         label: 'Burro',         imagePath: burro,         firstLetter: 'B' },
  { id: 'cachorro',      label: 'Cachorro',      imagePath: cachorro,      firstLetter: 'C' },
  { id: 'cavalo',        label: 'Cavalo',        imagePath: cavalo,        firstLetter: 'C' },
  { id: 'cobra',         label: 'Cobra',         imagePath: cobra,         firstLetter: 'C' },
  { id: 'coelho',        label: 'Coelho',        imagePath: coelho,        firstLetter: 'C' },
  { id: 'dinossauro',    label: 'Dinossauro',    imagePath: dinossauro,    firstLetter: 'D' },
  { id: 'elefante',      label: 'Elefante',      imagePath: elefante,      firstLetter: 'E' },
  { id: 'esquilo',       label: 'Esquilo',       imagePath: esquilo,       firstLetter: 'E' },
  { id: 'estrela-do-mar',label: 'Estrela-do-mar',imagePath: estrelaDoMar, firstLetter: 'E' },
  { id: 'flamingo',      label: 'Flamingo',      imagePath: flamingo,      firstLetter: 'F' },
  { id: 'foca',          label: 'Foca',          imagePath: foca,          firstLetter: 'F' },
  { id: 'formiga',       label: 'Formiga',       imagePath: formiga,       firstLetter: 'F' },
  { id: 'gato',          label: 'Gato',          imagePath: gato,          firstLetter: 'G' },
  { id: 'girafa',        label: 'Girafa',        imagePath: girafa,        firstLetter: 'G' },
  { id: 'hamster',       label: 'Hamster',       imagePath: hamster,       firstLetter: 'H' },
  { id: 'hiena',         label: 'Hiena',         imagePath: hiena,         firstLetter: 'H' },
  { id: 'hipopotamo',    label: 'Hipopótamo',    imagePath: hipopotamo,    firstLetter: 'H' },
  { id: 'iguana',        label: 'Iguana',        imagePath: iguana,        firstLetter: 'I' },
  { id: 'jacare',        label: 'Jacaré',        imagePath: jacare,        firstLetter: 'J' },
  { id: 'joaninha',      label: 'Joaninha',      imagePath: joaninha,      firstLetter: 'J' },
  { id: 'leao',          label: 'Leão',          imagePath: leao,          firstLetter: 'L' },
  { id: 'lobo',          label: 'Lobo',          imagePath: lobo,          firstLetter: 'L' },
  { id: 'lontra',        label: 'Lontra',        imagePath: lontra,        firstLetter: 'L' },
  { id: 'macaco',        label: 'Macaco',        imagePath: macaco,        firstLetter: 'M' },
  { id: 'minhoca',       label: 'Minhoca',       imagePath: minhoca,       firstLetter: 'M' },
  { id: 'morcego',       label: 'Morcego',       imagePath: morcego,       firstLetter: 'M' },
  { id: 'mosquito',      label: 'Mosquito',      imagePath: mosquito,      firstLetter: 'M' },
  { id: 'onca',          label: 'Onça',          imagePath: onca,          firstLetter: 'O' },
  { id: 'ornitorrinco',  label: 'Ornitorrinco',  imagePath: ornitorrinco,  firstLetter: 'O' },
  { id: 'ovelha',        label: 'Ovelha',        imagePath: ovelha,        firstLetter: 'O' },
  { id: 'pato',          label: 'Pato',          imagePath: pato,          firstLetter: 'P' },
  { id: 'peixe',         label: 'Peixe',         imagePath: peixe,         firstLetter: 'P' },
  { id: 'porco',         label: 'Porco',         imagePath: porco,         firstLetter: 'P' },
  { id: 'quati',         label: 'Quati',         imagePath: quati,         firstLetter: 'Q' },
  { id: 'quero-quero',   label: 'Quero-quero',   imagePath: queroQuero,   firstLetter: 'Q' },
  { id: 'raposa',        label: 'Raposa',        imagePath: raposa,        firstLetter: 'R' },
  { id: 'rato',          label: 'Rato',          imagePath: rato,          firstLetter: 'R' },
  { id: 'rinoceronte',   label: 'Rinoceronte',   imagePath: rinoceronte,   firstLetter: 'R' },
  { id: 'sapo',          label: 'Sapo',          imagePath: sapo,          firstLetter: 'S' },
  { id: 'suricato',      label: 'Suricato',      imagePath: suricato,      firstLetter: 'S' },
  { id: 'tartaruga',     label: 'Tartaruga',     imagePath: tartaruga,     firstLetter: 'T' },
  { id: 'tigre',         label: 'Tigre',         imagePath: tigre,         firstLetter: 'T' },
  { id: 'touro',         label: 'Touro',         imagePath: touro,         firstLetter: 'T' },
  { id: 'tucanucu',      label: 'Tucanuçu',      imagePath: tucanucu,      firstLetter: 'T' },
  { id: 'urso',          label: 'Urso',          imagePath: urso,          firstLetter: 'U' },
  { id: 'urubu',         label: 'Urubu',         imagePath: urubu,         firstLetter: 'U' },
  { id: 'vaca',          label: 'Vaca',          imagePath: vaca,          firstLetter: 'V' },
  { id: 'veado',         label: 'Veado',         imagePath: veado,         firstLetter: 'V' },
  { id: 'zebra',         label: 'Zebra',         imagePath: zebra,         firstLetter: 'Z' },
]
```

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/games/alphabet-match/game/types.ts src/games/alphabet-match/assets/animals.ts
git commit -m "feat(alphabet-match): add types and animal catalog"
```

---

### Task 2: Engine — buildAvailableLetters

**Files:**
- Create: `frontend/src/games/alphabet-match/game/engine.ts`
- Create: `frontend/src/games/alphabet-match/game/engine.test.ts`

- [ ] **Step 1: Write the failing tests for buildAvailableLetters**

```ts
// frontend/src/games/alphabet-match/game/engine.test.ts

import { describe, it, expect } from 'vitest'
import { buildAvailableLetters } from './engine'
import type { Animal } from './types'

const makeAnimal = (id: string, label: string, firstLetter: string): Animal => ({
  id,
  label,
  imagePath: `/fake/${id}.jpeg`,
  firstLetter,
})

const sampleAnimals: Animal[] = [
  makeAnimal('abelha', 'Abelha', 'A'),
  makeAnimal('aguia', 'Águia', 'A'),
  makeAnimal('baleia', 'Baleia', 'B'),
  makeAnimal('cachorro', 'Cachorro', 'C'),
  makeAnimal('elefante', 'Elefante', 'E'),
]

describe('buildAvailableLetters', () => {
  it('returns distinct letters from the animal catalog', () => {
    const letters = buildAvailableLetters(sampleAnimals)
    expect(letters).toEqual(['A', 'B', 'C', 'E'])
  })

  it('returns empty array for empty catalog', () => {
    expect(buildAvailableLetters([])).toEqual([])
  })

  it('returns one letter when all animals share the same letter', () => {
    const animals = [
      makeAnimal('abelha', 'Abelha', 'A'),
      makeAnimal('aguia', 'Águia', 'A'),
    ]
    expect(buildAvailableLetters(animals)).toEqual(['A'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npx vitest run src/games/alphabet-match/game/engine.test.ts
```

Expected: FAIL — `buildAvailableLetters` not found.

- [ ] **Step 3: Implement buildAvailableLetters**

```ts
// frontend/src/games/alphabet-match/game/engine.ts

import type { Animal } from './types'

export function buildAvailableLetters(animals: Animal[]): string[] {
  const letters = new Set(animals.map(a => a.firstLetter))
  return [...letters].sort()
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npx vitest run src/games/alphabet-match/game/engine.test.ts
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
cd frontend
git add src/games/alphabet-match/game/engine.ts src/games/alphabet-match/game/engine.test.ts
git commit -m "feat(alphabet-match): add buildAvailableLetters with tests"
```

---

### Task 3: Engine — createGame

**Files:**
- Modify: `frontend/src/games/alphabet-match/game/engine.ts`
- Modify: `frontend/src/games/alphabet-match/game/engine.test.ts`

- [ ] **Step 1: Write the failing tests for createGame**

Add to `engine.test.ts`:

```ts
import { buildAvailableLetters, createGame } from './engine'
import type { Animal, GameConfig } from './types'

// ... existing makeAnimal and sampleAnimals ...

// Add more animals to have enough for 4 options per round
const fullCatalog: Animal[] = [
  makeAnimal('abelha', 'Abelha', 'A'),
  makeAnimal('aguia', 'Águia', 'A'),
  makeAnimal('alce', 'Alce', 'A'),
  makeAnimal('baleia', 'Baleia', 'B'),
  makeAnimal('burro', 'Burro', 'B'),
  makeAnimal('cachorro', 'Cachorro', 'C'),
  makeAnimal('cavalo', 'Cavalo', 'C'),
  makeAnimal('dinossauro', 'Dinossauro', 'D'),
  makeAnimal('elefante', 'Elefante', 'E'),
  makeAnimal('esquilo', 'Esquilo', 'E'),
  makeAnimal('flamingo', 'Flamingo', 'F'),
  makeAnimal('gato', 'Gato', 'G'),
  makeAnimal('hipopotamo', 'Hipopótamo', 'H'),
  makeAnimal('iguana', 'Iguana', 'I'),
  makeAnimal('jacare', 'Jacaré', 'J'),
  makeAnimal('leao', 'Leão', 'L'),
  makeAnimal('macaco', 'Macaco', 'M'),
  makeAnimal('onca', 'Onça', 'O'),
  makeAnimal('pato', 'Pato', 'P'),
  makeAnimal('raposa', 'Raposa', 'R'),
  makeAnimal('sapo', 'Sapo', 'S'),
]

const fullConfig: GameConfig = { totalRounds: 5, animals: fullCatalog }

describe('createGame', () => {
  it('creates the correct number of rounds', () => {
    const state = createGame(fullConfig)
    expect(state.rounds).toHaveLength(5)
  })

  it('each round has exactly 4 options', () => {
    const state = createGame(fullConfig)
    state.rounds.forEach(round => {
      expect(round.options).toHaveLength(4)
    })
  })

  it('each round has a correct animal whose firstLetter matches the round letter', () => {
    const state = createGame(fullConfig)
    state.rounds.forEach(round => {
      expect(round.correctAnimal.firstLetter).toBe(round.letter)
    })
  })

  it('the correct animal is included in the options', () => {
    const state = createGame(fullConfig)
    state.rounds.forEach(round => {
      const ids = round.options.map(o => o.id)
      expect(ids).toContain(round.correctAnimal.id)
    })
  })

  it('distractor animals have different first letters than the round letter', () => {
    const state = createGame(fullConfig)
    state.rounds.forEach(round => {
      const distractors = round.options.filter(o => o.id !== round.correctAnimal.id)
      distractors.forEach(d => {
        expect(d.firstLetter).not.toBe(round.letter)
      })
    })
  })

  it('all round letters are distinct (no repeated letters across rounds)', () => {
    const state = createGame(fullConfig)
    const letters = state.rounds.map(r => r.letter)
    expect(new Set(letters).size).toBe(letters.length)
  })

  it('starts with currentRoundIndex 0, totalAttempts 0, isComplete false', () => {
    const state = createGame(fullConfig)
    expect(state.currentRoundIndex).toBe(0)
    expect(state.totalAttempts).toBe(0)
    expect(state.isComplete).toBe(false)
  })

  it('each round starts with attempts 0 and completed false', () => {
    const state = createGame(fullConfig)
    state.rounds.forEach(round => {
      expect(round.attempts).toBe(0)
      expect(round.completed).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npx vitest run src/games/alphabet-match/game/engine.test.ts
```

Expected: FAIL — `createGame` not exported.

- [ ] **Step 3: Implement createGame**

Add to `engine.ts`:

```ts
import type { Animal, GameConfig, GameState, Round } from './types'

export function buildAvailableLetters(animals: Animal[]): string[] {
  const letters = new Set(animals.map(a => a.firstLetter))
  return [...letters].sort()
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function createGame(config: GameConfig): GameState {
  const { totalRounds, animals } = config
  const available = buildAvailableLetters(animals)
  const selectedLetters = shuffle(available).slice(0, totalRounds)

  const animalsByLetter = new Map<string, Animal[]>()
  for (const animal of animals) {
    const list = animalsByLetter.get(animal.firstLetter) ?? []
    list.push(animal)
    animalsByLetter.set(animal.firstLetter, list)
  }

  const rounds: Round[] = selectedLetters.map(letter => {
    const candidates = animalsByLetter.get(letter)!
    const correctAnimal = candidates[Math.floor(Math.random() * candidates.length)]

    const distractorPool = animals.filter(a => a.firstLetter !== letter)
    const distractors = shuffle(distractorPool).slice(0, 3)

    const options = shuffle([correctAnimal, ...distractors])

    return {
      letter,
      correctAnimal,
      options,
      attempts: 0,
      completed: false,
    }
  })

  return {
    rounds,
    currentRoundIndex: 0,
    totalAttempts: 0,
    isComplete: false,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npx vitest run src/games/alphabet-match/game/engine.test.ts
```

Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**

```bash
cd frontend
git add src/games/alphabet-match/game/engine.ts src/games/alphabet-match/game/engine.test.ts
git commit -m "feat(alphabet-match): add createGame with tests"
```

---

### Task 4: Engine — checkAnswer, recordAttempt, completeRound, advanceRound

**Files:**
- Modify: `frontend/src/games/alphabet-match/game/engine.ts`
- Modify: `frontend/src/games/alphabet-match/game/engine.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `engine.test.ts`:

```ts
import {
  buildAvailableLetters,
  createGame,
  checkAnswer,
  recordAttempt,
  completeRound,
  advanceRound,
} from './engine'
import type { Animal, GameConfig, GameState, Round } from './types'

// ... existing helpers ...

function makeRound(overrides?: Partial<Round>): Round {
  return {
    letter: 'E',
    correctAnimal: makeAnimal('elefante', 'Elefante', 'E'),
    options: [
      makeAnimal('elefante', 'Elefante', 'E'),
      makeAnimal('gato', 'Gato', 'G'),
      makeAnimal('baleia', 'Baleia', 'B'),
      makeAnimal('raposa', 'Raposa', 'R'),
    ],
    attempts: 0,
    completed: false,
    ...overrides,
  }
}

function makeGameState(overrides?: Partial<GameState>): GameState {
  return {
    rounds: [
      makeRound(),
      makeRound({ letter: 'G', correctAnimal: makeAnimal('gato', 'Gato', 'G') }),
      makeRound({ letter: 'B', correctAnimal: makeAnimal('baleia', 'Baleia', 'B') }),
    ],
    currentRoundIndex: 0,
    totalAttempts: 0,
    isComplete: false,
    ...overrides,
  }
}

describe('checkAnswer', () => {
  it('returns correct: true when the selected animal is the correct one', () => {
    const state = makeGameState()
    const result = checkAnswer(state, 'elefante')
    expect(result.correct).toBe(true)
    expect(result.selectedAnimal.id).toBe('elefante')
  })

  it('returns correct: false when the selected animal is wrong', () => {
    const state = makeGameState()
    const result = checkAnswer(state, 'gato')
    expect(result.correct).toBe(false)
    expect(result.selectedAnimal.id).toBe('gato')
  })
})

describe('recordAttempt', () => {
  it('increments attempts on the current round', () => {
    const state = makeGameState()
    const next = recordAttempt(state)
    expect(next.rounds[0].attempts).toBe(1)
  })

  it('increments totalAttempts', () => {
    const state = makeGameState()
    const next = recordAttempt(state)
    expect(next.totalAttempts).toBe(1)
  })

  it('does not modify other rounds', () => {
    const state = makeGameState()
    const next = recordAttempt(state)
    expect(next.rounds[1].attempts).toBe(0)
    expect(next.rounds[2].attempts).toBe(0)
  })
})

describe('completeRound', () => {
  it('marks the current round as completed', () => {
    const state = makeGameState()
    const next = completeRound(state)
    expect(next.rounds[0].completed).toBe(true)
  })

  it('does not modify other rounds', () => {
    const state = makeGameState()
    const next = completeRound(state)
    expect(next.rounds[1].completed).toBe(false)
  })
})

describe('advanceRound', () => {
  it('advances currentRoundIndex by 1', () => {
    const state = makeGameState()
    const next = advanceRound(completeRound(state))
    expect(next.currentRoundIndex).toBe(1)
  })

  it('sets isComplete to true when advancing past the last round', () => {
    const state = makeGameState({ currentRoundIndex: 2 })
    const next = advanceRound(completeRound(state))
    expect(next.isComplete).toBe(true)
  })

  it('does not set isComplete when there are more rounds', () => {
    const state = makeGameState({ currentRoundIndex: 0 })
    const next = advanceRound(completeRound(state))
    expect(next.isComplete).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npx vitest run src/games/alphabet-match/game/engine.test.ts
```

Expected: FAIL — `checkAnswer`, `recordAttempt`, `completeRound`, `advanceRound` not exported.

- [ ] **Step 3: Implement the four functions**

Add to `engine.ts`:

```ts
export function checkAnswer(
  state: GameState,
  animalId: string,
): { correct: boolean; selectedAnimal: Animal } {
  const round = state.rounds[state.currentRoundIndex]
  const selectedAnimal = round.options.find(a => a.id === animalId)!
  const correct = round.correctAnimal.id === animalId
  return { correct, selectedAnimal }
}

export function recordAttempt(state: GameState): GameState {
  const idx = state.currentRoundIndex
  const rounds = state.rounds.map((r, i) =>
    i === idx ? { ...r, attempts: r.attempts + 1 } : r,
  )
  return { ...state, rounds, totalAttempts: state.totalAttempts + 1 }
}

export function completeRound(state: GameState): GameState {
  const idx = state.currentRoundIndex
  const rounds = state.rounds.map((r, i) =>
    i === idx ? { ...r, completed: true } : r,
  )
  return { ...state, rounds }
}

export function advanceRound(state: GameState): GameState {
  const nextIndex = state.currentRoundIndex + 1
  const isComplete = nextIndex >= state.rounds.length
  return { ...state, currentRoundIndex: nextIndex, isComplete }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npx vitest run src/games/alphabet-match/game/engine.test.ts
```

Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**

```bash
cd frontend
git add src/games/alphabet-match/game/engine.ts src/games/alphabet-match/game/engine.test.ts
git commit -m "feat(alphabet-match): add checkAnswer, recordAttempt, completeRound, advanceRound"
```

---

### Task 5: useSounds hook

**Files:**
- Create: `frontend/src/games/alphabet-match/game/useSounds.ts`

- [ ] **Step 1: Create useSounds**

Follows the same pattern as the memory game's `useSounds.ts` but with sounds appropriate for this game:

```ts
// frontend/src/games/alphabet-match/game/useSounds.ts

import { useCallback, useRef } from 'react'

function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx = (window.AudioContext ?? (window as unknown as Record<string, typeof AudioContext>)['webkitAudioContext'])
  return new AudioCtx()
}

function playTone(ctx: AudioContext, freq: number, type: OscillatorType, duration: number, gain = 0.18) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  gainNode.gain.setValueAtTime(gain, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext()
    }
    return ctxRef.current
  }, [])

  const playCorrect = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    playTone(ctx, 523, 'sine', 0.2, 0.2)
    setTimeout(() => playTone(ctx, 659, 'sine', 0.2, 0.22), 100)
    setTimeout(() => playTone(ctx, 784, 'sine', 0.3, 0.24), 200)
  }, [getCtx])

  const playWrong = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    playTone(ctx, 330, 'sine', 0.25, 0.12)
  }, [getCtx])

  const playVictory = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(ctx, freq, 'sine', 0.35, 0.25), i * 120)
    })
  }, [getCtx])

  return { playCorrect, playWrong, playVictory }
}
```

- [ ] **Step 2: Commit**

```bash
cd frontend
git add src/games/alphabet-match/game/useSounds.ts
git commit -m "feat(alphabet-match): add useSounds hook"
```

---

### Task 6: useGame hook

**Files:**
- Create: `frontend/src/games/alphabet-match/game/useGame.ts`

- [ ] **Step 1: Create useGame hook**

```ts
// frontend/src/games/alphabet-match/game/useGame.ts

import { useState, useCallback } from 'react'
import { createGame, checkAnswer, recordAttempt, completeRound, advanceRound } from './engine'
import type { Animal, GameConfig, GameState } from './types'
import { useSounds } from './useSounds'

type FeedbackState = {
  animal: Animal
} | null

export function useGame(config: GameConfig) {
  const [state, setState] = useState<GameState>(() => createGame(config))
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [showCorrect, setShowCorrect] = useState(false)

  const { playCorrect, playWrong, playVictory } = useSounds()

  const currentRound = state.rounds[state.currentRoundIndex] ?? null

  const selectAnimal = useCallback((animalId: string) => {
    if (feedback || showCorrect) return

    setState(prev => {
      const result = checkAnswer(prev, animalId)

      if (result.correct) {
        playCorrect()
        setShowCorrect(true)
        const withAttempt = recordAttempt(prev)
        const completed = completeRound(withAttempt)

        setTimeout(() => {
          setState(s => {
            const next = advanceRound(s)
            if (next.isComplete) playVictory()
            return next
          })
          setShowCorrect(false)
        }, 1500)

        return completed
      }

      playWrong()
      setFeedback({ animal: result.selectedAnimal })
      return recordAttempt(prev)
    })
  }, [feedback, showCorrect, playCorrect, playWrong, playVictory])

  const dismissFeedback = useCallback(() => {
    setFeedback(null)
  }, [])

  const restart = useCallback(() => {
    setState(createGame(config))
    setFeedback(null)
    setShowCorrect(false)
  }, [config])

  return {
    state,
    currentRound,
    feedback,
    showCorrect,
    selectAnimal,
    dismissFeedback,
    restart,
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd frontend
git add src/games/alphabet-match/game/useGame.ts
git commit -m "feat(alphabet-match): add useGame hook"
```

---

### Task 7: GameHeader component

**Files:**
- Create: `frontend/src/games/alphabet-match/components/GameHeader.tsx`
- Create: `frontend/src/games/alphabet-match/components/GameHeader.module.css`

- [ ] **Step 1: Create GameHeader component**

```tsx
// frontend/src/games/alphabet-match/components/GameHeader.tsx

import styles from './GameHeader.module.css'

type Props = {
  currentRound: number
  totalRounds: number
}

export function GameHeader({ currentRound, totalRounds }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.progress}>
        <span className={styles.label}>Turno</span>
        <span className={styles.value}>{currentRound} de {totalRounds}</span>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create GameHeader CSS**

```css
/* frontend/src/games/alphabet-match/components/GameHeader.module.css */

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 0.75rem 1.25rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.progress {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #9333ea;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #581c87;
  line-height: 1;
}
```

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/games/alphabet-match/components/GameHeader.tsx src/games/alphabet-match/components/GameHeader.module.css
git commit -m "feat(alphabet-match): add GameHeader component"
```

---

### Task 8: RoundScreen component

**Files:**
- Create: `frontend/src/games/alphabet-match/components/RoundScreen.tsx`
- Create: `frontend/src/games/alphabet-match/components/RoundScreen.module.css`

- [ ] **Step 1: Create RoundScreen component**

```tsx
// frontend/src/games/alphabet-match/components/RoundScreen.tsx

import type { Round } from '../game/types'
import styles from './RoundScreen.module.css'

type Props = {
  round: Round
  showCorrect: boolean
  onSelect: (animalId: string) => void
}

export function RoundScreen({ round, showCorrect, onSelect }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.letterCard}>
        <span className={styles.letter}>{round.letter}</span>
      </div>
      <div className={styles.grid}>
        {round.options.map(animal => {
          const isCorrect = animal.id === round.correctAnimal.id
          return (
            <button
              key={animal.id}
              className={`${styles.option} ${showCorrect && isCorrect ? styles.correct : ''}`}
              onClick={() => onSelect(animal.id)}
              disabled={showCorrect}
            >
              <img
                src={animal.imagePath}
                alt={animal.label}
                className={styles.image}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create RoundScreen CSS**

```css
/* frontend/src/games/alphabet-match/components/RoundScreen.module.css */

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 480px;
}

.letterCard {
  background: rgba(255, 255, 255, 0.85);
  border: 3px solid rgba(192, 132, 252, 0.3);
  border-radius: 24px;
  padding: 1.5rem 2.5rem;
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.15);
}

.letter {
  font-size: clamp(4rem, 12vw, 6rem);
  font-weight: 900;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 380px;
}

.option {
  background: rgba(255, 255, 255, 0.85);
  border: 3px solid rgba(192, 132, 252, 0.2);
  border-radius: 20px;
  padding: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.1);
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.22);
  border-color: #c084fc;
}

.option:active:not(:disabled) {
  transform: scale(0.96);
}

.option:disabled {
  cursor: default;
}

.option.correct {
  border-color: #22c55e;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
  animation: glow 0.6s ease;
}

@keyframes glow {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}
```

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/games/alphabet-match/components/RoundScreen.tsx src/games/alphabet-match/components/RoundScreen.module.css
git commit -m "feat(alphabet-match): add RoundScreen component"
```

---

### Task 9: FeedbackPopup component

**Files:**
- Create: `frontend/src/games/alphabet-match/components/FeedbackPopup.tsx`
- Create: `frontend/src/games/alphabet-match/components/FeedbackPopup.module.css`

- [ ] **Step 1: Create FeedbackPopup component**

```tsx
// frontend/src/games/alphabet-match/components/FeedbackPopup.tsx

import type { Animal } from '../game/types'
import styles from './FeedbackPopup.module.css'

type Props = {
  animal: Animal
  onDismiss: () => void
}

export function FeedbackPopup({ animal, onDismiss }: Props) {
  const firstLetter = animal.label.charAt(0)
  const rest = animal.label.slice(1)

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <img
          src={animal.imagePath}
          alt={animal.label}
          className={styles.image}
        />
        <p className={styles.text}>
          Esse é o <span className={styles.highlight}>{firstLetter}</span>{rest}!
        </p>
        <button className={styles.button} onClick={onDismiss}>
          🔄 Tentar novamente
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create FeedbackPopup CSS**

```css
/* frontend/src/games/alphabet-match/components/FeedbackPopup.module.css */

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
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 320px;
  width: 90%;
}

.image {
  width: 140px;
  height: 140px;
  object-fit: contain;
  border-radius: 16px;
}

.text {
  font-size: 1.3rem;
  font-weight: 700;
  color: #374151;
}

.highlight {
  font-size: 1.6rem;
  font-weight: 900;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.button {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 1.1rem;
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

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/games/alphabet-match/components/FeedbackPopup.tsx src/games/alphabet-match/components/FeedbackPopup.module.css
git commit -m "feat(alphabet-match): add FeedbackPopup component"
```

---

### Task 10: GameOver component

**Files:**
- Create: `frontend/src/games/alphabet-match/components/GameOver.tsx`
- Create: `frontend/src/games/alphabet-match/components/GameOver.module.css`

- [ ] **Step 1: Create GameOver component**

```tsx
// frontend/src/games/alphabet-match/components/GameOver.tsx

import styles from './GameOver.module.css'

type Props = {
  totalAttempts: number
  totalRounds: number
  onRestart: () => void
  onBackToMenu: () => void
}

export function GameOver({ totalAttempts, totalRounds, onRestart, onBackToMenu }: Props) {
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
        <h2 className={styles.title}>Parabéns!</h2>
        <p className={styles.subtitle}>
          Você acertou {totalRounds} letras em <strong>{totalAttempts}</strong> {totalAttempts === 1 ? 'tentativa' : 'tentativas'}!
        </p>
        <div className={styles.buttons}>
          <button className={styles.button} onClick={onRestart}>
            🔄 Jogar novamente
          </button>
          <button className={styles.buttonSecondary} onClick={onBackToMenu}>
            🏠 Outro jogo
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create GameOver CSS**

Uses the same animation patterns as the memory game's GameOver:

```css
/* frontend/src/games/alphabet-match/components/GameOver.module.css */

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
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.card {
  position: relative;
  overflow: hidden;
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

.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confettiPiece {
  position: absolute;
  font-size: clamp(1rem, 3vw, 1.5rem);
  top: -10%;
  left: calc(var(--ci, 0) * 12.5% + 4%);
  animation: fall 1.8s ease-in calc(var(--ci, 0) * 120ms) both;
  opacity: 0;
}

@keyframes fall {
  0%   { opacity: 0; transform: translateY(0)    rotate(0deg)   scale(0.8); }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(320px) rotate(360deg) scale(1.1); }
}

.emoji {
  font-size: 4rem;
  line-height: 1;
  animation: emojiDance 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes emojiDance {
  0%   { transform: scale(0) rotate(-15deg); }
  60%  { transform: scale(1.3) rotate(8deg); }
  80%  { transform: scale(0.9) rotate(-4deg); }
  100% { transform: scale(1) rotate(0deg); }
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

.buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.5rem;
}

.button {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 1.1rem;
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

.buttonSecondary {
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(192, 132, 252, 0.3);
  border-radius: 14px;
  color: #7c3aed;
  font-size: 1.1rem;
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

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/games/alphabet-match/components/GameOver.tsx src/games/alphabet-match/components/GameOver.module.css
git commit -m "feat(alphabet-match): add GameOver component"
```

---

### Task 11: AlphabetMatchGame root component

**Files:**
- Create: `frontend/src/games/alphabet-match/AlphabetMatchGame.tsx`

- [ ] **Step 1: Create root component**

```tsx
// frontend/src/games/alphabet-match/AlphabetMatchGame.tsx

import { useGame } from './game/useGame'
import { GameHeader } from './components/GameHeader'
import { RoundScreen } from './components/RoundScreen'
import { FeedbackPopup } from './components/FeedbackPopup'
import { GameOver } from './components/GameOver'
import { ANIMALS } from './assets/animals'
import type { GameConfig } from './game/types'

const config: GameConfig = {
  totalRounds: 5,
  animals: ANIMALS,
}

type Props = {
  onBackToMenu: () => void
}

export function AlphabetMatchGame({ onBackToMenu }: Props) {
  const {
    state,
    currentRound,
    feedback,
    showCorrect,
    selectAnimal,
    dismissFeedback,
    restart,
  } = useGame(config)

  if (state.isComplete) {
    return (
      <GameOver
        totalAttempts={state.totalAttempts}
        totalRounds={state.rounds.length}
        onRestart={restart}
        onBackToMenu={onBackToMenu}
      />
    )
  }

  if (!currentRound) return null

  return (
    <main className="app">
      <GameHeader
        currentRound={state.currentRoundIndex + 1}
        totalRounds={state.rounds.length}
      />
      <RoundScreen
        round={currentRound}
        showCorrect={showCorrect}
        onSelect={selectAnimal}
      />
      {feedback && (
        <FeedbackPopup
          animal={feedback.animal}
          onDismiss={dismissFeedback}
        />
      )}
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd frontend
git add src/games/alphabet-match/AlphabetMatchGame.tsx
git commit -m "feat(alphabet-match): add AlphabetMatchGame root component"
```

---

### Task 12: Platform — TopBar and ExitConfirmPopup

**Files:**
- Create: `frontend/src/platform/components/TopBar.tsx`
- Create: `frontend/src/platform/components/TopBar.module.css`
- Create: `frontend/src/platform/components/ExitConfirmPopup.tsx`
- Create: `frontend/src/platform/components/ExitConfirmPopup.module.css`

- [ ] **Step 1: Create ExitConfirmPopup**

```tsx
// frontend/src/platform/components/ExitConfirmPopup.tsx

import styles from './ExitConfirmPopup.module.css'

type Props = {
  onConfirm: () => void
  onCancel: () => void
}

export function ExitConfirmPopup({ onConfirm, onCancel }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <p className={styles.title}>Quer sair do jogo?</p>
        <div className={styles.buttons}>
          <button className={styles.btnCancel} onClick={onCancel}>
            ❌ Não
          </button>
          <button className={styles.btnConfirm} onClick={onConfirm}>
            ✅ Sim
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ExitConfirmPopup CSS**

```css
/* frontend/src/platform/components/ExitConfirmPopup.module.css */

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog {
  background: #fff;
  border-radius: 20px;
  padding: 2rem 1.5rem;
  max-width: 320px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #374151;
  margin: 0 0 1.5rem;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btnCancel {
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(192, 132, 252, 0.3);
  border-radius: 14px;
  color: #374151;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
  flex: 1;
}

.btnCancel:hover {
  opacity: 0.85;
}

.btnConfirm {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
  transition: opacity 0.15s;
  flex: 1;
}

.btnConfirm:hover {
  opacity: 0.85;
}
```

- [ ] **Step 3: Create TopBar**

```tsx
// frontend/src/platform/components/TopBar.tsx

import { useState } from 'react'
import { ExitConfirmPopup } from './ExitConfirmPopup'
import styles from './TopBar.module.css'

type Props = {
  isInGame: boolean
  onExitGame: () => void
}

export function TopBar({ isInGame, onExitGame }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    if (!isInGame) return
    setShowConfirm(true)
  }

  return (
    <>
      <header className={styles.topBar}>
        <button
          className={`${styles.logo} ${isInGame ? styles.clickable : ''}`}
          onClick={handleClick}
          disabled={!isInGame}
        >
          🎮 Malu Games
        </button>
      </header>
      {showConfirm && (
        <ExitConfirmPopup
          onConfirm={() => {
            setShowConfirm(false)
            onExitGame()
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 4: Create TopBar CSS**

```css
/* frontend/src/platform/components/TopBar.module.css */

.topBar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(168, 85, 247, 0.1);
  z-index: 50;
}

.logo {
  background: none;
  border: none;
  font-size: 1.3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: inherit;
  cursor: default;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  transition: opacity 0.15s;
}

.logo.clickable {
  cursor: pointer;
}

.logo.clickable:hover {
  opacity: 0.7;
}
```

- [ ] **Step 5: Commit**

```bash
cd frontend
git add src/platform/
git commit -m "feat(platform): add TopBar and ExitConfirmPopup components"
```

---

### Task 13: Platform — GameSelector

**Files:**
- Create: `frontend/src/platform/components/GameSelector.tsx`
- Create: `frontend/src/platform/components/GameSelector.module.css`

- [ ] **Step 1: Create GameSelector component**

```tsx
// frontend/src/platform/components/GameSelector.tsx

import styles from './GameSelector.module.css'

export type GameId = 'memory' | 'alphabet-match'

type GameEntry = {
  id: GameId
  emoji: string
  name: string
}

const GAMES: GameEntry[] = [
  { id: 'memory', emoji: '🃏', name: 'Jogo da Memória' },
  { id: 'alphabet-match', emoji: '🔤', name: 'Alphabet Match' },
]

type Props = {
  onSelect: (gameId: GameId) => void
}

export function GameSelector({ onSelect }: Props) {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>🎮 Malu Games</h1>
      <p className={styles.subtitle}>Escolhe um jogo!</p>
      <div className={styles.grid}>
        {GAMES.map(game => (
          <button
            key={game.id}
            className={styles.card}
            onClick={() => onSelect(game.id)}
          >
            <span className={styles.emoji}>{game.emoji}</span>
            <span className={styles.name}>{game.name}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create GameSelector CSS**

```css
/* frontend/src/platform/components/GameSelector.module.css */

.container {
  min-height: calc(100dvh - 56px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  gap: 0.5rem;
}

.title {
  font-size: clamp(1.6rem, 5vw, 2.2rem);
  font-weight: 900;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  line-height: 1.2;
}

.subtitle {
  font-size: clamp(0.95rem, 3vw, 1.1rem);
  color: #c084fc;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 380px;
}

.card {
  background: rgba(255, 255, 255, 0.85);
  border: 2px solid rgba(192, 132, 252, 0.2);
  border-radius: 20px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.1);
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.22);
  border-color: #c084fc;
}

.card:active {
  transform: scale(0.96);
}

.emoji {
  font-size: clamp(2.4rem, 8vw, 3.2rem);
  line-height: 1;
}

.name {
  font-size: clamp(0.85rem, 2.5vw, 1rem);
  font-weight: 800;
  color: #374151;
}
```

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/platform/components/GameSelector.tsx src/platform/components/GameSelector.module.css
git commit -m "feat(platform): add GameSelector component"
```

---

### Task 14: Refactor App.tsx and update Memory GameOver

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/games/memory/components/GameOver.tsx`

- [ ] **Step 1: Update App.css to add top bar padding**

Replace the contents of `frontend/src/App.css`:

```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(1rem, 4vw, 2rem);
  padding-top: calc(56px + clamp(1rem, 4vw, 2rem));
  gap: 1.5rem;
}
```

- [ ] **Step 2: Update Memory GameOver to use icon+text buttons**

In `frontend/src/games/memory/components/GameOver.tsx`, the solo mode auto-redirects after 3s and shows "Jogar de novo". The duo mode shows "Jogar de novo" + "Menu". Update both to include icons and rename "Menu" to "Outro jogo":

Replace the solo mode return block (the second return, lines 52-73) with:

```tsx
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
        <div className={styles.buttons}>
          <button className={styles.button} onClick={onRestart}>
            🔄 Jogar de novo
          </button>
          <button className={styles.buttonSecondary} onClick={onBackToMenu}>
            🏠 Outro jogo
          </button>
        </div>
      </div>
    </div>
  )
```

Also update the duo mode buttons (lines 43-45) to:

```tsx
          <div className={styles.buttons}>
            <button className={styles.button} onClick={onRestart}>🔄 Jogar de novo</button>
            <button className={styles.buttonSecondary} onClick={onBackToMenu}>🏠 Outro jogo</button>
          </div>
```

Remove the `useEffect` auto-redirect timer (lines 15-19) since we now always show both buttons.

Remove the `useEffect` import if it's no longer needed. The final import line should be:

```ts
import type { Player } from '../game/types'
```

- [ ] **Step 3: Rewrite App.tsx**

Replace `frontend/src/App.tsx` with:

```tsx
import { useState } from 'react'
import { TopBar } from './platform/components/TopBar'
import { GameSelector, type GameId } from './platform/components/GameSelector'
import { useGame } from './games/memory/game/useGame'
import { Board } from './games/memory/components/Board'
import { GameHeader } from './games/memory/components/GameHeader'
import { GameOver } from './games/memory/components/GameOver'
import { DeckSelector } from './games/memory/components/DeckSelector'
import { Settings } from './games/memory/components/Settings'
import { DECKS } from './games/memory/assets/decks/decks'
import { AlphabetMatchGame } from './games/alphabet-match/AlphabetMatchGame'
import type { DeckConfig, PlayerMode } from './games/memory/game/types'
import './App.css'

const DEFAULT_PAIR_COUNT = 8
const DEFAULT_PLAYER_NAMES = ['Jogador 1', 'Jogador 2']

export function App() {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null)
  const [selectedDeck, setSelectedDeck] = useState<DeckConfig | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [pairCount, setPairCount] = useState(DEFAULT_PAIR_COUNT)
  const [playerMode, setPlayerMode] = useState<PlayerMode>('solo')
  const [playerNames, setPlayerNames] = useState<string[]>(DEFAULT_PLAYER_NAMES)

  const handleBackToMenu = () => {
    setSelectedGame(null)
    setSelectedDeck(null)
    setShowSettings(false)
  }

  return (
    <>
      <TopBar
        isInGame={selectedGame !== null}
        onExitGame={handleBackToMenu}
      />
      {selectedGame === null && (
        <GameSelector onSelect={setSelectedGame} />
      )}
      {selectedGame === 'memory' && (
        showSettings ? (
          <Settings
            pairCount={pairCount}
            onChangePairCount={setPairCount}
            playerMode={playerMode}
            playerNames={playerNames}
            onChangePlayerMode={setPlayerMode}
            onChangePlayerNames={setPlayerNames}
            onBack={() => setShowSettings(false)}
          />
        ) : !selectedDeck ? (
          <DeckSelector
            decks={DECKS}
            onSelect={setSelectedDeck}
            onOpenSettings={() => setShowSettings(true)}
          />
        ) : (
          <MemoryGame
            deck={selectedDeck}
            pairCount={pairCount}
            players={playerMode === 'duo' ? playerNames : [playerNames[0]]}
            onBackToMenu={handleBackToMenu}
          />
        )
      )}
      {selectedGame === 'alphabet-match' && (
        <AlphabetMatchGame onBackToMenu={handleBackToMenu} />
      )}
    </>
  )
}

function MemoryGame({
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

- [ ] **Step 4: Verify build compiles**

```bash
cd frontend && npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run all tests**

```bash
cd frontend && npx vitest run
```

Expected: all existing memory tests pass, all new alphabet-match engine tests pass.

- [ ] **Step 6: Commit**

```bash
cd frontend
git add src/App.tsx src/App.css src/games/memory/components/GameOver.tsx
git commit -m "feat: wire up platform navigation, alphabet match, and update memory GameOver"
```

---

### Task 15: Manual smoke test and final adjustments

- [ ] **Step 1: Start dev server**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Smoke test checklist**

Open the app in a browser and verify:

1. TopBar shows "Malu Games" at the top
2. GameSelector shows two cards: "Jogo da Memória" and "Alphabet Match"
3. Clicking "Jogo da Memória" opens the deck selector (existing flow works)
4. Going back: clicking "Malu Games" in TopBar shows exit confirm popup
5. Clicking "Alphabet Match" starts the game:
   - Letter is displayed prominently
   - 4 animal images shown in a 2x2 grid
   - Clicking wrong animal: FeedbackPopup shows with animal name and first letter highlighted
   - Clicking 🔄 dismisses popup, allows retry
   - Clicking correct animal: green glow, auto-advances after 1.5s
6. After 5 rounds: GameOver shows total attempts, "Jogar novamente" and "Outro jogo" buttons
7. "Outro jogo" goes back to GameSelector
8. Memory game GameOver also shows "Jogar de novo" and "Outro jogo" with icons
9. Sounds play on correct/wrong/victory

- [ ] **Step 3: Fix any visual or functional issues found during smoke test**

Make targeted fixes as needed. Each fix gets its own commit.

- [ ] **Step 4: Final commit (if adjustments were made)**

```bash
cd frontend
git add -u
git commit -m "fix: visual adjustments from smoke testing"
```

---

### Task 16: Vite asset declaration for JPEG imports

**Files:**
- Modify: `frontend/src/vite-env.d.ts`

This task ensures TypeScript recognizes `.jpeg` imports as valid modules returning string paths. Without this, the animal catalog imports in `animals.ts` will produce TS errors.

**Important:** This task should be done early (before Task 1's commit step) or at least before running `tsc`. Placing it here as a separate task for clarity, but the implementer should do it alongside Task 1.

- [ ] **Step 1: Check current vite-env.d.ts**

```bash
cat frontend/src/vite-env.d.ts
```

Expected: `/// <reference types="vite/client" />`

Vite's client types already include declarations for common image formats (`.png`, `.jpg`, `.jpeg`, `.svg`, etc.), so `.jpeg` imports should work out of the box. If `tsc` does error on the `.jpeg` imports, add this to `vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

declare module '*.jpeg' {
  const src: string
  export default src
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc -b --noEmit
```

Expected: no errors related to `.jpeg` imports.

- [ ] **Step 3: Commit (only if vite-env.d.ts was modified)**

```bash
cd frontend
git add src/vite-env.d.ts
git commit -m "chore: add jpeg module declaration for TypeScript"
```
