# Multi-Deck Selection — Design Spec

**Date:** 2026-04-12  
**Status:** Approved

## Context

O Jogo da Memória da Malu tinha um único deck fixo (Animais). O objetivo é permitir que a Malu escolha entre múltiplos temas antes de jogar, tornando o app mais variado e reutilizável. Isso corresponde ao v2 planejado no roadmap do CLAUDE.md.

## Decks

5 decks, cada um com 8 itens (emoji + label em pt-BR):

| ID | Nome | Emoji rep. | Itens |
|---|---|---|---|
| `animals` | Animais | 🐶 | 🐶🐱🐸🦁🐰🐻🐧🦊 |
| `fruits` | Frutas | 🍎 | 🍎🍊🍋🍇🍓🍌🍉🍑 |
| `faces` | Expressões | 😀 | 😀😢😡😮😴🤔😍😂 |
| `vehicles` | Veículos | 🚗 | 🚗🚌🚂✈️🚁🚢🚀🏎️ |
| `foods` | Alimentos | 🍕 | 🍕🍔🌮🍦🍩🎂🍪🥪 |

## Fluxo

```
App inicia
  → selectedDeck === null → <DeckSelector>
  → usuário clica num deck → selectedDeck = DeckConfig
  → <GameHeader> + <Board> + (se isComplete) <GameOver>
  → GameOver aguarda 3s → chama onBackToMenu
  → selectedDeck = null → volta para <DeckSelector>
```

## Arquitetura

### Novo tipo

```ts
// src/games/memory/assets/decks/decks.ts
type DeckConfig = {
  id: string
  name: string
  emoji: string      // emoji representativo para o card de seleção
  items: Animal[]
}
```

### Novos arquivos

- `src/games/memory/assets/decks/decks.ts` — define `DECKS: DeckConfig[]` com os 5 decks, incluindo os dados de Animais. `animals/animals.ts` é removido (sem outros consumidores após a migração).
- `src/games/memory/components/DeckSelector.tsx` — tela de seleção.
- `src/games/memory/components/DeckSelector.module.css`

### Arquivos modificados

- `src/games/memory/game/types.ts` — adiciona `DeckConfig` (consistente com a arquitetura: todos os tipos vivem em `types.ts`).
- `src/App.tsx` — adiciona `useState<DeckConfig | null>(null)`, renderiza `<DeckSelector>` ou o jogo conforme estado. Substitui o import de `ANIMALS` pelo `selectedDeck.items` passado ao `Board`.
- `src/games/memory/components/GameOver.tsx` — recebe prop `onBackToMenu: () => void`, dispara após 3s no `useEffect`.

### DeckSelector

Props: `decks: DeckConfig[]`, `onSelect: (deck: DeckConfig) => void`

Layout: grid 2×2 de cards. O 5º card (quando ímpar) fica centralizado na última linha. Paleta e tipografia idênticas ao restante do app (lilás/roxo, Nunito, bordas 16–20px, sombras suaves).

### App.tsx (lógica central)

```tsx
const [selectedDeck, setSelectedDeck] = useState<DeckConfig | null>(null)

if (!selectedDeck) {
  return <DeckSelector decks={DECKS} onSelect={setSelectedDeck} />
}

const config = { deck: selectedDeck.items }
// renderiza GameHeader + Board + GameOver com onBackToMenu={() => setSelectedDeck(null)}
```

### GameOver (alteração)

```tsx
useEffect(() => {
  const timer = setTimeout(onBackToMenu, 3000)
  return () => clearTimeout(timer)
}, [onBackToMenu])
```

## O que NÃO muda

- `engine.ts` — zero alterações (já é deck-agnostic).
- `useGame.ts` — zero alterações.
- `useSounds.ts` — zero alterações.
- `Card.tsx`, `Board.tsx`, `GameHeader.tsx` — zero alterações.

## Verificação

1. `npm run dev` — navegar pelos 5 decks, confirmar que cada um carrega os emojis corretos.
2. Completar um jogo — confirmar redirect automático para seleção após ~3s.
3. `npm run test` — testes do engine devem continuar passando sem alteração.
4. `npm run build` — build de produção sem erros TypeScript.
