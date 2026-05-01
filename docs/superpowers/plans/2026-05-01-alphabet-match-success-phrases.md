# Alphabet Match Success Phrases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add varied success phrases to Alphabet Match while keeping the popup text and spoken feedback aligned.

**Architecture:** Store success phrase templates in one game helper. `useGame` chooses one template index on each correct answer, speaks the formatted message, and stores the index in success state so `SuccessPopup` renders the same phrase.

**Tech Stack:** React, TypeScript, Vitest, Testing Library.

---

### Task 1: Centralize Success Phrase Templates

**Files:**
- Create: `frontend/src/games/alphabet-match/game/successMessages.ts`
- Create: `frontend/src/games/alphabet-match/game/successMessages.test.ts`

- [ ] Write tests for the approved phrase list, deterministic index selection, and formatted message output.
- [ ] Run the focused tests and verify they fail because `successMessages.ts` does not exist.
- [ ] Implement the phrase helper with the eight approved phrases.
- [ ] Run the focused tests and verify they pass.

### Task 2: Use One Selected Phrase for Audio and Popup

**Files:**
- Modify: `frontend/src/games/alphabet-match/game/useGame.ts`
- Modify: `frontend/src/games/alphabet-match/game/useSounds.ts`
- Modify: `frontend/src/games/alphabet-match/game/types.ts` only if a shared type is needed
- Modify: `frontend/src/games/alphabet-match/components/SuccessPopup.tsx`
- Modify: `frontend/src/games/alphabet-match/AlphabetMatchGame.tsx`
- Modify: existing tests for `useGame` and `SuccessPopup`

- [ ] Add failing tests proving `useGame` stores a success phrase index and speaks the formatted phrase.
- [ ] Add failing tests proving `SuccessPopup` renders a selected phrase.
- [ ] Implement the minimal code to pass those tests.
- [ ] Run the Alphabet Match focused test suite.
- [ ] Run frontend build verification.
