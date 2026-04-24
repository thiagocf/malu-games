# Alphabet Match — Letter Audio Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add auto-play round intro speech and tap-to-replay on the letter card in alphabet-match, with a bounce animation as interactivity affordance.

**Architecture:** Two new speech functions in `useSounds`, orchestrated from `useGame` (auto-play via `useEffect`, replay via new callback), letter card in `RoundScreen` becomes a `<button>` wired to the replay callback. CSS-only bounce animation, no icons.

**Tech Stack:** React 18, TypeScript, CSS Modules, Web Speech API (`speechSynthesis`), Vitest + Testing Library.

---

### Task 1: Add `speakRoundIntro` and `speakLetter` to `useSounds`

**Files:**
- Modify: `frontend/src/games/alphabet-match/game/useSounds.ts`
- Modify: `frontend/src/games/alphabet-match/game/useSounds.test.ts`

- [ ] **Step 1: Write failing tests**

Append to `useSounds.test.ts` — after the existing `speakAnimalError` describe block:

```ts
describe('useSounds — speakRoundIntro', () => {
  it('fala a frase de introdução com a letra da rodada', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakRoundIntro('B') })

    expect(mockCancel).toHaveBeenCalledTimes(1)
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Qual animal começa com a letra B?')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('não lança erro quando speechSynthesis não está disponível', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useSounds())
    expect(() => {
      act(() => { result.current.speakRoundIntro('A') })
    }).not.toThrow()
  })
})

describe('useSounds — speakLetter', () => {
  it('fala apenas o nome da letra', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakLetter('C') })

    expect(mockCancel).toHaveBeenCalledTimes(1)
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Letra C')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('não lança erro quando speechSynthesis não está disponível', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useSounds())
    expect(() => {
      act(() => { result.current.speakLetter('A') })
    }).not.toThrow()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd frontend && npm run test:watch -- useSounds
```

Expected: 4 new tests FAIL with "result.current.speakRoundIntro is not a function" (or similar).

- [ ] **Step 3: Implement the two new functions in `useSounds.ts`**

Inside `useSounds()`, after `speakAnimalError`, add:

```ts
const speakRoundIntro = useCallback((letter: string) => {
  speak(`Qual animal começa com a letra ${letter}?`)
}, [])

const speakLetter = useCallback((letter: string) => {
  speak(`Letra ${letter}`)
}, [])
```

Update the return statement — add both to the returned object:

```ts
return { playCorrect, playWrong, playVictory, speakAnimalName, speakAnimalError, speakRoundIntro, speakLetter }
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd frontend && npm run test:watch -- useSounds
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/games/alphabet-match/game/useSounds.ts \
        frontend/src/games/alphabet-match/game/useSounds.test.ts
git commit -m "feat(alphabet-match): adiciona speakRoundIntro e speakLetter ao useSounds"
```

---

### Task 2: Auto-play intro and expose `speakLetterReplay` in `useGame`

**Files:**
- Modify: `frontend/src/games/alphabet-match/game/useGame.ts`
- Modify: `frontend/src/games/alphabet-match/game/useGame.test.ts`

- [ ] **Step 1: Update the `useSounds` mock in `useGame.test.ts`**

The mock at the top of the file currently is:

```ts
const playCorrect = vi.fn()
const playWrong = vi.fn()
const playVictory = vi.fn()
const speakAnimalName = vi.fn()
const speakAnimalError = vi.fn()

vi.mock('./useSounds', () => ({
  useSounds: () => ({ playCorrect, playWrong, playVictory, speakAnimalName, speakAnimalError }),
}))
```

Replace the entire block (lines 7–15) with:

```ts
const playCorrect = vi.fn()
const playWrong = vi.fn()
const playVictory = vi.fn()
const speakAnimalName = vi.fn()
const speakAnimalError = vi.fn()
const speakRoundIntro = vi.fn()
const speakLetter = vi.fn()

vi.mock('./useSounds', () => ({
  useSounds: () => ({
    playCorrect,
    playWrong,
    playVictory,
    speakAnimalName,
    speakAnimalError,
    speakRoundIntro,
    speakLetter,
  }),
}))
```

Also add `speakRoundIntro.mockClear()` and `speakLetter.mockClear()` inside `beforeEach`:

```ts
beforeEach(() => {
  playCorrect.mockClear()
  playWrong.mockClear()
  playVictory.mockClear()
  speakAnimalName.mockClear()
  speakAnimalError.mockClear()
  speakRoundIntro.mockClear()
  speakLetter.mockClear()
})
```

- [ ] **Step 2: Write failing tests**

Append a new describe block to `useGame.test.ts` at the end of the file:

```ts
describe('useGame — audio da letra', () => {
  it('chama speakRoundIntro com a letra ao iniciar a primeira rodada', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const letter = result.current.currentRound!.letter
    expect(speakRoundIntro).toHaveBeenCalledWith(letter)
  })

  it('chama speakRoundIntro com a nova letra ao avançar rodada', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    speakRoundIntro.mockClear()

    const round = result.current.currentRound!
    act(() => { result.current.previewAnimal(round.correctAnimal.id) })
    act(() => { result.current.confirmAnimal() })
    act(() => { result.current.dismissSuccess() })

    const newLetter = result.current.currentRound!.letter
    expect(speakRoundIntro).toHaveBeenCalledWith(newLetter)
  })

  it('speakLetterReplay chama speakLetter com a letra da rodada atual', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const letter = result.current.currentRound!.letter

    act(() => { result.current.speakLetterReplay() })

    expect(speakLetter).toHaveBeenCalledWith(letter)
  })
})
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
cd frontend && npm run test:watch -- useGame
```

Expected: 3 new tests FAIL — `speakRoundIntro` not called, `speakLetterReplay` is not a function.

- [ ] **Step 4: Update `useGame.ts`**

**4a.** Destructure `speakRoundIntro` and `speakLetter` from `useSounds()` (line 16):

```ts
const { playCorrect, playWrong, playVictory, speakAnimalName, speakAnimalError, speakRoundIntro, speakLetter } = useSounds()
```

**4b.** Add a `useEffect` for auto-play after the existing `useEffect` for victory sound (after line 22):

```ts
useEffect(() => {
  const round = state.rounds[state.currentRoundIndex]
  if (!round) return
  speakRoundIntro(round.letter)
}, [state.currentRoundIndex, state.rounds, speakRoundIntro])
```

**4c.** Add `speakLetterReplay` callback before the `return` statement:

```ts
const speakLetterReplay = useCallback(() => {
  if (!currentRound) return
  speakLetter(currentRound.letter)
}, [currentRound, speakLetter])
```

**4d.** Add `speakLetterReplay` to the return object:

```ts
return {
  state,
  currentRound,
  feedback,
  success,
  selectedAnimalId,
  blockedIds,
  previewAnimal,
  confirmAnimal,
  dismissFeedback,
  dismissSuccess,
  restart,
  speakLetterReplay,
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
cd frontend && npm run test:watch -- useGame
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/games/alphabet-match/game/useGame.ts \
        frontend/src/games/alphabet-match/game/useGame.test.ts
git commit -m "feat(alphabet-match): auto-play intro de rodada e expõe speakLetterReplay"
```

---

### Task 3: Letter card becomes a tappable button in `RoundScreen`

**Files:**
- Modify: `frontend/src/games/alphabet-match/components/RoundScreen.tsx`
- Modify: `frontend/src/games/alphabet-match/components/RoundScreen.test.tsx`

- [ ] **Step 1: Update existing test that counts buttons and add `onLetterTap` to defaultProps**

In `RoundScreen.test.tsx`, locate `defaultProps` (around line 32) and add `onLetterTap`:

```ts
const defaultProps = {
  round,
  selectedAnimalId: null,
  blockedIds: [] as string[],
  onPreview: () => {},
  onConfirm: () => {},
  onLetterTap: () => {},
}
```

Find the test `'renderiza todas as opções com imagens acessíveis'` which asserts `toHaveLength(4)`. Update it to `5` (4 animal buttons + 1 letter button):

```ts
it('renderiza todas as opções com imagens acessíveis', () => {
  render(<RoundScreen {...defaultProps} />)
  expect(screen.getAllByRole('button')).toHaveLength(5)
  expect(screen.getByAltText('Abelha')).toBeInTheDocument()
  expect(screen.getByAltText('Baleia')).toBeInTheDocument()
})
```

- [ ] **Step 2: Write failing test for letter tap**

Append inside the `describe('RoundScreen', ...)` block, after the last existing `it(...)`:

```ts
it('chama onLetterTap ao clicar no card da letra', () => {
  const onLetterTap = vi.fn()
  render(<RoundScreen {...defaultProps} onLetterTap={onLetterTap} />)
  fireEvent.click(screen.getByRole('button', { name: /letra a/i }))
  expect(onLetterTap).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
cd frontend && npm run test:watch -- RoundScreen
```

Expected: `'renderiza todas as opções'` FAIL (got 4, expected 5), `'chama onLetterTap'` FAIL.

- [ ] **Step 4: Update `RoundScreen.tsx`**

Add `onLetterTap` to the Props type and replace the `div.letterCard` with a `<button>`:

```tsx
import type { Round } from '../game/types'
import styles from './RoundScreen.module.css'

type Props = {
  round: Round
  selectedAnimalId: string | null
  blockedIds: string[]
  onPreview: (animalId: string) => void
  onConfirm: () => void
  onLetterTap: () => void
}

export function RoundScreen({ round, selectedAnimalId, blockedIds, onPreview, onConfirm, onLetterTap }: Props) {
  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.letterCard}
        onClick={onLetterTap}
        aria-label={`Letra ${round.letter}`}
      >
        <span className={styles.letter}>{round.letter}</span>
      </button>
      <div className={styles.grid}>
        {round.options.map(animal => {
          const isSelected = animal.id === selectedAnimalId
          const isBlocked = blockedIds.includes(animal.id)
          return (
            <button
              key={animal.id}
              type="button"
              className={[
                styles.option,
                isSelected ? styles.selected : '',
                isBlocked ? styles.blocked : '',
              ].join(' ')}
              onClick={() => onPreview(animal.id)}
              disabled={isBlocked}
            >
              <img
                src={animal.imagePath}
                alt={animal.label}
                className={styles.image}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </button>
          )
        })}
      </div>
      {selectedAnimalId !== null && (
        <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
          É esse! ✓
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
cd frontend && npm run test:watch -- RoundScreen
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/games/alphabet-match/components/RoundScreen.tsx \
        frontend/src/games/alphabet-match/components/RoundScreen.test.tsx
git commit -m "feat(alphabet-match): letter card vira botão com onLetterTap"
```

---

### Task 4: Bounce animation on the letter card (CSS only)

**Files:**
- Modify: `frontend/src/games/alphabet-match/components/RoundScreen.module.css`

No tests needed — pure visual change.

- [ ] **Step 1: Reset browser button defaults and add bounce to `.letterCard`**

In `RoundScreen.module.css`, replace the existing `.letterCard` block with:

```css
.letterCard {
  background: #ffffff;
  border: 1.5px solid #99f6e4;
  border-radius: 18px;
  padding: 1.25rem 2.5rem;
  box-shadow: 0 1px 0 rgba(15, 58, 58, 0.04), 0 2px 8px rgba(15, 58, 58, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  max-width: 380px;
  cursor: pointer;
  font-family: inherit;
  animation: letterBounce 2.4s ease-in-out infinite;
}

.letterCard:active {
  transform: scale(0.97);
  animation: none;
}
```

- [ ] **Step 2: Add the `@keyframes letterBounce` rule**

Append after the existing `@keyframes correctPop` block:

```css
@keyframes letterBounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}
```

- [ ] **Step 3: Run full test suite to confirm nothing broke**

```bash
cd frontend && npm run test
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/games/alphabet-match/components/RoundScreen.module.css
git commit -m "feat(alphabet-match): bounce animation no card da letra"
```

---

### Task 5: Wire `speakLetterReplay` in `AlphabetMatchGame`

**Files:**
- Modify: `frontend/src/games/alphabet-match/AlphabetMatchGame.tsx`

No new tests — covered by unit tests in Tasks 2 and 3.

- [ ] **Step 1: Destructure `speakLetterReplay` and pass it to `RoundScreen`**

In `AlphabetMatchGame.tsx`, update the destructuring from `useGame(config)` to include `speakLetterReplay`:

```ts
const {
  state,
  currentRound,
  feedback,
  success,
  selectedAnimalId,
  blockedIds,
  previewAnimal,
  confirmAnimal,
  dismissFeedback,
  dismissSuccess,
  restart,
  speakLetterReplay,
} = useGame(config)
```

Update the `<RoundScreen>` usage to pass `onLetterTap`:

```tsx
<RoundScreen
  round={currentRound}
  selectedAnimalId={selectedAnimalId}
  blockedIds={blockedIds}
  onPreview={previewAnimal}
  onConfirm={confirmAnimal}
  onLetterTap={speakLetterReplay}
/>
```

- [ ] **Step 2: Run full test suite**

```bash
cd frontend && npm run test
```

Expected: all tests PASS with no TypeScript errors.

- [ ] **Step 3: Build to confirm no type errors**

```bash
cd frontend && npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/games/alphabet-match/AlphabetMatchGame.tsx
git commit -m "feat(alphabet-match): conecta speakLetterReplay ao card da letra"
```
