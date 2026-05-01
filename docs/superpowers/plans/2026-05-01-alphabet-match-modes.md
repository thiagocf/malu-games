# Alphabet Match Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mode-selection screen to Alphabet Match and implement a new `Ache a letra` mode where the child sees an animal image and chooses its starting letter.

**Architecture:** Keep one Alphabet Match entry in the main menu, then route to a new mode-selection screen before starting a match. Extend the existing animal round model with `letterOptions`, keep the current animal-selection mode intact, and add focused UI/hook paths for letter selection without generalizing decks yet.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, CSS Modules.

---

## File Structure

- Modify: `frontend/src/games/alphabet-match/game/types.ts`
  - Add `AlphabetMatchMode`.
  - Add `letterOptions` to `Round`.

- Modify: `frontend/src/games/alphabet-match/game/engine.ts`
  - Generate `letterOptions` for every round.
  - Add a pure `checkLetterAnswer` helper.

- Modify: `frontend/src/games/alphabet-match/game/engine.test.ts`
  - Cover letter option generation and letter-answer checking.

- Modify: `frontend/src/games/alphabet-match/game/useSounds.ts`
  - Add a wrong-letter speech helper and an animal-to-letter round intro helper.

- Modify: `frontend/src/games/alphabet-match/game/useGame.ts`
  - Accept `mode`.
  - Preserve animal-selection API for `letter-to-animal`.
  - Add selected-letter, blocked-letter, preview-animal-challenge, and confirm-letter API for `animal-to-letter`.

- Modify: `frontend/src/games/alphabet-match/game/useGame.test.ts`
  - Update helper to pass the current mode explicitly where needed.
  - Add hook tests for `animal-to-letter`.

- Create: `frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.tsx`
- Create: `frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.module.css`
- Create: `frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.test.tsx`
  - Render two mode cards and the back action.

- Create: `frontend/src/games/alphabet-match/components/LetterRoundScreen.tsx`
- Create: `frontend/src/games/alphabet-match/components/LetterRoundScreen.module.css`
- Create: `frontend/src/games/alphabet-match/components/LetterRoundScreen.test.tsx`
  - Render the animal image without name text, letter options, selected/blocked states, confirm behavior, and image audio replay.

- Create: `frontend/src/games/alphabet-match/components/LetterFeedbackPopup.tsx`
- Create: `frontend/src/games/alphabet-match/components/LetterFeedbackPopup.module.css`
- Create: `frontend/src/games/alphabet-match/components/LetterFeedbackPopup.test.tsx`
  - Render the wrong-letter explanation without showing the animal name.

- Modify: `frontend/src/games/alphabet-match/components/GameOver.tsx`
- Create or modify: `frontend/src/games/alphabet-match/components/GameOver.test.tsx`
  - Add `Trocar modo`.

- Modify: `frontend/src/platform/components/GameOverScreen.tsx`
  - Allow an optional third secondary action for `Trocar modo`.

- Modify: `frontend/src/games/alphabet-match/AlphabetMatchGame.tsx`
  - Receive `mode` and `onChangeMode`.
  - Render the proper round screen and feedback popup.

- Modify: `frontend/src/App.tsx`
  - Track selected Alphabet Match mode and render mode selection before the game.

---

### Task 1: Add Mode Types And Letter Options In The Engine

**Files:**
- Modify: `frontend/src/games/alphabet-match/game/types.ts`
- Modify: `frontend/src/games/alphabet-match/game/engine.ts`
- Modify: `frontend/src/games/alphabet-match/game/engine.test.ts`

- [ ] **Step 1: Add failing engine tests for letter options**

Append these tests inside the existing `describe('createGame', ...)` block in `frontend/src/games/alphabet-match/game/engine.test.ts`:

```ts
it('each round has exactly 4 letter options', () => {
  createGame(fullConfig).rounds.forEach(round => {
    expect(round.letterOptions).toHaveLength(4)
  })
})

it('letter options include the correct letter', () => {
  createGame(fullConfig).rounds.forEach(round => {
    expect(round.letterOptions).toContain(round.correctAnimal.firstLetter)
  })
})

it('letter options use distinct available catalog letters', () => {
  const availableLetters = buildAvailableLetters(fullCatalog)

  createGame(fullConfig).rounds.forEach(round => {
    expect(new Set(round.letterOptions).size).toBe(round.letterOptions.length)
    round.letterOptions.forEach(letter => {
      expect(availableLetters).toContain(letter)
    })
  })
})

it('letter distractors exclude the correct letter', () => {
  createGame(fullConfig).rounds.forEach(round => {
    const distractors = round.letterOptions.filter(letter => letter !== round.correctAnimal.firstLetter)
    expect(distractors).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Add failing tests for checking letter answers**

Update the import list in `engine.test.ts` to include `checkLetterAnswer`, then append:

```ts
describe('checkLetterAnswer', () => {
  it('returns correct: true when the selected letter is the correct one', () => {
    const result = checkLetterAnswer(makeGameState(), 'E')

    expect(result.correct).toBe(true)
    expect(result.selectedLetter).toBe('E')
    expect(result.correctAnimal.id).toBe('elefante')
  })

  it('returns correct: false when the selected letter is wrong', () => {
    const result = checkLetterAnswer(makeGameState(), 'B')

    expect(result.correct).toBe(false)
    expect(result.selectedLetter).toBe('B')
    expect(result.correctAnimal.id).toBe('elefante')
  })
})
```

- [ ] **Step 3: Run engine tests and verify they fail**

Run:

```bash
npm run test:frontend -- frontend/src/games/alphabet-match/game/engine.test.ts
```

Expected: FAIL because `letterOptions` and `checkLetterAnswer` do not exist.

- [ ] **Step 4: Add the mode type and round field**

Modify `frontend/src/games/alphabet-match/game/types.ts`:

```ts
export type AlphabetMatchMode = 'letter-to-animal' | 'animal-to-letter'

export type Animal = {
  id: string
  label: string
  imagePath: string
  firstLetter: string
  gender: 'M' | 'F'
}

export type Round = {
  letter: string
  correctAnimal: Animal
  options: Animal[]
  letterOptions: string[]
  attempts: number
  completed: boolean
}
```

Update any test `makeRound` helpers to include:

```ts
letterOptions: ['E', 'G', 'B', 'R'],
```

- [ ] **Step 5: Implement letter option generation and answer checking**

Modify `frontend/src/games/alphabet-match/game/engine.ts`:

```ts
function buildLetterOptions(correctLetter: string, availableLetters: string[]): string[] {
  const distractors = shuffle(availableLetters.filter(letter => letter !== correctLetter)).slice(0, 3)
  return shuffle([correctLetter, ...distractors])
}
```

Inside `createGame`, add `letterOptions` to each round:

```ts
const letterOptions = buildLetterOptions(correctAnimal.firstLetter, available)

return {
  letter,
  correctAnimal,
  options: shuffle([correctAnimal, ...distractors]),
  letterOptions,
  attempts: 0,
  completed: false,
}
```

Export the new checker:

```ts
export function checkLetterAnswer(
  state: GameState,
  selectedLetter: string,
): { correct: boolean; selectedLetter: string; correctAnimal: Animal } {
  const round = state.rounds[state.currentRoundIndex]
  return {
    correct: round.correctAnimal.firstLetter === selectedLetter,
    selectedLetter,
    correctAnimal: round.correctAnimal,
  }
}
```

- [ ] **Step 6: Run engine tests and verify they pass**

Run:

```bash
npm run test:frontend -- frontend/src/games/alphabet-match/game/engine.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add frontend/src/games/alphabet-match/game/types.ts frontend/src/games/alphabet-match/game/engine.ts frontend/src/games/alphabet-match/game/engine.test.ts
git commit -m "feat(alphabet-match): add letter option rounds"
```

---

### Task 2: Extend Sounds And Hook Behavior For `Ache a letra`

**Files:**
- Modify: `frontend/src/games/alphabet-match/game/useSounds.ts`
- Modify: `frontend/src/games/alphabet-match/game/useGame.ts`
- Modify: `frontend/src/games/alphabet-match/game/useGame.test.ts`

- [ ] **Step 1: Update the sound mock and render helper in hook tests**

In `frontend/src/games/alphabet-match/game/useGame.test.ts`, add:

```ts
const speakLetterError = vi.fn()
const speakAnimalToLetterIntro = vi.fn()
```

Update the `vi.mock('./useSounds', ...)` return object:

```ts
speakLetterError,
speakAnimalToLetterIntro,
```

Update `beforeEach`:

```ts
speakLetterError.mockClear()
speakAnimalToLetterIntro.mockClear()
```

Change the helper to accept mode:

```ts
function renderGame(config: GameConfig, mode: AlphabetMatchMode = 'letter-to-animal') {
  return renderHook(() => useGame(config, mode), { wrapper: StrictMode })
}
```

Update the type import:

```ts
import type { AlphabetMatchMode, Animal, GameConfig } from './types'
```

- [ ] **Step 2: Add failing hook tests for animal-to-letter intro and selection**

Append:

```ts
describe('useGame — animal-to-letter audio and selection', () => {
  it('chama speakAnimalToLetterIntro ao iniciar no modo Ache a letra', () => {
    const { result } = renderGame({ totalRounds: 3, animals }, 'animal-to-letter')
    const animal = result.current.currentRound!.correctAnimal

    expect(speakAnimalToLetterIntro).toHaveBeenCalledWith(animal.label)
    expect(speakRoundIntro).not.toHaveBeenCalled()
  })

  it('previewChallengeAnimal fala o nome do animal correto', () => {
    const { result } = renderGame({ totalRounds: 3, animals }, 'animal-to-letter')
    const animal = result.current.currentRound!.correctAnimal

    act(() => { result.current.previewChallengeAnimal() })

    expect(speakAnimalName).toHaveBeenCalledWith(animal.label)
  })

  it('selectLetter define selectedLetter e fala a letra', () => {
    const { result } = renderGame({ totalRounds: 3, animals }, 'animal-to-letter')
    const letter = result.current.currentRound!.letterOptions[0]

    act(() => { result.current.selectLetter(letter) })

    expect(result.current.selectedLetter).toBe(letter)
    expect(speakLetter).toHaveBeenCalledWith(letter)
  })

  it('não repete speakAnimalToLetterIntro quando a rodada atual registra erro', () => {
    const { result } = renderGame({ totalRounds: 3, animals }, 'animal-to-letter')
    const round = result.current.currentRound!
    const wrongLetter = round.letterOptions.find(letter => letter !== round.correctAnimal.firstLetter)!
    speakAnimalToLetterIntro.mockClear()

    act(() => { result.current.selectLetter(wrongLetter) })
    act(() => { result.current.confirmLetter() })

    expect(speakAnimalToLetterIntro).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Add failing hook tests for wrong and correct letter confirmation**

Append:

```ts
describe('useGame — confirmLetter', () => {
  it('mostra feedback sem nome do animal ao errar uma letra', () => {
    const { result } = renderGame({ totalRounds: 3, animals }, 'animal-to-letter')
    const round = result.current.currentRound!
    const wrongLetter = round.letterOptions.find(letter => letter !== round.correctAnimal.firstLetter)!

    act(() => { result.current.selectLetter(wrongLetter) })
    act(() => { result.current.confirmLetter() })

    expect(result.current.letterFeedback).toEqual({ animal: round.correctAnimal, selectedLetter: wrongLetter })
    expect(result.current.feedback).toBeNull()
    expect(result.current.blockedLetters).toContain(wrongLetter)
    expect(speakLetterError).toHaveBeenCalledWith(wrongLetter)
  })

  it('limpa selectedLetter após erro', () => {
    const { result } = renderGame({ totalRounds: 3, animals }, 'animal-to-letter')
    const round = result.current.currentRound!
    const wrongLetter = round.letterOptions.find(letter => letter !== round.correctAnimal.firstLetter)!

    act(() => { result.current.selectLetter(wrongLetter) })
    act(() => { result.current.confirmLetter() })

    expect(result.current.selectedLetter).toBeNull()
  })

  it('define success ao acertar uma letra', () => {
    const { result } = renderGame({ totalRounds: 3, animals }, 'animal-to-letter')
    const round = result.current.currentRound!

    act(() => { result.current.selectLetter(round.correctAnimal.firstLetter) })
    act(() => { result.current.confirmLetter() })

    expect(result.current.success).not.toBeNull()
    expect(result.current.success!.animal.id).toBe(round.correctAnimal.id)
    expect(result.current.success!.letter).toBe(round.correctAnimal.firstLetter)
    expect(playCorrect).toHaveBeenCalledTimes(1)
    expect(speakSuccessMessage).toHaveBeenCalledWith(expect.stringContaining(round.correctAnimal.label))
    expect(speakSuccessMessage).toHaveBeenCalledWith(expect.stringContaining(round.correctAnimal.firstLetter))
  })

  it('confirmLetter não faz nada sem selectedLetter', () => {
    const { result } = renderGame({ totalRounds: 3, animals }, 'animal-to-letter')

    act(() => { result.current.confirmLetter() })

    expect(result.current.letterFeedback).toBeNull()
    expect(result.current.success).toBeNull()
    expect(result.current.state.totalAttempts).toBe(0)
  })
})
```

- [ ] **Step 4: Run hook tests and verify they fail**

Run:

```bash
npm run test:frontend -- frontend/src/games/alphabet-match/game/useGame.test.ts
```

Expected: FAIL because `useGame(config, mode)`, `selectedLetter`, `selectLetter`, `confirmLetter`, `letterFeedback`, `blockedLetters`, `previewChallengeAnimal`, and new sound helpers do not exist.

- [ ] **Step 5: Add sound helpers**

Modify `frontend/src/games/alphabet-match/game/useSounds.ts`:

```ts
const speakLetterError = useCallback((letter: string) => {
  speak(`Esse animal não começa com a letra ${letter}.`)
}, [])

const speakAnimalToLetterIntro = useCallback((label: string) => {
  speak(`Qual letra combina com ${label}?`)
}, [])
```

Add them to the returned object:

```ts
return {
  playCorrect,
  playWrong,
  playVictory,
  speakAnimalName,
  speakAnimalError,
  speakSuccessMessage,
  speakRoundIntro,
  speakLetter,
  speakLetterError,
  speakAnimalToLetterIntro,
}
```

- [ ] **Step 6: Implement mode-aware hook state and actions**

Modify imports in `frontend/src/games/alphabet-match/game/useGame.ts`:

```ts
import { createGame, checkAnswer, checkLetterAnswer, recordAttempt, completeRound, advanceRound } from './engine'
import type { AlphabetMatchMode, Animal, GameConfig, GameState } from './types'
```

Add state types:

```ts
type FeedbackState = { animal: Animal } | null
type LetterFeedbackState = { animal: Animal; selectedLetter: string } | null
type SuccessState = { animal: Animal; letter: string; messageIndex: number } | null
```

Change the signature and add state:

```ts
export function useGame(config: GameConfig, mode: AlphabetMatchMode = 'letter-to-animal') {
  const [state, setState] = useState<GameState>(() => createGame(config))
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [letterFeedback, setLetterFeedback] = useState<LetterFeedbackState>(null)
  const [success, setSuccess] = useState<SuccessState>(null)
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [blockedIds, setBlockedIds] = useState<string[]>([])
  const [blockedLetters, setBlockedLetters] = useState<string[]>([])
```

Destructure sounds:

```ts
const {
  playCorrect,
  playWrong,
  playVictory,
  speakAnimalName,
  speakAnimalError,
  speakSuccessMessage,
  speakRoundIntro,
  speakLetter,
  speakLetterError,
  speakAnimalToLetterIntro,
} = useSounds()
```

Update the round intro effect. Depend on the round index instead of the whole `currentRound` object so recording attempts does not replay the intro:

```ts
useEffect(() => {
  if (!currentRound) return
  if (mode === 'animal-to-letter') {
    speakAnimalToLetterIntro(currentRound.correctAnimal.label)
    return
  }
  speakRoundIntro(currentRound.letter)
}, [state.currentRoundIndex, mode, speakAnimalToLetterIntro, speakRoundIntro])
```

Guard existing animal preview against the new popup:

```ts
if (feedback || letterFeedback || success) return
```

Add new actions:

```ts
const previewChallengeAnimal = useCallback(() => {
  if (!currentRound || feedback || letterFeedback || success) return
  speakAnimalName(currentRound.correctAnimal.label)
}, [currentRound, feedback, letterFeedback, success, speakAnimalName])

const selectLetter = useCallback((letter: string) => {
  if (feedback || letterFeedback || success) return
  if (blockedLetters.includes(letter)) return
  setSelectedLetter(letter)
  speakLetter(letter)
}, [feedback, letterFeedback, success, blockedLetters, speakLetter])

const confirmLetter = useCallback(() => {
  if (!selectedLetter || feedback || letterFeedback || success) return

  const result = checkLetterAnswer(state, selectedLetter)

  if (result.correct) {
    const messageIndex = selectSuccessMessageIndex()
    const message = formatSuccessMessage(
      SUCCESS_MESSAGE_TEMPLATES[messageIndex],
      result.correctAnimal.label,
      result.correctAnimal.firstLetter
    )
    playCorrect()
    speakSuccessMessage(message)
    setState(prev => completeRound(recordAttempt(prev)))
    setSuccess({ animal: result.correctAnimal, letter: result.correctAnimal.firstLetter, messageIndex })
    setSelectedLetter(null)
  } else {
    playWrong()
    speakLetterError(result.selectedLetter)
    setState(prev => recordAttempt(prev))
    setLetterFeedback({ animal: result.correctAnimal, selectedLetter: result.selectedLetter })
    setBlockedLetters(prev => [...prev, result.selectedLetter])
    setSelectedLetter(null)
  }
}, [selectedLetter, state, feedback, letterFeedback, success, playCorrect, playWrong, speakSuccessMessage, speakLetterError])
```

Update dismissal and restart:

```ts
const dismissFeedback = useCallback(() => {
  setFeedback(null)
  setLetterFeedback(null)
}, [])

const dismissSuccess = useCallback(() => {
  setSuccess(null)
  setBlockedIds([])
  setBlockedLetters([])
  setState(prev => advanceRound(prev))
}, [])

const restart = useCallback(() => {
  setState(createGame(config))
  setFeedback(null)
  setLetterFeedback(null)
  setSuccess(null)
  setSelectedAnimalId(null)
  setSelectedLetter(null)
  setBlockedIds([])
  setBlockedLetters([])
}, [config])
```

Return the new fields:

```ts
letterFeedback,
selectedLetter,
blockedLetters,
previewChallengeAnimal,
selectLetter,
confirmLetter,
```

- [ ] **Step 7: Run hook tests and verify they pass**

Run:

```bash
npm run test:frontend -- frontend/src/games/alphabet-match/game/useGame.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add frontend/src/games/alphabet-match/game/useSounds.ts frontend/src/games/alphabet-match/game/useGame.ts frontend/src/games/alphabet-match/game/useGame.test.ts
git commit -m "feat(alphabet-match): support letter answer mode state"
```

---

### Task 3: Build Mode Selection Screen

**Files:**
- Create: `frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.tsx`
- Create: `frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.module.css`
- Create: `frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.test.tsx`

- [ ] **Step 1: Write failing tests for mode selection**

Create `frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AlphabetModeSelectScreen } from './AlphabetModeSelectScreen'

describe('AlphabetModeSelectScreen', () => {
  it('renderiza os dois modos', () => {
    render(<AlphabetModeSelectScreen onSelectMode={() => {}} onBackToMenu={() => {}} />)

    expect(screen.getByRole('button', { name: /ache o animal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ache a letra/i })).toBeInTheDocument()
  })

  it('seleciona o modo Ache o animal', () => {
    const onSelectMode = vi.fn()
    render(<AlphabetModeSelectScreen onSelectMode={onSelectMode} onBackToMenu={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /ache o animal/i }))

    expect(onSelectMode).toHaveBeenCalledWith('letter-to-animal')
  })

  it('seleciona o modo Ache a letra', () => {
    const onSelectMode = vi.fn()
    render(<AlphabetModeSelectScreen onSelectMode={onSelectMode} onBackToMenu={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /ache a letra/i }))

    expect(onSelectMode).toHaveBeenCalledWith('animal-to-letter')
  })

  it('volta para o menu principal', () => {
    const onBackToMenu = vi.fn()
    render(<AlphabetModeSelectScreen onSelectMode={() => {}} onBackToMenu={onBackToMenu} />)

    fireEvent.click(screen.getByRole('button', { name: /voltar/i }))

    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
npm run test:frontend -- frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.test.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the component**

Create `frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.tsx`:

```tsx
import type { AlphabetMatchMode } from '../game/types'
import styles from './AlphabetModeSelectScreen.module.css'

type Props = {
  onSelectMode: (mode: AlphabetMatchMode) => void
  onBackToMenu: () => void
}

export function AlphabetModeSelectScreen({ onSelectMode, onBackToMenu }: Props) {
  return (
    <main className={styles.container}>
      <button type="button" className={styles.backButton} onClick={onBackToMenu}>
        Voltar
      </button>
      <h1 className={styles.title}>Como quer brincar?</h1>
      <div className={styles.grid}>
        <button type="button" className={styles.card} onClick={() => onSelectMode('letter-to-animal')}>
          <span className={styles.letterCue}>A</span>
          <span className={styles.miniImages} aria-hidden="true">
            <span>🐝</span><span>🐘</span><span>🐱</span>
          </span>
          <span className={styles.name}>Ache o animal</span>
        </button>
        <button type="button" className={styles.card} onClick={() => onSelectMode('animal-to-letter')}>
          <span className={styles.animalCue} aria-hidden="true">🐘</span>
          <span className={styles.letterOptions} aria-hidden="true">
            <span>A</span><span>E</span><span>G</span>
          </span>
          <span className={styles.name}>Ache a letra</span>
        </button>
      </div>
    </main>
  )
}
```

Create `frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.module.css`:

```css
.container {
  min-height: calc(100vh - var(--topbar-height));
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.backButton {
  align-self: flex-start;
  border: 0;
  border-radius: 16px;
  padding: 10px 18px;
  font-weight: 800;
  color: #581c87;
  background: #fef3c7;
  box-shadow: 0 8px 18px rgba(88, 28, 135, 0.18);
}

.title {
  margin: 0;
  color: #581c87;
  font-size: clamp(2rem, 7vw, 4rem);
  text-align: center;
}

.grid {
  width: min(760px, 100%);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.card {
  min-height: 260px;
  border: 4px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.86);
  color: #581c87;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  box-shadow: 0 16px 30px rgba(88, 28, 135, 0.2);
}

.letterCue {
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  color: #7c3aed;
}

.animalCue {
  font-size: 4.5rem;
  line-height: 1;
}

.miniImages,
.letterOptions {
  display: flex;
  gap: 8px;
  font-size: 1.8rem;
  font-weight: 900;
}

.letterOptions span {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  color: #0f766e;
  background: #ccfbf1;
}

.name {
  font-size: 1.45rem;
  font-weight: 900;
}

@media (max-width: 620px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run:

```bash
npm run test:frontend -- frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.tsx frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.module.css frontend/src/games/alphabet-match/components/AlphabetModeSelectScreen.test.tsx
git commit -m "feat(alphabet-match): add mode selection screen"
```

---

### Task 4: Build Letter Round And Wrong-Letter Feedback UI

**Files:**
- Create: `frontend/src/games/alphabet-match/components/LetterRoundScreen.tsx`
- Create: `frontend/src/games/alphabet-match/components/LetterRoundScreen.module.css`
- Create: `frontend/src/games/alphabet-match/components/LetterRoundScreen.test.tsx`
- Create: `frontend/src/games/alphabet-match/components/LetterFeedbackPopup.tsx`
- Create: `frontend/src/games/alphabet-match/components/LetterFeedbackPopup.module.css`
- Create: `frontend/src/games/alphabet-match/components/LetterFeedbackPopup.test.tsx`

- [ ] **Step 1: Write failing tests for `LetterRoundScreen`**

Create `frontend/src/games/alphabet-match/components/LetterRoundScreen.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LetterRoundScreen } from './LetterRoundScreen'
import styles from './LetterRoundScreen.module.css'
import type { Animal, Round } from '../game/types'

const animal: Animal = {
  id: 'elefante',
  label: 'Elefante',
  imagePath: '/fake/elefante.jpeg',
  firstLetter: 'E',
  gender: 'M',
}

const round: Round = {
  letter: 'E',
  correctAnimal: animal,
  options: [animal],
  letterOptions: ['A', 'E', 'G', 'L'],
  attempts: 0,
  completed: false,
}

const defaultProps = {
  round,
  selectedLetter: null,
  blockedLetters: [] as string[],
  onPreviewAnimal: () => {},
  onSelectLetter: () => {},
  onConfirm: () => {},
}

describe('LetterRoundScreen', () => {
  it('renderiza a imagem do animal sem mostrar o nome', () => {
    render(<LetterRoundScreen {...defaultProps} />)

    expect(screen.getByAltText('Animal para descobrir a letra')).toBeInTheDocument()
    expect(screen.queryByText('Elefante')).toBeNull()
  })

  it('impede drag nativo na imagem', () => {
    render(<LetterRoundScreen {...defaultProps} />)

    expect(screen.getByAltText('Animal para descobrir a letra')).toHaveAttribute('draggable', 'false')
  })

  it('chama onPreviewAnimal ao clicar na imagem', () => {
    const onPreviewAnimal = vi.fn()
    render(<LetterRoundScreen {...defaultProps} onPreviewAnimal={onPreviewAnimal} />)

    fireEvent.click(screen.getByRole('button', { name: /ouvir animal/i }))

    expect(onPreviewAnimal).toHaveBeenCalledTimes(1)
  })

  it('renderiza as quatro letras', () => {
    render(<LetterRoundScreen {...defaultProps} />)

    for (const letter of round.letterOptions) {
      expect(screen.getByRole('button', { name: `Letra ${letter}` })).toBeInTheDocument()
    }
  })

  it('seleciona uma letra', () => {
    const onSelectLetter = vi.fn()
    render(<LetterRoundScreen {...defaultProps} onSelectLetter={onSelectLetter} />)

    fireEvent.click(screen.getByRole('button', { name: 'Letra E' }))

    expect(onSelectLetter).toHaveBeenCalledWith('E')
  })

  it('exibe botão confirmar só quando há letra selecionada', () => {
    const { rerender } = render(<LetterRoundScreen {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /é essa/i })).toBeNull()

    rerender(<LetterRoundScreen {...defaultProps} selectedLetter="E" />)
    expect(screen.getByRole('button', { name: /é essa/i })).toBeInTheDocument()
  })

  it('chama onConfirm ao confirmar', () => {
    const onConfirm = vi.fn()
    render(<LetterRoundScreen {...defaultProps} selectedLetter="E" onConfirm={onConfirm} />)

    fireEvent.click(screen.getByRole('button', { name: /é essa/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('aplica selected na letra selecionada', () => {
    render(<LetterRoundScreen {...defaultProps} selectedLetter="E" />)

    expect(screen.getByRole('button', { name: 'Letra E' }).className).toContain(styles.selected)
  })

  it('desabilita letras bloqueadas', () => {
    render(<LetterRoundScreen {...defaultProps} blockedLetters={['A']} />)

    const blocked = screen.getByRole('button', { name: 'Letra A' })
    expect(blocked).toBeDisabled()
    expect(blocked.className).toContain(styles.blocked)
  })
})
```

- [ ] **Step 2: Write failing tests for `LetterFeedbackPopup`**

Create `frontend/src/games/alphabet-match/components/LetterFeedbackPopup.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LetterFeedbackPopup } from './LetterFeedbackPopup'
import type { Animal } from '../game/types'

const animal: Animal = {
  id: 'elefante',
  label: 'Elefante',
  imagePath: '/fake/elefante.jpeg',
  firstLetter: 'E',
  gender: 'M',
}

describe('LetterFeedbackPopup', () => {
  it('mostra a imagem e a frase sem nome do animal', () => {
    render(<LetterFeedbackPopup animal={animal} selectedLetter="A" onDismiss={() => {}} />)

    expect(screen.getByAltText('Animal escolhido')).toBeInTheDocument()
    expect(screen.getByText('Esse animal não começa com a letra A.')).toBeInTheDocument()
    expect(screen.queryByText('Elefante')).toBeNull()
  })

  it('chama onDismiss ao tentar novamente', () => {
    const onDismiss = vi.fn()
    render(<LetterFeedbackPopup animal={animal} selectedLetter="A" onDismiss={onDismiss} />)

    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 3: Run tests and verify they fail**

Run:

```bash
npm run test:frontend -- frontend/src/games/alphabet-match/components/LetterRoundScreen.test.tsx frontend/src/games/alphabet-match/components/LetterFeedbackPopup.test.tsx
```

Expected: FAIL because both components do not exist.

- [ ] **Step 4: Implement `LetterRoundScreen`**

Create `frontend/src/games/alphabet-match/components/LetterRoundScreen.tsx`:

```tsx
import type { Round } from '../game/types'
import styles from './LetterRoundScreen.module.css'

type Props = {
  round: Round
  selectedLetter: string | null
  blockedLetters: string[]
  onPreviewAnimal: () => void
  onSelectLetter: (letter: string) => void
  onConfirm: () => void
}

export function LetterRoundScreen({
  round,
  selectedLetter,
  blockedLetters,
  onPreviewAnimal,
  onSelectLetter,
  onConfirm,
}: Props) {
  return (
    <section className={styles.container}>
      <button
        type="button"
        className={styles.animalButton}
        aria-label="Ouvir animal"
        onClick={onPreviewAnimal}
      >
        <img
          src={round.correctAnimal.imagePath}
          alt="Animal para descobrir a letra"
          className={styles.image}
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
        />
      </button>

      <div className={styles.options}>
        {round.letterOptions.map(letter => {
          const selected = selectedLetter === letter
          const blocked = blockedLetters.includes(letter)
          return (
            <button
              key={letter}
              type="button"
              className={`${styles.letterButton} ${selected ? styles.selected : ''} ${blocked ? styles.blocked : ''}`}
              aria-label={`Letra ${letter}`}
              disabled={blocked}
              onClick={() => onSelectLetter(letter)}
            >
              {letter}
            </button>
          )
        })}
      </div>

      {selectedLetter && (
        <button type="button" className={styles.confirmButton} onClick={onConfirm}>
          É essa!
        </button>
      )}
    </section>
  )
}
```

Create `frontend/src/games/alphabet-match/components/LetterRoundScreen.module.css`:

```css
.container {
  width: min(780px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.animalButton {
  width: min(360px, 78vw);
  aspect-ratio: 1;
  border: 5px solid rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  padding: 0;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 16px 30px rgba(88, 28, 135, 0.22);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.options {
  width: min(560px, 100%);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.letterButton {
  aspect-ratio: 1;
  border: 4px solid rgba(255, 255, 255, 0.95);
  border-radius: 22px;
  background: #fef3c7;
  color: #581c87;
  font-size: clamp(2.4rem, 10vw, 4.6rem);
  font-weight: 900;
  box-shadow: 0 12px 24px rgba(88, 28, 135, 0.18);
}

.selected {
  background: #ccfbf1;
  color: #0f766e;
  transform: translateY(-4px);
}

.blocked {
  opacity: 0.42;
  filter: grayscale(0.7);
}

.confirmButton {
  border: 0;
  border-radius: 18px;
  padding: 14px 28px;
  color: white;
  background: #0d9488;
  font-size: 1.25rem;
  font-weight: 900;
  box-shadow: 0 12px 24px rgba(13, 148, 136, 0.24);
}

@media (max-width: 520px) {
  .options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 5: Implement `LetterFeedbackPopup`**

Create `frontend/src/games/alphabet-match/components/LetterFeedbackPopup.tsx`:

```tsx
import type { Animal } from '../game/types'
import styles from './LetterFeedbackPopup.module.css'

type Props = {
  animal: Animal
  selectedLetter: string
  onDismiss: () => void
}

export function LetterFeedbackPopup({ animal, selectedLetter, onDismiss }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <img
          src={animal.imagePath}
          alt="Animal escolhido"
          className={styles.image}
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
        />
        <p className={styles.text}>Esse animal não começa com a letra {selectedLetter}.</p>
        <button className={styles.button} onClick={onDismiss}>
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
```

Create `frontend/src/games/alphabet-match/components/LetterFeedbackPopup.module.css` by copying the structure from `FeedbackPopup.module.css`, then adjust only names if needed. Keep the same overlay/card/image/button behavior so both feedback experiences feel related.

Use this complete CSS if the existing popup styles are not directly reusable:

```css
.overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(88, 28, 135, 0.35);
}

.card {
  width: min(420px, 100%);
  padding: 24px;
  border-radius: 28px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(88, 28, 135, 0.25);
}

.image {
  width: min(240px, 70vw);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 22px;
  border: 4px solid #fef3c7;
}

.text {
  margin: 0;
  color: #581c87;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1.25;
}

.button {
  border: 0;
  border-radius: 18px;
  padding: 14px 24px;
  color: white;
  background: #7c3aed;
  font-size: 1.1rem;
  font-weight: 900;
  box-shadow: 0 10px 22px rgba(124, 58, 237, 0.24);
}
```

- [ ] **Step 6: Run component tests and verify they pass**

Run:

```bash
npm run test:frontend -- frontend/src/games/alphabet-match/components/LetterRoundScreen.test.tsx frontend/src/games/alphabet-match/components/LetterFeedbackPopup.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add frontend/src/games/alphabet-match/components/LetterRoundScreen.tsx frontend/src/games/alphabet-match/components/LetterRoundScreen.module.css frontend/src/games/alphabet-match/components/LetterRoundScreen.test.tsx frontend/src/games/alphabet-match/components/LetterFeedbackPopup.tsx frontend/src/games/alphabet-match/components/LetterFeedbackPopup.module.css frontend/src/games/alphabet-match/components/LetterFeedbackPopup.test.tsx
git commit -m "feat(alphabet-match): add letter choice round UI"
```

---

### Task 5: Wire Modes Into Alphabet Match And App Navigation

**Files:**
- Modify: `frontend/src/games/alphabet-match/AlphabetMatchGame.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/games/alphabet-match/components/GameOver.tsx`
- Modify: `frontend/src/platform/components/GameOverScreen.tsx`
- Create or modify: `frontend/src/games/alphabet-match/components/GameOver.test.tsx`

- [ ] **Step 1: Write failing GameOver test for changing mode**

Create `frontend/src/games/alphabet-match/components/GameOver.test.tsx` if it does not exist:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameOver } from './GameOver'

describe('Alphabet Match GameOver', () => {
  it('permite trocar modo', () => {
    const onChangeMode = vi.fn()
    render(
      <GameOver
        totalAttempts={5}
        totalRounds={5}
        onRestart={() => {}}
        onBackToMenu={() => {}}
        onChangeMode={onChangeMode}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /trocar modo/i }))

    expect(onChangeMode).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run GameOver test and verify it fails**

Run:

```bash
npm run test:frontend -- frontend/src/games/alphabet-match/components/GameOver.test.tsx
```

Expected: FAIL because `GameOver` does not accept `onChangeMode` or render `Trocar modo`.

- [ ] **Step 3: Add optional extra action support to `GameOverScreen`**

Modify `frontend/src/platform/components/GameOverScreen.tsx` props:

```ts
extraActionLabel?: string
onExtraAction?: () => void
```

Destructure defaults:

```ts
extraActionLabel,
onExtraAction,
```

Render the third button between restart and menu:

```tsx
{onExtraAction && extraActionLabel && (
  <button className={styles.buttonSecondary} onClick={onExtraAction}>
    {extraActionLabel}
  </button>
)}
```

- [ ] **Step 4: Pass `Trocar modo` from Alphabet Match `GameOver`**

Modify `frontend/src/games/alphabet-match/components/GameOver.tsx`:

```ts
type Props = {
  totalAttempts: number
  totalRounds: number
  onRestart: () => void
  onBackToMenu: () => void
  onChangeMode: () => void
}
```

Pass to `GameOverScreen`:

```tsx
<GameOverScreen
  title="Parabéns!"
  onRestart={onRestart}
  onBackToMenu={onBackToMenu}
  onExtraAction={onChangeMode}
  extraActionLabel="Trocar modo"
>
```

- [ ] **Step 5: Run GameOver test and verify it passes**

Run:

```bash
npm run test:frontend -- frontend/src/games/alphabet-match/components/GameOver.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Wire mode-specific rendering in `AlphabetMatchGame`**

Modify `frontend/src/games/alphabet-match/AlphabetMatchGame.tsx` imports:

```ts
import { LetterRoundScreen } from './components/LetterRoundScreen'
import { LetterFeedbackPopup } from './components/LetterFeedbackPopup'
import type { AlphabetMatchMode, GameConfig } from './game/types'
```

Update props:

```ts
type Props = {
  mode: AlphabetMatchMode
  onBackToMenu: () => void
  onChangeMode: () => void
}
```

Call hook with mode and destructure new fields:

```ts
} = useGame(config, mode)
```

Include:

```ts
letterFeedback,
selectedLetter,
blockedLetters,
previewChallengeAnimal,
selectLetter,
confirmLetter,
```

Pass `onChangeMode` to game over:

```tsx
<GameOver
  totalAttempts={state.totalAttempts}
  totalRounds={state.rounds.length}
  onRestart={restart}
  onBackToMenu={onBackToMenu}
  onChangeMode={onChangeMode}
/>
```

Render round screen by mode:

```tsx
{mode === 'letter-to-animal' ? (
  <RoundScreen
    round={currentRound}
    selectedAnimalId={selectedAnimalId}
    blockedIds={blockedIds}
    onPreview={previewAnimal}
    onConfirm={confirmAnimal}
    onLetterTap={speakLetterReplay}
  />
) : (
  <LetterRoundScreen
    round={currentRound}
    selectedLetter={selectedLetter}
    blockedLetters={blockedLetters}
    onPreviewAnimal={previewChallengeAnimal}
    onSelectLetter={selectLetter}
    onConfirm={confirmLetter}
  />
)}
```

Render letter feedback:

```tsx
{letterFeedback && (
  <LetterFeedbackPopup
    animal={letterFeedback.animal}
    selectedLetter={letterFeedback.selectedLetter}
    onDismiss={dismissFeedback}
  />
)}
```

- [ ] **Step 7: Wire mode selection in `App.tsx`**

Modify imports:

```ts
import { AlphabetModeSelectScreen } from './games/alphabet-match/components/AlphabetModeSelectScreen'
import type { AlphabetMatchMode } from './games/alphabet-match/game/types'
```

Add state:

```ts
const [selectedAlphabetMode, setSelectedAlphabetMode] = useState<AlphabetMatchMode | null>(null)
```

Reset mode when leaving to menu:

```ts
const handleBackToMenu = () => {
  setSelectedGame(null)
  setSelectedDeck(null)
  setSelectedAlphabetMode(null)
  setShowSettings(false)
}
```

Add:

```ts
const handleBackToAlphabetModes = () => {
  setSelectedAlphabetMode(null)
}
```

Replace the Alphabet Match render branch:

```tsx
{selectedGame === 'alphabet-match' && (
  selectedAlphabetMode === null ? (
    <AlphabetModeSelectScreen
      onSelectMode={setSelectedAlphabetMode}
      onBackToMenu={handleBackToMenu}
    />
  ) : (
    <AlphabetMatchGame
      mode={selectedAlphabetMode}
      onBackToMenu={handleBackToMenu}
      onChangeMode={handleBackToAlphabetModes}
    />
  )
)}
```

- [ ] **Step 8: Run focused Alphabet Match tests**

Run:

```bash
npm run test:frontend -- frontend/src/games/alphabet-match
```

Expected: PASS.

- [ ] **Step 9: Commit**

Run:

```bash
git add frontend/src/platform/components/GameOverScreen.tsx frontend/src/games/alphabet-match/components/GameOver.tsx frontend/src/games/alphabet-match/components/GameOver.test.tsx frontend/src/games/alphabet-match/AlphabetMatchGame.tsx frontend/src/App.tsx
git commit -m "feat(alphabet-match): wire mode navigation"
```

---

### Task 6: Final Verification

**Files:**
- Verify all changed frontend files.

- [ ] **Step 1: Run full frontend tests**

Run:

```bash
npm run test:frontend
```

Expected: PASS.

- [ ] **Step 2: Run frontend build**

Run:

```bash
npm run build:frontend
```

Expected: PASS.

- [ ] **Step 3: Inspect final git status**

Run:

```bash
git status --short
```

Expected: only unrelated pre-existing untracked local files may remain, such as `.claude/launch.json`, `.serena/`, or `AGENTS.md`.

- [ ] **Step 4: Handle verification fixes if needed**

If verification required code fixes, return to the task that owns the failing file, make the smallest fix there, rerun that task's focused test command, then rerun this final verification task from Step 1. Commit the fix with that task's commit command. If no fixes were needed, do not create an empty commit.

```bash
git status --short
```
