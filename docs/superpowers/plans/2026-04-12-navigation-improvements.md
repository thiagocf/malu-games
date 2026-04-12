# Navigation Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mid-game "↺ Novo" button with "Abandonar" (with confirmation), and make Settings use local state with an explicit "Salvar" button that warns before discarding changes.

**Architecture:** All new state (`showConfirm`, `localPairCount`, `saved`) is local to the component that owns it — nothing bubbles up to `App`. The overlay pattern (fixed backdrop + centered dialog card) is repeated in both GameHeader and Settings using their own CSS Modules — no shared component.

**Tech Stack:** React 18, TypeScript, CSS Modules, Vite

> **Note on tests:** Per project conventions (`CLAUDE.md`), unit tests are only required for `engine.ts`. Components do not require tests.

---

## File Map

| File | Change |
|------|--------|
| `src/games/memory/components/GameHeader.tsx` | Remove `onRestart` prop, add `onAbandon`. Add `showConfirm` local state and overlay. |
| `src/games/memory/components/GameHeader.module.css` | Rename `.restart` → `.abandon`. Add overlay/dialog styles. |
| `src/App.tsx` | Pass `onAbandon={onBackToMenu}` to `GameHeader` instead of `onRestart={restart}`. |
| `src/games/memory/components/Settings.tsx` | Add `localPairCount` + `saved` + `showConfirm` state. Add "Salvar" button. Guard "←" with unsaved-changes check. |
| `src/games/memory/components/Settings.module.css` | Add `.save`, `.savedFeedback`, overlay/dialog styles. |

---

## Task 1: GameHeader — "Abandonar" + confirmation overlay

**Files:**
- Modify: `src/games/memory/components/GameHeader.tsx`
- Modify: `src/games/memory/components/GameHeader.module.css`

- [ ] **Step 1: Rewrite `GameHeader.tsx`**

Replace the entire file with:

```tsx
import { useState } from 'react'
import styles from './GameHeader.module.css'

type Props = {
  moves: number
  onAbandon: () => void
}

export function GameHeader({ moves, onAbandon }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)

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

- [ ] **Step 2: Rewrite `GameHeader.module.css`**

Replace the entire file with:

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

.abandon {
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

.abandon:hover {
  opacity: 0.85;
}

/* Confirmation overlay */

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

.dialogTitle {
  font-size: 1.1rem;
  font-weight: 800;
  color: #374151;
  margin: 0 0 0.5rem;
}

.dialogBody {
  font-size: 0.9rem;
  color: #9ca3af;
  font-weight: 600;
  margin: 0 0 1.5rem;
}

.dialogButtons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btnCancel {
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(192, 132, 252, 0.3);
  border-radius: 12px;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}

.btnCancel:hover {
  opacity: 0.85;
}

.btnConfirm {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
  transition: opacity 0.15s;
}

.btnConfirm:hover {
  opacity: 0.85;
}
```

- [ ] **Step 3: Run dev server and verify visually**

```bash
npm run dev
```

Open the game, verify:
- Header shows "Abandonar" button (no "↺ Novo")
- Clicking "Abandonar" opens the overlay
- "Continuar jogando" closes the overlay
- "Abandonar" in the overlay returns to DeckSelector

- [ ] **Step 4: Commit**

```bash
git add src/games/memory/components/GameHeader.tsx src/games/memory/components/GameHeader.module.css
git commit -m "feat: replace restart with abandon button and confirmation overlay"
```

---

## Task 2: App.tsx — wire new GameHeader prop

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `App.tsx`**

In the `Game` function, `GameHeader` currently receives `moves={moves} onRestart={restart}`. Change it to `onAbandon={onBackToMenu}` and remove `onRestart`. The `restart` variable is still used by `GameOver`.

Replace only the `GameHeader` line inside the `Game` function:

```tsx
// Before:
<GameHeader moves={moves} onRestart={restart} />

// After:
<GameHeader moves={moves} onAbandon={onBackToMenu} />
```

The full `Game` function after the change:

```tsx
function Game({ deck, pairCount, onBackToMenu }: { deck: DeckConfig; pairCount: number; onBackToMenu: () => void }) {
  const config = { deck: deck.items, pairCount }
  const { cards, moves, isComplete, flipCard, restart } = useGame(config)

  return (
    <main className="app">
      <GameHeader moves={moves} onAbandon={onBackToMenu} />
      <Board cards={cards} animals={deck.items} onFlip={flipCard} />
      {isComplete && <GameOver moves={moves} onRestart={restart} onBackToMenu={onBackToMenu} />}
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire onAbandon prop from App to GameHeader"
```

---

## Task 3: Settings — local state, "Salvar" button, unsaved-changes guard

**Files:**
- Modify: `src/games/memory/components/Settings.tsx`
- Modify: `src/games/memory/components/Settings.module.css`

- [ ] **Step 1: Rewrite `Settings.tsx`**

Replace the entire file with:

```tsx
import { useState } from 'react'
import styles from './Settings.module.css'

const PAIR_OPTIONS = [4, 6, 8, 10, 12] as const

type Props = {
  pairCount: number
  onChangePairCount: (count: number) => void
  onBack: () => void
}

export function Settings({ pairCount, onChangePairCount, onBack }: Props) {
  const [localPairCount, setLocalPairCount] = useState(pairCount)
  const [saved, setSaved] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasChanges = localPairCount !== pairCount

  function handleSave() {
    onChangePairCount(localPairCount)
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

  return (
    <main className={styles.container}>
      <button className={styles.back} onClick={handleBack}>←</button>
      <h1 className={styles.title}>⚙️ Configurações</h1>

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

- [ ] **Step 2: Add new styles to `Settings.module.css`**

Append the following to the end of the existing file (keep all existing rules):

```css
/* Save button */

.save {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  border-radius: 16px;
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
  padding: 0.9rem 2.5rem;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.35);
  transition: opacity 0.15s, background 0.2s;
  margin-top: 2rem;
}

.save:hover:not(:disabled) {
  opacity: 0.85;
}

.savedFeedback {
  background: linear-gradient(135deg, #16a34a, #4ade80);
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.3);
  cursor: default;
}

/* Unsaved-changes confirmation overlay */

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

.dialogTitle {
  font-size: 1.1rem;
  font-weight: 800;
  color: #374151;
  margin: 0 0 0.5rem;
}

.dialogBody {
  font-size: 0.9rem;
  color: #9ca3af;
  font-weight: 600;
  margin: 0 0 1.5rem;
}

.dialogButtons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btnSave {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
  transition: opacity 0.15s;
}

.btnSave:hover {
  opacity: 0.85;
}

.btnDiscard {
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(192, 132, 252, 0.3);
  border-radius: 12px;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}

.btnDiscard:hover {
  opacity: 0.85;
}
```

- [ ] **Step 3: Run dev server and verify visually**

```bash
npm run dev
```

Open Settings (via ⚙️), verify:
- Changing a pair count option does NOT immediately affect the game
- "Salvar" button appears at the bottom
- Clicking "Salvar" shows "✓ Salvo!" in green, then returns to DeckSelector
- Clicking "←" with no changes returns directly (no dialog)
- Clicking "←" after changing a value shows the "Sair sem salvar?" overlay
- "Salvar" in the overlay saves + returns; "Sair sem salvar" discards + returns

- [ ] **Step 4: Run build to confirm no TypeScript errors**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/games/memory/components/Settings.tsx src/games/memory/components/Settings.module.css
git commit -m "feat: settings local state, save button, unsaved-changes guard"
```
