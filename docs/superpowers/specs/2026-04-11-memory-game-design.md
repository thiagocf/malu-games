# Jogo da Memória — Design Spec

**Data:** 2026-04-11
**Projeto:** malu-games
**Status:** Aprovado

---

## Contexto

Plataforma de jogos educativos de qualidade para a Malu, 4 anos. Sem propagandas, open source. O jogo da memória é o primeiro jogo da plataforma. O foco agora é entregar a versão web funcional; mobile e múltiplos decks são evoluções futuras.

---

## Objetivo

Entregar um jogo da memória web jogável pela Malu, com 8 pares de animais, visual suave e encantador, arquitetura limpa que separa lógica do jogo da interface, e estrutura de pastas preparada para receber jogos futuros.

---

## Stack

- **Framework:** React + Vite + TypeScript
- **Deploy:** GitHub Pages via GitHub Actions (gratuito, sem servidor)
- **Estilo:** CSS modules ou Tailwind — decidir durante implementação
- **Áudio:** nenhum na v1
- **Testes:** unitários para `engine.ts` (lógica pura)

---

## Estrutura de Pastas

```
src/
  games/
    memory/
      game/
        engine.ts       ← funções puras: shuffle, checkPair, isComplete
        useGame.ts      ← hook: expõe estado + actions para a UI
        types.ts        ← tipos: Card, GameState, GameConfig
      components/
        Board.tsx       ← grid de cartas
        Card.tsx        ← carta individual com animação de flip
        GameOver.tsx    ← tela de parabéns ao completar
        GameHeader.tsx  ← contador de tentativas + botão reiniciar
      assets/
        animals/        ← emojis ou SVGs dos 8 animais
  shared/               ← reservado para componentes de jogos futuros
  App.tsx
```

---

## Modelo de Dados

```ts
// types.ts

type Animal = {
  id: string       // "dog", "cat", "frog" ...
  emoji: string    // "🐶", "🐱", "🐸" ...
  label: string    // "Cachorro", "Gato", "Sapo" ...
}

type Card = {
  id: number         // índice único na grade (0–15)
  animalId: string   // referência ao Animal
  isFlipped: boolean
  isMatched: boolean
}

type GameState = {
  cards: Card[]
  flippedIds: number[]   // máximo 2 simultaneamente
  moves: number
  isComplete: boolean
}

type GameConfig = {
  deck: Animal[]   // v1: fixo (8 animais); v2+: personalizável
}
```

---

## Lógica do Jogo (`engine.ts`)

Funções puras, sem efeitos colaterais, sem dependência de React:

- `createDeck(config: GameConfig): Card[]` — gera 16 cartas (2× cada animal), embaralhadas
- `flipCard(state: GameState, id: number): GameState` — vira uma carta; se 2 estiverem abertas, compara o par
- `checkPair(state: GameState): GameState` — marca `isMatched` se os IDs dos animais forem iguais; caso contrário, desvia para `isFlipping: false` após delay
- `isComplete(state: GameState): boolean` — retorna `true` quando todas as cartas estão matched

---

## Hook (`useGame.ts`)

Interface entre lógica e UI:

```ts
function useGame(config: GameConfig): {
  cards: Card[]
  moves: number
  isComplete: boolean
  flipCard: (id: number) => void
  restart: () => void
}
```

A UI nunca acessa `engine.ts` diretamente — só interage com o hook.

---

## Componentes de UI

### `Board.tsx`
Grid 4×4, recebe `cards[]` e o callback `onFlip`. Responsivo — cabe em telas de tablet e celular.

### `Card.tsx`
Carta individual com dois lados (verso: `?` com gradiente lilás/rosa; frente: emoji do animal em fundo branco translúcido). Animação de flip via CSS `transform: rotateY(180deg)` com `transition: 0.4s`. Estados visuais:
- **Virada (verso):** gradiente `#c084fc → #f0abfc`, texto `?`
- **Revelada:** fundo branco translúcido, sombra suave, emoji
- **Par encontrado:** opacidade reduzida, borda verde suave — indica que está "fora do jogo"

### `GameHeader.tsx`
- Título "Jogo da Memória"
- Contador de tentativas
- Botão "↺ Novo" para reiniciar

### `GameOver.tsx`
Tela de parabéns exibida quando `isComplete === true`. Mostra número de tentativas e botão para jogar novamente. Animação de entrada simples (fade + scale).

---

## Visual

- **Fundo:** gradiente suave no `body` (lilás claro → rosa claro)
- **Paleta:** roxo/lilás (`#a855f7`, `#c084fc`) e rosa (`#ec4899`, `#f0abfc`) como cores primárias
- **Bordas:** arredondadas (`border-radius: 16–20px`)
- **Sombras:** suaves, sem dureza
- **Tipografia:** fonte arredondada (ex: `Nunito` ou `Fredoka One` do Google Fonts)
- **Animação de flip:** CSS puro, sem biblioteca

---

## Deck Inicial (v1)

8 animais representados por emoji:

| ID | Emoji | Label |
|---|---|---|
| dog | 🐶 | Cachorro |
| cat | 🐱 | Gato |
| frog | 🐸 | Sapo |
| lion | 🦁 | Leão |
| rabbit | 🐰 | Coelho |
| bear | 🐻 | Urso |
| penguin | 🐧 | Pinguim |
| fox | 🦊 | Raposa |

---

## Deploy

- Repositório público no GitHub
- GitHub Actions: `push` na `main` → build Vite → deploy no GitHub Pages
- URL final: `https://<usuario>.github.io/malu-games`

---

## Fora de Escopo (v1)

- Áudio / efeitos sonoros
- Múltiplos temas ou troca de deck
- Upload de fotos personalizadas
- Contas de usuário ou progresso salvo
- App mobile

---

## Evolução Planejada (pós-v1)

- **v2:** Seleção de tema (Animais, Frutas, Cores & Formas)
- **v3:** Deck personalizado — upload de fotos/imagens pela família
- **v4:** React Native via Expo para iOS/Android
