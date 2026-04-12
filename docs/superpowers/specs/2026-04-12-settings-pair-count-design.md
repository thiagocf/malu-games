# Settings: Configurar Quantidade de Pares

**Data:** 2026-04-12
**Status:** Aprovado

## Objetivo

Adicionar uma tela de configurações ao Jogo da Memória, acessível a partir da tela inicial. A primeira configuração permite ao jogador escolher quantos pares de cartas quer usar na partida.

## Requisitos

- Opções fixas de pares: **4, 6, 8, 10, 12**
- Valor padrão: **8 pares** (comportamento atual)
- Máximo: **12 pares** (24 cartas)
- Grid mantém **4 colunas** sempre (cresce verticalmente)
- Configuração persiste enquanto o app estiver aberto (sem localStorage)

## Dados e Estado

### Novo tipo

```ts
type GameSettings = {
  pairCount: number // 4 | 6 | 8 | 10 | 12
}
```

### Mudança em GameConfig

```ts
type GameConfig = {
  deck: Animal[]
  pairCount: number
}
```

### Estado

- `App.tsx` gerencia `pairCount` via `useState(8)` e `showSettings` via `useState(false)`
- `pairCount` é passado para o componente `Game`, que repassa para `useGame`
- `createDeck` faz `config.deck.slice(0, config.pairCount)` antes de duplicar

## Fluxo de Navegação

```
DeckSelector ──(clica tema)──> Game
DeckSelector ──(clica ⚙️)───> Settings ──(clica ←)──> DeckSelector
```

- Fluxo principal (deck → jogo) não muda
- Settings é um fluxo lateral acessível pela engrenagem
- `showSettings === true` renderiza `<Settings>` em vez de `<DeckSelector>`

## Componentes

### Novos

- **`Settings.tsx`** + **`Settings.module.css`** em `src/games/memory/components/`
  - Props: `pairCount`, `onChangePairCount`, `onBack`
  - Renderiza título, 5 botões de seleção de pares, texto auxiliar "X pares = Y cartas"

### Modificados

- **`DeckSelector.tsx`**
  - Novo prop: `onOpenSettings: () => void`
  - Renderiza botão de engrenagem (⚙️) no canto superior direito

- **`App.tsx`**
  - Novos estados: `showSettings: boolean`, `pairCount: number`
  - Lógica condicional: `showSettings ? <Settings> : selectedDeck ? <Game> : <DeckSelector>`
  - Passa `pairCount` para `Game`

- **`engine.ts`**
  - `createDeck`: faz slice do deck com `config.pairCount` antes de duplicar

- **`types.ts`**
  - Adiciona `GameSettings`
  - `GameConfig` ganha campo `pairCount`

- **`decks.ts`**
  - Cada deck expandido de 8 para 12 itens

### Sem mudanças

- `Board.tsx`, `Card.tsx`, `GameHeader.tsx`, `GameOver.tsx`, `useGame.ts`, `useSounds.ts`

## Estilo Visual

Segue a estética existente do projeto (paleta lilás/rosa, Nunito/Fredoka One).

### Tela de Configurações

- Mesmo fundo gradiente lilás→rosa
- Botão "←" no canto superior esquerdo (fundo branco, borda lilás sutil, border-radius 12px)
- Título "⚙️ Configurações" com gradiente lilás/rosa no texto
- Seção "Quantidade de pares" dentro de card branco arredondado
- 5 botões em linha (4, 6, 8, 10, 12):
  - **Não selecionado:** fundo branco, borda lilás sutil
  - **Selecionado:** fundo gradiente lilás→rosa, texto branco, sombra mais forte
  - **Hover/active:** translateY e scale (mesmas transições dos cards de deck)
- Texto auxiliar: "X pares = Y cartas" em cinza claro
- Botões mínimo ~44px para toque de criança

### Engrenagem na tela inicial

- Ícone ⚙️ no canto superior direito do DeckSelector
- Fundo branco, borda lilás sutil, border-radius 12px
- Mesmo estilo de hover dos cards de deck

## Expansão dos Decks (8 → 12 itens)

### Animais (+4)
- 🐮 Vaca, 🐷 Porco, 🦋 Borboleta, 🐢 Tartaruga

### Frutas (+4)
- 🍒 Cereja, 🥭 Manga, 🍍 Abacaxi, 🫐 Mirtilo

### Expressões (+4)
- 🤩 Empolgado, 🥳 Festeiro, 🤗 Abraço, 😜 Brincalhão

### Veículos (+4)
- 🚲 Bicicleta, 🛵 Moto, 🚜 Trator, 🚒 Caminhão de bombeiro

### Alimentos (+4)
- 🍟 Batata frita, 🌭 Cachorro-quente, 🧁 Cupcake, 🍝 Espaguete

## Testes

Em `engine.test.ts`:

- `createDeck` com `pairCount: 4` → gera 8 cards (4 pares)
- `createDeck` com `pairCount: 12` → gera 24 cards (12 pares)
- `createDeck` com `pairCount: 8` (padrão) → gera 16 cards
- Cada `animalId` aparece exatamente 2 vezes no deck gerado

Sem testes de componente (conforme definido no projeto).
