# Multiplayer — Jogo da Memória

**Data:** 2026-04-12
**Escopo:** Modo 1 ou 2 jogadores com nomes configuráveis, placar por jogador e tela de fim de jogo contextual.

---

## Contexto

O jogo hoje é solo com o nome "Malu" fixo no código. A criança inicia direto no jogo; adultos configuram pares e deck via Settings. O objetivo é manter essa simplicidade: o padrão continua sendo solo, e o modo 2 jogadores é opcional configurado por um adulto.

---

## Modelo de dados (`types.ts`)

```ts
export type Player = {
  name: string
  pairsFound: number
}

export type PlayerMode = 'solo' | 'duo'

export type GameState = {
  cards: Card[]
  flippedIds: number[]
  moves: number
  isComplete: boolean
  players: Player[]           // 1 ou 2 elementos
  currentPlayerIndex: number  // sempre 0 em solo
}

export type GameConfig = {
  deck: Animal[]
  pairCount: number
  players: string[]           // nomes — ['Jogador 1'] ou ['Jogador 1', 'Jogador 2']
}
```

**Invariante:** `players.length` é sempre 1 (solo) ou 2 (duo). O engine não tem nenhum `if (duo)` — o comportamento emerge do tamanho do array.

---

## Engine (`engine.ts`)

### `createDeck` — sem alteração (permanece pura, usada internamente)

### `createGame(config: GameConfig): GameState` — novo, substitui uso direto de `createDeck`

Inicializa o estado completo do jogo incluindo jogadores:

```ts
export function createGame(config: GameConfig): GameState {
  return {
    cards: createDeck(config),
    flippedIds: [],
    moves: 0,
    isComplete: false,
    players: config.players.map(name => ({ name, pairsFound: 0 })),
    currentPlayerIndex: 0,
  }
}
```

### `resolvePair` — acrescenta turno e placar

Após resolver as cartas:
- Se houve match: incrementa `pairsFound` do jogador atual; mantém `currentPlayerIndex`.
- Se errou: não altera `pairsFound`; avança `currentPlayerIndex` via `(i + 1) % players.length`.

`flipCard` e `isComplete` não mudam.

---

## Hook (`useGame.ts`)

- Substitui `createDeck(config)` por `createGame(config)` na inicialização e no `restart`.
- Passa a expor `players` e `currentPlayerIndex` no retorno.
- Detecção de `didMatch` para sons permanece igual (via `c.isMatched` após `resolvePair`).

---

## Settings (`Settings.tsx`)

### Novos props

```ts
playerMode: PlayerMode
playerNames: string[]           // sempre 2 strings; [1] ignorado em solo
onChangePlayerMode: (mode: PlayerMode) => void
onChangePlayerNames: (names: string[]) => void
```

### Layout

```
⚙️ Configurações

[ Solo ]  [ 2 Jogadores ]

Jogador 1: [____________]
Jogador 2: [____________]     ← visível apenas em modo duo

Quantidade de pares
  4  6  8  10  12

[ Salvar ]
```

- Inputs com `placeholder` = valor padrão ("Jogador 1", "Jogador 2").
- Se deixado em branco ao salvar, usa o placeholder como valor efetivo.
- O guard de alterações não salvas cobre todos os campos novos.

---

## `App.tsx`

Novo estado:

```ts
const [playerMode, setPlayerMode] = useState<PlayerMode>('solo')
const [playerNames, setPlayerNames] = useState(['Jogador 1', 'Jogador 2'])
```

`activePlayers` derivado antes de passar para `Game`:

```ts
const activePlayers = playerMode === 'duo' ? playerNames : [playerNames[0]]
```

`Game` recebe `players: string[]` e os repassa para `useGame` via `config`, e para `GameHeader` / `GameOver`.

---

## `GameHeader.tsx`

Recebe `players: Player[]` e `currentPlayerIndex: number`.

**Solo:**
```
Tentativas: 7     Jogo da Memória     [Abandonar]
[nome]: X pares
```

**Duo:**
```
Tentativas: 7     Jogo da Memória     [Abandonar]
Jogador 1: 3 pares  ●  Jogador 2: 1 par
Vez de: Jogador 1
```

---

## `GameOver.tsx`

Recebe `players: Player[]`. Sem `currentPlayerIndex` necessário — vencedor é quem tem mais `pairsFound`.

**Solo:**
```
🎉 Parabéns, [nome]!
Você completou em X tentativas!
[Jogar de novo]   [Menu]
```
Auto-redirect de 3s mantido.

**Duo — empate:**
```
🎉 Empate!
Jogador 1: 4 pares  |  Jogador 2: 4 pares
[Jogar de novo]   [Menu]
```
Sem auto-redirect — o usuário deve poder analisar o resultado com calma.

**Duo — vencedor:**
```
🏆 [nome] ganhou!
Jogador 1: 5 pares  |  Jogador 2: 3 pares
[Jogar de novo]   [Menu]
```
Sem auto-redirect.

---

## Testes

- `engine.test.ts`: atualizar chamadas para passar `players` no config; adicionar casos para troca de turno, acúmulo de pares, solo com 1 jogador.
- `Settings.test.tsx`: guard cobre campos novos; toggle de modo; nome em branco usa placeholder.
- `GameOver.test.tsx`: auto-redirect só em solo; duo fica estático.
- `GameHeader.test.tsx`: placar e indicador de vez em duo.

---

## Fora de escopo

- Histórico de partidas ou ranking persistido
- Modo online/remoto
- Mais de 2 jogadores
