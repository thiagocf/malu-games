# Navigation Improvements — Design Spec

**Date:** 2026-04-12  
**Scope:** Game header, Settings screen, GameOver screen

---

## Problem

1. During gameplay, there is no way to return to the deck selector.
2. Settings changes apply immediately on any button press — no explicit save action.

---

## Navigation Flow

```
DeckSelector ──[seleciona deck]──▶ Game
                                     │
                              "Abandonar" (confirmation)
                                     │
                                     ▼
                               DeckSelector

Game ──[completa]──▶ GameOver
                        │
              ┌─────────┴─────────┐
       "Jogar de novo"     "Escolher tema"
     (sem confirmação)   (sem confirmação)
              │                   │
             Game            DeckSelector

DeckSelector ──[⚙️]──▶ Settings
                            │
                  ┌──────────┴──────────┐
               "Salvar"              "←" 
            (aplica + sai)     (sem mudanças: sai direto)
                                (com mudanças: confirmação)
```

---

## Changes

### 1. GameHeader — "Abandonar" replaces "↺ Novo"

- Remove the "↺ Novo" button.
- Add "Abandonar" button in its place.
- Clicking "Abandonar" shows a confirmation overlay (state local to `GameHeader`):
  - Title: "Abandonar a partida?"
  - Body: "O progresso será perdido."
  - Buttons: [Continuar jogando] [Abandonar]
- Confirming calls `onBackToMenu`.
- `showConfirm` boolean state lives inside `GameHeader` — does not bubble up to `App`.
- `Props` change: remove `onRestart`, add `onAbandon: () => void`.

### 2. GameOver — no structural changes

- Buttons remain: "Jogar de novo" (`onRestart`) and "Escolher tema" (`onBackToMenu`).
- No confirmation needed — the game is already complete, nothing is lost.
- Labels may be reviewed during implementation if they differ from the above.

### 3. Settings — local state + explicit save

- Add local state `localPairCount` initialized from `pairCount` prop.
- "Has changes" = `localPairCount !== pairCount`.
- Option buttons update `localPairCount` only (no immediate side effects).

**"Salvar" button:**
- Calls `onChangePairCount(localPairCount)`.
- Shows "✓ Salvo!" feedback for ~800ms.
- Calls `onBack` after the delay.

**"←" button with no changes:**
- Calls `onBack` immediately.

**"←" button with unsaved changes:**
- Shows a confirmation overlay:
  - Title: "Sair sem salvar?"
  - Body: "As alterações serão perdidas."
  - Buttons: [Salvar] [Sair sem salvar]
- [Salvar] triggers the same flow as the "Salvar" button.
- [Sair sem salvar] calls `onBack` immediately.

---

## Components Affected

| File | Change |
|------|--------|
| `GameHeader.tsx` | Remove `onRestart` prop, add `onAbandon`, add local `showConfirm` state and confirmation overlay |
| `GameHeader.module.css` | Style for abandon button and confirmation overlay |
| `Settings.tsx` | Add `localPairCount` state, "Salvar" button, "✓ Salvo!" feedback, unsaved-changes confirmation overlay |
| `Settings.module.css` | Style for save button, saved feedback, confirmation overlay |
| `App.tsx` | Remove `onRestart` from `GameHeader` props; pass `onAbandon={() => setSelectedDeck(null)}` |

---

## Out of Scope

- Any changes to `Board`, `Card`, `GameOver`, `DeckSelector`, or `useGame`.
- Persisting settings across sessions.
- Confirmation when navigating DeckSelector → Settings.
