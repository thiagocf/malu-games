# Alphabet Match Modes — Design Spec

## Summary

Add a mode-selection step to Alphabet Match and introduce a second mode where the child sees an animal image and chooses the starting letter. The current game remains available as the first mode.

Scope for this change is modes only. It continues using the existing animal catalog. Future deck support for foods, objects, and other categories should be possible, but deck selection is not part of this spec.

## Goals

- Keep one Alphabet Match entry in the main game menu.
- Let the child choose between two clear visual modes before starting.
- Preserve the current mode behavior.
- Add the inverted mode without revealing the animal name before the child solves the round.
- Keep navigation simple when entering, going back, restarting, changing mode, and returning to the main menu.

## Modes

### Ache o animal

This is the current Alphabet Match behavior.

- The challenge is a large letter.
- The options are animal images.
- The child selects an animal and confirms.
- Wrong answers are blocked until the child finds the correct animal.
- Wrong-answer feedback can show the selected animal name with its first letter highlighted, as it does today.
- Correct-answer feedback uses the existing varied success messages.

### Ache a letra

This is the new inverted mode.

- The challenge is a large animal image.
- The animal name is not shown before a correct answer.
- The child may tap the animal image to hear the animal name.
- Selecting a letter speaks the selected letter.
- The options are four letters.
- The child selects a letter and confirms.
- The correct option is the animal's `firstLetter`.
- The three distractors are other available letters from the animal catalog.
- Wrong letters are blocked until the child finds the correct letter.
- Wrong-answer feedback does not show the animal name or the correct letter.
- Correct-answer feedback reveals the association between the animal and the letter.

## Navigation

The main menu keeps one card for Alphabet Match. Selecting it opens a new mode-selection screen instead of starting a game immediately.

Flow:

```text
Menu principal -> Escolher modo -> Partida
```

Mode-selection screen:

- Card: `Ache o animal`
  - Visual cue: large letter with animal images.
  - Starts the current mode.
- Card: `Ache a letra`
  - Visual cue: large animal image with letter options.
  - Starts the new inverted mode.

Back behavior:

- From mode selection, back returns to the main menu.
- During a match, the existing TopBar exit confirmation returns to the main menu.
- At game over:
  - `Jogar de novo` restarts the same mode.
  - `Trocar modo` returns to mode selection.
  - `Outro jogo` returns to the main menu.

There is no in-round mode switch. This avoids accidental mode changes while the child is playing.

## Architecture

Introduce an explicit mode type:

```ts
type AlphabetMatchMode = 'letter-to-animal' | 'animal-to-letter'
```

`App.tsx` will track the selected Alphabet Match mode separately from the selected game. When `selectedGame === 'alphabet-match'` and no mode has been selected, it renders the mode-selection screen. Once a mode is selected, it renders `AlphabetMatchGame`.

`AlphabetMatchGame` receives the mode and a callback for returning to mode selection:

```tsx
<AlphabetMatchGame
  mode={selectedAlphabetMode}
  onBackToMenu={handleBackToMenu}
  onChangeMode={handleBackToModeSelection}
/>
```

Keep the current animal-specific model for now. Do not rename `Animal`, `animals`, or the existing asset catalog in this change. Future deck work can generalize this to a shared item/deck model when decks are actually introduced.

## Round Model

The existing round shape already contains the data needed by the current mode:

- `letter`
- `correctAnimal`
- `options: Animal[]`

The new mode also needs letter options. The engine should generate these in the round state:

```ts
letterOptions: string[]
```

For each round:

- Pick a correct animal.
- Use `correctAnimal.firstLetter` as the correct letter.
- Pick three distinct distractor letters from available catalog letters, excluding the correct letter.
- Shuffle the correct letter with the distractors.

The implementation should keep this logic in pure engine functions so it can be tested without React.

## Hook Behavior

`useGame` should receive the mode and expose mode-appropriate selection state and actions.

Shared responsibilities:

- Current round.
- Total attempts.
- Round completion.
- Success state.
- Feedback state.
- Restart.
- Advance to next round.
- Victory sound.

Mode-specific responsibilities:

- In `letter-to-animal`, preserve the current selected animal and blocked animal behavior.
- In `animal-to-letter`, track selected letter and blocked letters.
- In `animal-to-letter`, wrong feedback stores the selected wrong letter and the challenge animal, but it must not expose the animal name for rendering in the error popup.

The hook should avoid scattering mode checks through UI components. UI components should receive focused props for the mode they render.

## UI Components

Add:

- `AlphabetModeSelectScreen`
  - Renders the two large mode cards.
  - Calls `onSelectMode(mode)`.
  - Calls `onBackToMenu()`.

- A new round screen for `Ache a letra`
  - Shows the animal image without the name.
  - Allows tapping the image to replay the animal name.
  - Shows four letter buttons.
  - Shows selected and blocked letter states.
  - Provides a confirm button.

- A wrong-letter feedback popup or a specific variant
  - Shows the animal image.
  - Shows `Esse animal não começa com a letra X.`
  - Does not show the animal name.
  - Does not show the correct letter.

Modify:

- `AlphabetMatchGame`
  - Chooses the round screen and feedback popup based on mode.
  - Passes `onChangeMode` to game over.

- `GameOver`
  - Adds `Trocar modo`.
  - Keeps `Jogar de novo` and `Outro jogo`.

The current `RoundScreen` and `FeedbackPopup` can remain focused on `Ache o animal`. Rename only if doing so clarifies implementation without causing broad churn.

## Feedback And Audio

### Ache o animal

Keep existing behavior:

- Correct sound on success.
- Wrong sound on error.
- Animal name audio on preview.
- Round intro and letter replay.
- Existing success message system.
- Existing wrong-answer explanation that shows the selected animal name.

### Ache a letra

Round start:

- Show animal image only.
- The child may tap the image to hear the animal name.

Letter selection:

- Selecting a letter speaks the selected letter.
- Confirming checks the selected letter.

Wrong answer:

- Play wrong sound.
- Speak and show: `Esse animal não começa com a letra X.`
- Block the wrong letter.
- Do not show the animal name.
- Do not show the correct letter.

Correct answer:

- Play correct sound.
- Speak and show a success message that reveals the full association, for example `Muito bem! Gato começa com G!`
- Reuse the existing success message template mechanism where possible so text and spoken feedback stay aligned.

## Testing

### Engine tests

- Creates rounds with `letterOptions` containing the correct letter.
- Adds exactly three distinct distractor letters.
- Excludes the correct letter from distractors.
- Uses only letters available in the animal catalog.
- Checks an animal answer in `letter-to-animal`.
- Checks a letter answer in `animal-to-letter`.

### Hook tests

- Existing mode behavior remains unchanged.
- New mode selects and confirms letters.
- Correct letter records an attempt, completes the round, and opens success state.
- Wrong letter records an attempt, opens wrong-letter feedback, and blocks that letter.
- Wrong-letter feedback does not expose the animal name for UI rendering.
- Wrong-letter feedback calls the correct spoken phrase.
- Success phrase and popup content remain aligned.

### Component tests

- Mode-selection screen renders both cards and calls the correct mode.
- Mode-selection back returns to the main menu.
- `Ache a letra` round screen renders the image without the animal name.
- Selecting a letter enables confirm behavior.
- Blocked letters cannot be selected again.
- Wrong-letter feedback renders `Esse animal não começa com a letra X.`
- Game over can restart, change mode, or return to the main menu.

## Out Of Scope

- New decks for foods, objects, or other categories.
- A deck-selection screen.
- Refactoring all animal types into generic deck item types.
- Changing the main game menu to show separate cards for each mode.
- Switching modes during a round.
