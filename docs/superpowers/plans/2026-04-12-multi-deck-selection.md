# Multi-Deck Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que a Malu escolha entre 5 temas (Animais, Frutas, Expressões, Veículos, Alimentos) antes de jogar o Jogo da Memória, com retorno automático à tela de seleção após concluir o jogo.

**Architecture:** Estado `selectedDeck: DeckConfig | null` em `App.tsx` controla qual tela renderizar — null mostra `DeckSelector`, definido mostra o jogo. `GameOver` ganha um `useEffect` que chama `onBackToMenu` após 3s. Engine, hook, e demais componentes não mudam.

**Tech Stack:** React 18, TypeScript, CSS Modules, Vitest

---

## File Map

| Ação | Arquivo | Responsabilidade |
|---|---|---|
| Modify | `src/games/memory/game/types.ts` | Adiciona tipo `DeckConfig` |
| Create | `src/games/memory/assets/decks/decks.ts` | Dados dos 5 decks |
| Create | `src/games/memory/components/DeckSelector.tsx` | Tela de seleção de tema |
| Create | `src/games/memory/components/DeckSelector.module.css` | Estilos da seleção |
| Modify | `src/games/memory/components/GameOver.tsx` | Adiciona `onBackToMenu` com auto-redirect 3s |
| Modify | `src/App.tsx` | Estado de seleção, renderização condicional |
| Delete | `src/games/memory/assets/animals/animals.ts` | Absorvido por `decks.ts` |

---

## Task 1: Adicionar tipo DeckConfig em types.ts

**Files:**
- Modify: `src/games/memory/game/types.ts`

- [ ] **Step 1: Adicionar DeckConfig ao final de types.ts**

Abrir `src/games/memory/game/types.ts` e adicionar após o tipo `GameConfig` existente:

```ts
export type Animal = {
  id: string
  emoji: string
  label: string
}

export type Card = {
  id: number
  animalId: string
  isFlipped: boolean
  isMatched: boolean
}

export type GameState = {
  cards: Card[]
  flippedIds: number[]
  moves: number
  isComplete: boolean
}

export type GameConfig = {
  deck: Animal[]
}

export type DeckConfig = {
  id: string
  name: string
  emoji: string
  items: Animal[]
}
```

- [ ] **Step 2: Verificar que TypeScript não reclama**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/games/memory/game/types.ts
git commit -m "feat: add DeckConfig type"
```

---

## Task 2: Criar decks.ts com os 5 decks

**Files:**
- Create: `src/games/memory/assets/decks/decks.ts`

- [ ] **Step 1: Criar o arquivo decks.ts**

Criar `src/games/memory/assets/decks/decks.ts` com o conteúdo:

```ts
import type { Animal, DeckConfig } from '../../game/types'

const ANIMALS_ITEMS: Animal[] = [
  { id: 'dog',     emoji: '🐶', label: 'Cachorro' },
  { id: 'cat',     emoji: '🐱', label: 'Gato'     },
  { id: 'frog',    emoji: '🐸', label: 'Sapo'     },
  { id: 'lion',    emoji: '🦁', label: 'Leão'     },
  { id: 'rabbit',  emoji: '🐰', label: 'Coelho'   },
  { id: 'bear',    emoji: '🐻', label: 'Urso'     },
  { id: 'penguin', emoji: '🐧', label: 'Pinguim'  },
  { id: 'fox',     emoji: '🦊', label: 'Raposa'   },
]

const FRUITS_ITEMS: Animal[] = [
  { id: 'apple',      emoji: '🍎', label: 'Maçã'     },
  { id: 'orange',     emoji: '🍊', label: 'Laranja'  },
  { id: 'lemon',      emoji: '🍋', label: 'Limão'    },
  { id: 'grapes',     emoji: '🍇', label: 'Uva'      },
  { id: 'strawberry', emoji: '🍓', label: 'Morango'  },
  { id: 'banana',     emoji: '🍌', label: 'Banana'   },
  { id: 'watermelon', emoji: '🍉', label: 'Melancia' },
  { id: 'peach',      emoji: '🍑', label: 'Pêssego'  },
]

const FACES_ITEMS: Animal[] = [
  { id: 'happy',     emoji: '😀', label: 'Feliz'      },
  { id: 'sad',       emoji: '😢', label: 'Triste'     },
  { id: 'angry',     emoji: '😡', label: 'Bravo'      },
  { id: 'surprised', emoji: '😮', label: 'Surpreso'   },
  { id: 'sleepy',    emoji: '😴', label: 'Com sono'   },
  { id: 'thinking',  emoji: '🤔', label: 'Pensativo'  },
  { id: 'love',      emoji: '😍', label: 'Apaixonado' },
  { id: 'laughing',  emoji: '😂', label: 'Gargalhando'},
]

const VEHICLES_ITEMS: Animal[] = [
  { id: 'car',        emoji: '🚗', label: 'Carro'      },
  { id: 'bus',        emoji: '🚌', label: 'Ônibus'     },
  { id: 'train',      emoji: '🚂', label: 'Trem'       },
  { id: 'airplane',   emoji: '✈️',  label: 'Avião'      },
  { id: 'helicopter', emoji: '🚁', label: 'Helicóptero'},
  { id: 'ship',       emoji: '🚢', label: 'Navio'      },
  { id: 'rocket',     emoji: '🚀', label: 'Foguete'    },
  { id: 'racecar',    emoji: '🏎️',  label: 'Kart'       },
]

const FOODS_ITEMS: Animal[] = [
  { id: 'pizza',   emoji: '🍕', label: 'Pizza'    },
  { id: 'burger',  emoji: '🍔', label: 'Hambúrguer'},
  { id: 'taco',    emoji: '🌮', label: 'Tacos'    },
  { id: 'icecream',emoji: '🍦', label: 'Sorvete'  },
  { id: 'donut',   emoji: '🍩', label: 'Rosquinha' },
  { id: 'cake',    emoji: '🎂', label: 'Bolo'     },
  { id: 'cookie',  emoji: '🍪', label: 'Biscoito' },
  { id: 'sandwich',emoji: '🥪', label: 'Sanduíche' },
]

export const DECKS: DeckConfig[] = [
  { id: 'animals',  name: 'Animais',    emoji: '🐶', items: ANIMALS_ITEMS  },
  { id: 'fruits',   name: 'Frutas',     emoji: '🍎', items: FRUITS_ITEMS   },
  { id: 'faces',    name: 'Expressões', emoji: '😀', items: FACES_ITEMS    },
  { id: 'vehicles', name: 'Veículos',   emoji: '🚗', items: VEHICLES_ITEMS },
  { id: 'foods',    name: 'Alimentos',  emoji: '🍕', items: FOODS_ITEMS    },
]
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/games/memory/assets/decks/decks.ts
git commit -m "feat: add decks data (animals, fruits, faces, vehicles, foods)"
```

---

## Task 3: Criar DeckSelector component

**Files:**
- Create: `src/games/memory/components/DeckSelector.tsx`
- Create: `src/games/memory/components/DeckSelector.module.css`

- [ ] **Step 1: Criar DeckSelector.module.css**

Criar `src/games/memory/components/DeckSelector.module.css`:

```css
.container {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  gap: 0.5rem;
}

.title {
  font-size: clamp(1.6rem, 5vw, 2.2rem);
  font-weight: 900;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  line-height: 1.2;
}

.subtitle {
  font-size: clamp(0.95rem, 3vw, 1.1rem);
  color: #c084fc;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 380px;
}

.card {
  background: rgba(255, 255, 255, 0.85);
  border: 2px solid rgba(192, 132, 252, 0.2);
  border-radius: 20px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.1);
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.22);
  border-color: #c084fc;
}

.card:active {
  transform: scale(0.96);
}

.cardLast {
  grid-column: 1 / -1;
  width: 50%;
  margin: 0 auto;
}

.emoji {
  font-size: clamp(2.4rem, 8vw, 3.2rem);
  line-height: 1;
}

.name {
  font-size: clamp(0.85rem, 2.5vw, 1rem);
  font-weight: 800;
  color: #374151;
}
```

- [ ] **Step 2: Criar DeckSelector.tsx**

Criar `src/games/memory/components/DeckSelector.tsx`:

```tsx
import type { DeckConfig } from '../game/types'
import styles from './DeckSelector.module.css'

type Props = {
  decks: DeckConfig[]
  onSelect: (deck: DeckConfig) => void
}

export function DeckSelector({ decks, onSelect }: Props) {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>🎮 Jogo da Memória</h1>
      <p className={styles.subtitle}>Escolhe um tema para jogar!</p>
      <div className={styles.grid}>
        {decks.map((deck, i) => (
          <button
            key={deck.id}
            className={`${styles.card}${i === decks.length - 1 && decks.length % 2 !== 0 ? ` ${styles.cardLast}` : ''}`}
            onClick={() => onSelect(deck)}
          >
            <span className={styles.emoji}>{deck.emoji}</span>
            <span className={styles.name}>{deck.name}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/games/memory/components/DeckSelector.tsx src/games/memory/components/DeckSelector.module.css
git commit -m "feat: add DeckSelector component"
```

---

## Task 4: Atualizar GameOver com onBackToMenu

**Files:**
- Modify: `src/games/memory/components/GameOver.tsx`

O `GameOver` atual tem `onRestart: () => void`. Vamos adicionar `onBackToMenu: () => void` e um `useEffect` que o chama após 3000ms.

- [ ] **Step 1: Substituir o conteúdo de GameOver.tsx**

```tsx
import { useEffect } from 'react'
import styles from './GameOver.module.css'

type Props = {
  moves: number
  onRestart: () => void
  onBackToMenu: () => void
}

export function GameOver({ moves, onRestart, onBackToMenu }: Props) {
  useEffect(() => {
    const timer = setTimeout(onBackToMenu, 3000)
    return () => clearTimeout(timer)
  }, [onBackToMenu])

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.confetti} aria-hidden="true">
          {['🌟', '✨', '🎊', '⭐', '💫', '🌈', '🎉', '🦋'].map((e, i) => (
            <span key={i} className={styles.confettiPiece} style={{ '--ci': i } as React.CSSProperties}>
              {e}
            </span>
          ))}
        </div>
        <div className={styles.emoji}>🎉</div>
        <h2 className={styles.title}>Parabéns, Malu!</h2>
        <p className={styles.subtitle}>
          Você completou em <strong>{moves}</strong> tentativas!
        </p>
        <button className={styles.button} onClick={onRestart}>
          Jogar de novo
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: erro em `App.tsx` por falta da prop `onBackToMenu` — isso é esperado agora, será resolvido no Task 5.

- [ ] **Step 3: Commit**

```bash
git add src/games/memory/components/GameOver.tsx
git commit -m "feat: GameOver auto-redirects to menu after 3s via onBackToMenu"
```

---

## Task 5: Atualizar App.tsx com seleção de deck

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Substituir o conteúdo de App.tsx**

```tsx
import { useState } from 'react'
import { useGame } from './games/memory/game/useGame'
import { Board } from './games/memory/components/Board'
import { GameHeader } from './games/memory/components/GameHeader'
import { GameOver } from './games/memory/components/GameOver'
import { DeckSelector } from './games/memory/components/DeckSelector'
import { DECKS } from './games/memory/assets/decks/decks'
import type { DeckConfig } from './games/memory/game/types'
import './App.css'

export function App() {
  const [selectedDeck, setSelectedDeck] = useState<DeckConfig | null>(null)

  if (!selectedDeck) {
    return <DeckSelector decks={DECKS} onSelect={setSelectedDeck} />
  }

  return <Game deck={selectedDeck} onBackToMenu={() => setSelectedDeck(null)} />
}

function Game({ deck, onBackToMenu }: { deck: DeckConfig; onBackToMenu: () => void }) {
  const config = { deck: deck.items }
  const { cards, moves, isComplete, flipCard, restart } = useGame(config)

  return (
    <main className="app">
      <GameHeader moves={moves} onRestart={restart} />
      <Board cards={cards} animals={deck.items} onFlip={flipCard} />
      {isComplete && <GameOver moves={moves} onRestart={restart} onBackToMenu={onBackToMenu} />}
    </main>
  )
}
```

> **Nota:** O componente `Game` é interno a `App.tsx` (não exportado). Isso garante que `useGame` seja remontado cada vez que um novo deck é selecionado, recriando o estado do jogo corretamente.

- [ ] **Step 2: Verificar TypeScript sem erros**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 3: Rodar os testes**

```bash
npm run test
```

Expected: todos os testes do `engine.test.ts` passam (engine não foi alterado).

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add deck selection screen with 5 themes"
```

---

## Task 6: Remover animals.ts e verificação final

**Files:**
- Delete: `src/games/memory/assets/animals/animals.ts`

- [ ] **Step 1: Verificar que animals.ts não tem mais consumidores**

```bash
grep -r "animals/animals" src/
```

Expected: sem resultados (App.tsx já não importa mais).

- [ ] **Step 2: Deletar o arquivo**

```bash
rm src/games/memory/assets/animals/animals.ts
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 4: Rodar todos os testes**

```bash
npm run test
```

Expected: todos passam.

- [ ] **Step 5: Build de produção**

```bash
npm run build
```

Expected: build sem erros ou warnings de TypeScript.

- [ ] **Step 6: Smoke test manual**

```bash
npm run preview
```

Abrir no browser e verificar:
1. Tela inicial mostra os 5 cards de tema
2. Clicar em cada tema inicia o jogo com os emojis corretos
3. Completar um jogo → tela de GameOver aparece → após ~3s volta para a seleção
4. iOS Safari/Chrome: animação de flip funciona (webkit prefixes já existem)

- [ ] **Step 7: Commit final**

```bash
git add -A
git commit -m "chore: remove animals.ts (absorbed into decks.ts)"
```
