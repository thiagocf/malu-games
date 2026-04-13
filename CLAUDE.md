# malu-games

Plataforma de jogos educativos para a Malu (4 anos). Sem propagandas, open source. O primeiro jogo é o Jogo da Memória com 8 pares de animais.

## Stack

- React 18 + TypeScript + Vite
- CSS Modules (sem Tailwind)
- Vitest para testes
- Deploy: GitHub Pages via GitHub Actions (`base: '/malu-games/'` no vite.config.ts)

## Comandos

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção (tsc + vite build)
npm run test       # roda testes uma vez
npm run test:watch # testes em modo watch
npm run lint       # ESLint
npm run preview    # preview do build
```

## Estrutura

```
src/
  games/
    memory/
      game/
        engine.ts      # funções puras: createDeck, flipCard, resolvePair, isComplete
        engine.test.ts # testes unitários do engine
        useGame.ts     # hook: expõe estado + actions para a UI
        useSounds.ts   # sons via Web Audio API (sem arquivos de áudio)
        types.ts       # Animal, Card, GameState, GameConfig
      components/
        Board.tsx / .module.css
        Card.tsx / .module.css
        GameHeader.tsx / .module.css
        GameOver.tsx / .module.css
      assets/animals/
        animals.ts     # 8 animais em emoji
  shared/              # reservado para componentes de jogos futuros
  App.tsx
```

## Arquitetura

**Separação estrita entre lógica e UI:**

- `engine.ts` — funções puras, sem React, sem efeitos colaterais. Testável de forma isolada.
- `useGame.ts` — único ponto de acesso à lógica. Gerencia delays (`setTimeout` de 1s antes de `resolvePair`). A UI nunca importa `engine.ts` diretamente.
- Componentes recebem apenas dados e callbacks — sem lógica de negócio.

**Sons:** gerados via Web Audio API em `useSounds.ts`. Sem arquivos `.mp3`/`.ogg`.

## Modelo de dados

```ts
type Animal = { id: string; emoji: string; label: string }
type Card   = { id: number; animalId: string; isFlipped: boolean; isMatched: boolean }
type GameState = { cards: Card[]; flippedIds: number[]; moves: number; isComplete: boolean }
type GameConfig = { deck: Animal[] }
```

## Visual

- Paleta: lilás/roxo (`#a855f7`, `#c084fc`) e rosa (`#ec4899`, `#f0abfc`)
- Fundo: gradiente suave lilás → rosa
- Bordas arredondadas (16–20px), sombras suaves
- Animação de flip: CSS puro (`transform: rotateY(180deg)`)
- Fonte arredondada (Nunito/Fredoka One)

## Regras de desenvolvimento

- Não adicionar features além do que foi pedido
- Não criar abstrações antecipadas para "jogos futuros" — a pasta `shared/` existe mas fica vazia até haver necessidade real
- Testes unitários para `engine.ts`; componentes não precisam de testes por ora
- Não usar bibliotecas de animação — CSS puro
- Não usar bibliotecas de som — Web Audio API

## Fora de escopo (v1)

- Múltiplos temas ou troca de deck
- Upload de fotos personalizadas
- Contas de usuário ou progresso salvo
- App mobile

## Evolução planejada

- v2: seleção de tema (Animais, Frutas, Cores & Formas)
- v3: deck personalizado via upload de fotos
- v4: React Native/Expo para iOS/Android

## Contratos de regressão (CONTRACT tests)

Blocos de teste nomeados `CONTRACT: ...` são invariantes do jogo.

**Regras para agentes:**
- Nunca delete ou enfraqueça um bloco `CONTRACT: ...`
- Se sua implementação causar falha em um CONTRACT, pare e reporte o conflito — não altere o teste
- Para mudar um contrato intencionalmente, o humano deve instruir explicitamente (ex: "Mude o CONTRACT do delay para 500ms")
- Novos invariantes descobertos podem receber seu próprio bloco `CONTRACT: ...`

Contratos ativos:
- `flipCard` retorna mesma referência quando guardado (React optimization)
- `resolvePair` incrementa moves em exatamente +1
- `resolvePair` sempre limpa flippedIds
- 1s de delay antes de resolvePair (UX deliberado)
- `isComplete` só true quando TODOS os cards estão matched
- IDs de items de deck são estáveis entre versões
- `createDeck` retorna 2 * pairCount cards
- Auto-redirect de GameOver em 3000ms
