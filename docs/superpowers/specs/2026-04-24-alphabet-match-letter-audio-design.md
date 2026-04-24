# Alphabet Match — Letter Audio Feature

**Date:** 2026-04-24

## Goal

Add audio feedback tied to the letter card in the alphabet-match game:
1. Auto-play a round intro phrase at the start of each round.
2. Allow the child to tap the letter card to replay a shorter audio cue.
3. Add a subtle bounce animation to the letter card to signal interactivity — no icons.

## Pedagogical rationale

For a 4-year-old who cannot read, the verbal instruction defines the task. Without it, the child depends on an adult to provide context. The auto-play phrase makes the game self-sufficient. The tap-to-replay gives agency and reinforces the letter name through repetition.

## Behaviour

| Trigger | Speech |
|---|---|
| New round starts | `"Qual animal começa com a letra B?"` |
| Child taps letter card | `"Letra B"` |

Both use the existing `speak()` function (Web Speech API, `pt-BR`).

The replay on tap is intentionally shorter to avoid repeating the full instruction once the child has already internalized the task.

## Visual

The letter card gets a subtle, continuous `bounce` CSS animation (`@keyframes`). No icons. The animation is always visible and serves as the interactivity affordance.

## Architecture

Follows the existing pattern: pure audio logic in `useSounds`, orchestration in `useGame`, components receive only data and callbacks.

### `useSounds.ts`

Two new functions added and exported from `useSounds()`:

```ts
speakRoundIntro(letter: string)  // "Qual animal começa com a letra {letter}?"
speakLetter(letter: string)      // "Letra {letter}"
```

Both call the existing `speak()` helper. Both wrapped in `useCallback`.

### `useGame.ts`

- `useEffect` fires `speakRoundIntro(currentRound.letter)` whenever `state.currentRoundIndex` changes (covers first round and all subsequent rounds). Guarded against `!currentRound`.
- New callback `speakLetterReplay` exposed in the hook's return value:
  ```ts
  speakLetterReplay: () => void
  ```
  Calls `speakLetter(currentRound.letter)`.

### `RoundScreen.tsx`

- New prop: `onLetterTap: () => void`
- The `div.letterCard` becomes a `<button>` (unstyled via CSS reset) with `onClick={onLetterTap}`.

### `RoundScreen.module.css`

- New `@keyframes bounce` applied to the letter card: subtle vertical scale or translate loop.

### `AlphabetMatchGame.tsx`

- Passes `speakLetterReplay` from `useGame()` as `onLetterTap` to `RoundScreen`.

## Files changed

| File | Change |
|---|---|
| `game/useSounds.ts` | +`speakRoundIntro`, +`speakLetter` |
| `game/useGame.ts` | +`useEffect` for auto-play, +`speakLetterReplay` in return |
| `components/RoundScreen.tsx` | +`onLetterTap` prop, letter card → button |
| `components/RoundScreen.module.css` | +`@keyframes bounce` on letter card |
| `AlphabetMatchGame.tsx` | passes `speakLetterReplay` → `onLetterTap` |

## Out of scope

- Visual "is speaking" state (Approach B) — can be added later if needed.
- Any changes to animal card interaction.
- Changes to FeedbackPopup or SuccessPopup audio.
