# Game Settings Placement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduzir `GameStartScreen` e `GameOverScreen` como componentes de plataforma com slot padronizado de botão de configuração (top-right), e migrar Memory e Alphabet-Match para usá-los.

**Architecture:** Dois componentes React em `frontend/src/platform/components/`. Cada jogo fornece `title` + conteúdo específico via children; se passar `onOpenSettings`, a plataforma renderiza o botão ⚙️ no canto superior direito. Regra: botão só aparece fora de partida ativa (telas de pré-jogo e fim de jogo).

**Tech Stack:** React 18 + TypeScript + Vite + CSS Modules + Vitest + Testing Library. Sem libs novas.

**Design system v2 (tokens observados no código — reaproveitar):**
- Teal primário: `#0d9488`, borda teal clara `#99f6e4`
- Texto: `#0f3a3a` (forte), `#5b6b6b` (secundário)
- Fundo butter: `#f5f1e8`
- Card: `background: #ffffff`, `border-radius: 14-22px`, `box-shadow: 0 1px 0 rgba(15,58,58,0.04), 0 2px 8px rgba(15,58,58,0.04)`
- Overlay do GameOver: `rgba(245,241,232,0.85)` + `backdrop-filter: blur(6px)`

---

## File Structure

**Criar:**
- `frontend/src/platform/components/GameStartScreen.tsx`
- `frontend/src/platform/components/GameStartScreen.module.css`
- `frontend/src/platform/components/GameStartScreen.test.tsx`
- `frontend/src/platform/components/GameOverScreen.tsx`
- `frontend/src/platform/components/GameOverScreen.module.css`
- `frontend/src/platform/components/GameOverScreen.test.tsx`

**Modificar:**
- `frontend/src/games/memory/components/DeckSelector.tsx`
- `frontend/src/games/memory/components/DeckSelector.module.css`
- `frontend/src/games/memory/components/GameOver.tsx`
- `frontend/src/games/memory/components/GameOver.module.css`
- `frontend/src/games/memory/components/GameOver.test.tsx` (atualizar contratos, sem mudar intenção)
- `frontend/src/games/alphabet-match/components/GameOver.tsx`
- `frontend/src/games/alphabet-match/components/GameOver.module.css`
- `frontend/src/App.tsx`

---

## Task 1 — `GameStartScreen` (plataforma)

**Files:**
- Create: `frontend/src/platform/components/GameStartScreen.tsx`
- Create: `frontend/src/platform/components/GameStartScreen.module.css`
- Test: `frontend/src/platform/components/GameStartScreen.test.tsx`

- [ ] **Step 1.1: Escrever testes (failing)**

Criar `frontend/src/platform/components/GameStartScreen.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameStartScreen } from './GameStartScreen'

describe('GameStartScreen', () => {
  it('renderiza title e children', () => {
    render(
      <GameStartScreen title="🎮 Jogo Teste">
        <div>conteudo-do-jogo</div>
      </GameStartScreen>
    )
    expect(screen.getByText('🎮 Jogo Teste')).toBeInTheDocument()
    expect(screen.getByText('conteudo-do-jogo')).toBeInTheDocument()
  })

  it('renderiza subtitle quando fornecido', () => {
    render(
      <GameStartScreen title="T" subtitle="Escolhe um tema!">
        <div />
      </GameStartScreen>
    )
    expect(screen.getByText('Escolhe um tema!')).toBeInTheDocument()
  })

  it('NÃO renderiza botão de config quando onOpenSettings ausente', () => {
    render(<GameStartScreen title="T"><div /></GameStartScreen>)
    expect(screen.queryByRole('button', { name: /configurações/i })).not.toBeInTheDocument()
  })

  it('renderiza botão de config quando onOpenSettings fornecido', () => {
    render(
      <GameStartScreen title="T" onOpenSettings={vi.fn()}><div /></GameStartScreen>
    )
    expect(screen.getByRole('button', { name: /configurações/i })).toBeInTheDocument()
  })

  it('clique no botão chama onOpenSettings', () => {
    const onOpenSettings = vi.fn()
    render(
      <GameStartScreen title="T" onOpenSettings={onOpenSettings}><div /></GameStartScreen>
    )
    fireEvent.click(screen.getByRole('button', { name: /configurações/i }))
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 1.2: Rodar teste para confirmar falha**

Run: `cd frontend && npm test -- GameStartScreen`
Expected: FAIL (módulo inexistente)

- [ ] **Step 1.3: Criar CSS module**

Criar `frontend/src/platform/components/GameStartScreen.module.css`:

```css
.container {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  gap: 0.5rem;
  position: relative;
}

.title {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 800;
  color: #0f3a3a;
  text-align: center;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 3rem;
}

.subtitle {
  font-size: clamp(0.95rem, 3vw, 1.125rem);
  color: #5b6b6b;
  font-weight: 500;
  text-align: center;
  margin-bottom: 1.75rem;
}

.gear {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  background: #ffffff;
  border: 1.5px solid #99f6e4;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #0f3a3a;
  cursor: pointer;
  box-shadow: 0 1px 0 rgba(15, 58, 58, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  font-family: inherit;
  font-weight: 600;
}

.gear:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.14);
  border-color: #0d9488;
}

.gear:active {
  transform: scale(0.97);
}
```

- [ ] **Step 1.4: Implementar componente**

Criar `frontend/src/platform/components/GameStartScreen.tsx`:

```tsx
import type { ReactNode } from 'react'
import styles from './GameStartScreen.module.css'

type Props = {
  title: ReactNode
  subtitle?: ReactNode
  onOpenSettings?: () => void
  children: ReactNode
}

export function GameStartScreen({ title, subtitle, onOpenSettings, children }: Props) {
  return (
    <main className={styles.container}>
      {onOpenSettings && (
        <button
          type="button"
          className={styles.gear}
          aria-label="Configurações"
          onClick={onOpenSettings}
        >
          ⚙️
        </button>
      )}
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {children}
    </main>
  )
}
```

- [ ] **Step 1.5: Rodar teste para confirmar passagem**

Run: `cd frontend && npm test -- GameStartScreen`
Expected: PASS (5 tests)

- [ ] **Step 1.6: Commit**

```bash
git add frontend/src/platform/components/GameStartScreen.tsx \
        frontend/src/platform/components/GameStartScreen.module.css \
        frontend/src/platform/components/GameStartScreen.test.tsx
git commit -m "feat(platform): adiciona GameStartScreen com slot de config top-right"
```

---

## Task 2 — `GameOverScreen` (plataforma)

**Files:**
- Create: `frontend/src/platform/components/GameOverScreen.tsx`
- Create: `frontend/src/platform/components/GameOverScreen.module.css`
- Test: `frontend/src/platform/components/GameOverScreen.test.tsx`

- [ ] **Step 2.1: Escrever testes (failing)**

Criar `frontend/src/platform/components/GameOverScreen.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameOverScreen } from './GameOverScreen'

describe('GameOverScreen', () => {
  it('renderiza title e children', () => {
    render(
      <GameOverScreen title="🎉 Parabéns!" onRestart={vi.fn()} onBackToMenu={vi.fn()}>
        <p>Estatísticas</p>
      </GameOverScreen>
    )
    expect(screen.getByText('🎉 Parabéns!')).toBeInTheDocument()
    expect(screen.getByText('Estatísticas')).toBeInTheDocument()
  })

  it('botão "Jogar de novo" chama onRestart', () => {
    const onRestart = vi.fn()
    render(
      <GameOverScreen title="T" onRestart={onRestart} onBackToMenu={vi.fn()}>
        <p />
      </GameOverScreen>
    )
    fireEvent.click(screen.getByText('Jogar de novo'))
    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('botão "Outro jogo" chama onBackToMenu', () => {
    const onBackToMenu = vi.fn()
    render(
      <GameOverScreen title="T" onRestart={vi.fn()} onBackToMenu={onBackToMenu}>
        <p />
      </GameOverScreen>
    )
    fireEvent.click(screen.getByText('Outro jogo'))
    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })

  it('aceita rótulos customizados', () => {
    render(
      <GameOverScreen
        title="T"
        onRestart={vi.fn()}
        onBackToMenu={vi.fn()}
        restartLabel="De novo!"
        menuLabel="Menu"
      >
        <p />
      </GameOverScreen>
    )
    expect(screen.getByText('De novo!')).toBeInTheDocument()
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('NÃO renderiza botão de config quando onOpenSettings ausente', () => {
    render(
      <GameOverScreen title="T" onRestart={vi.fn()} onBackToMenu={vi.fn()}>
        <p />
      </GameOverScreen>
    )
    expect(screen.queryByRole('button', { name: /configurações/i })).not.toBeInTheDocument()
  })

  it('botão de config chama onOpenSettings', () => {
    const onOpenSettings = vi.fn()
    render(
      <GameOverScreen
        title="T"
        onRestart={vi.fn()}
        onBackToMenu={vi.fn()}
        onOpenSettings={onOpenSettings}
      >
        <p />
      </GameOverScreen>
    )
    fireEvent.click(screen.getByRole('button', { name: /configurações/i }))
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2.2: Rodar teste para confirmar falha**

Run: `cd frontend && npm test -- GameOverScreen`
Expected: FAIL (módulo inexistente)

- [ ] **Step 2.3: Criar CSS module**

Criar `frontend/src/platform/components/GameOverScreen.module.css`:

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(245, 241, 232, 0.85);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: appear 0.26s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes appear {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.card {
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border-radius: 22px;
  padding: 2.5rem clamp(1.5rem, 5vw, 3rem);
  text-align: center;
  box-shadow: 0 12px 40px rgba(15, 58, 58, 0.16);
  border: 1px solid rgba(15, 58, 58, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: min(92vw, 420px);
}

.title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f3a3a;
  margin: 0 2.5rem;
  letter-spacing: -0.025em;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  width: 100%;
  margin-top: 0.5rem;
}

.button {
  background: #0d9488;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  padding: 0.75rem 1.75rem;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  box-shadow: 0 1px 0 rgba(15, 58, 58, 0.08);
  transition: opacity 0.15s;
}

.button:hover { opacity: 0.85; }

.buttonSecondary {
  background: #fff;
  border: 1.5px solid #99f6e4;
  border-radius: 12px;
  color: #0f3a3a;
  font-size: 1rem;
  font-weight: 700;
  padding: 0.75rem 1.75rem;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  transition: opacity 0.15s;
}

.buttonSecondary:hover { opacity: 0.85; }

.gear {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 40px;
  height: 40px;
  background: #ffffff;
  border: 1.5px solid #99f6e4;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: #0f3a3a;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.gear:hover {
  transform: translateY(-1px);
  border-color: #0d9488;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.14);
}

.gear:active { transform: scale(0.97); }
```

- [ ] **Step 2.4: Implementar componente**

Criar `frontend/src/platform/components/GameOverScreen.tsx`:

```tsx
import type { ReactNode } from 'react'
import styles from './GameOverScreen.module.css'

type Props = {
  title: ReactNode
  children: ReactNode
  onRestart: () => void
  onBackToMenu: () => void
  onOpenSettings?: () => void
  restartLabel?: string
  menuLabel?: string
}

export function GameOverScreen({
  title,
  children,
  onRestart,
  onBackToMenu,
  onOpenSettings,
  restartLabel = 'Jogar de novo',
  menuLabel = 'Outro jogo',
}: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        {onOpenSettings && (
          <button
            type="button"
            className={styles.gear}
            aria-label="Configurações"
            onClick={onOpenSettings}
          >
            ⚙️
          </button>
        )}
        <h2 className={styles.title}>{title}</h2>
        {children}
        <div className={styles.buttons}>
          <button className={styles.button} onClick={onRestart}>{restartLabel}</button>
          <button className={styles.buttonSecondary} onClick={onBackToMenu}>{menuLabel}</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2.5: Rodar teste para confirmar passagem**

Run: `cd frontend && npm test -- GameOverScreen`
Expected: PASS (6 tests)

- [ ] **Step 2.6: Commit**

```bash
git add frontend/src/platform/components/GameOverScreen.tsx \
        frontend/src/platform/components/GameOverScreen.module.css \
        frontend/src/platform/components/GameOverScreen.test.tsx
git commit -m "feat(platform): adiciona GameOverScreen com slot de config top-right"
```

---

## Task 3 — Migrar `DeckSelector` (memory) para usar `GameStartScreen`

**Files:**
- Modify: `frontend/src/games/memory/components/DeckSelector.tsx`
- Modify: `frontend/src/games/memory/components/DeckSelector.module.css`

- [ ] **Step 3.1: Substituir `DeckSelector.tsx`**

Conteúdo completo novo de `frontend/src/games/memory/components/DeckSelector.tsx`:

```tsx
import type { DeckConfig } from '../game/types'
import { GameStartScreen } from '../../../platform/components/GameStartScreen'
import styles from './DeckSelector.module.css'

type Props = {
  decks: DeckConfig[]
  onSelect: (deck: DeckConfig) => void
  onOpenSettings: () => void
}

export function DeckSelector({ decks, onSelect, onOpenSettings }: Props) {
  return (
    <GameStartScreen
      title="🎮 Jogo da Memória"
      subtitle="Escolhe um tema para jogar!"
      onOpenSettings={onOpenSettings}
    >
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
    </GameStartScreen>
  )
}
```

- [ ] **Step 3.2: Limpar `DeckSelector.module.css`**

Substituir conteúdo completo de `frontend/src/games/memory/components/DeckSelector.module.css` por:

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
  width: 100%;
  max-width: 380px;
}

.card {
  background: #ffffff;
  border: 1.5px solid #99f6e4;
  border-radius: 14px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 1px 0 rgba(15, 58, 58, 0.04), 0 2px 8px rgba(15, 58, 58, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.14);
  border-color: #0d9488;
}

.card:active {
  transform: scale(0.97);
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
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  font-weight: 700;
  color: #0f3a3a;
  letter-spacing: -0.01em;
}
```

(Removidas: `.container`, `.title`, `.subtitle`, `.gear` e suas variantes — migradas para `GameStartScreen.module.css`.)

- [ ] **Step 3.3: Rodar build + testes**

Run: `cd frontend && npm run build && npm test`
Expected: build OK, testes passando (nenhum teste direto de `DeckSelector`, então basta não quebrar outros).

- [ ] **Step 3.4: Verificação manual (dev server)**

Run: `cd frontend && npm run dev`
Abrir o Jogo da Memória. Verificar:
- Botão ⚙️ visível no canto superior direito, **abaixo** da `TopBar` global (não mais escondido).
- Clicar abre a tela de configurações (comportamento atual preservado).
- Grid de decks inalterado.

Encerrar o dev server quando validado.

- [ ] **Step 3.5: Commit**

```bash
git add frontend/src/games/memory/components/DeckSelector.tsx \
        frontend/src/games/memory/components/DeckSelector.module.css
git commit -m "refactor(memory): DeckSelector usa GameStartScreen da plataforma"
```

---

## Task 4 — Migrar `GameOver` do Memory para `GameOverScreen` + adicionar config

**Files:**
- Modify: `frontend/src/games/memory/components/GameOver.tsx`
- Modify: `frontend/src/games/memory/components/GameOver.module.css`
- Modify: `frontend/src/games/memory/components/GameOver.test.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 4.1: Atualizar `GameOver.test.tsx`**

Alterar as linhas 16, 23, 35, 42, 53, 58, 64, 71, 79, 84, 89, 96, 103 para passar a prop `onOpenSettings={vi.fn()}` ao `<GameOver ... />`, e adicionar o teste de visibilidade.

Substituir conteúdo completo de `frontend/src/games/memory/components/GameOver.test.tsx` por:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { GameOver } from './GameOver'
import type { Player } from '../game/types'

const soloPlayer: Player[] = [{ name: 'Bea', pairsFound: 4 }]
const duoWinner: Player[] = [{ name: 'Ana', pairsFound: 5 }, { name: 'Beto', pairsFound: 3 }]
const duoTie: Player[] = [{ name: 'Ana', pairsFound: 4 }, { name: 'Beto', pairsFound: 4 }]

const noop = () => {}

describe('CONTRACT: sem auto-redirect (solo e duo)', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('NÃO chama onBackToMenu automaticamente em modo solo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    act(() => { vi.advanceTimersByTime(10000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })

  it('NÃO chama onBackToMenu automaticamente em modo duo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    act(() => { vi.advanceTimersByTime(10000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })
})

describe('CONTRACT: auto-redirect ausente em modo duo', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('duo com vencedor — sem redirect após qualquer tempo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    act(() => { vi.advanceTimersByTime(60000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })

  it('duo em empate — sem redirect após qualquer tempo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoTie} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    act(() => { vi.advanceTimersByTime(60000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })
})

describe('GameOver — modo solo', () => {
  it('exibe o nome do jogador', () => {
    render(<GameOver moves={10} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    expect(screen.getByText('Parabéns, Bea!')).toBeInTheDocument()
  })

  it('exibe a contagem de moves', () => {
    render(<GameOver moves={42} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('botão "Jogar de novo" chama onRestart', () => {
    const onRestart = vi.fn()
    render(<GameOver moves={5} players={soloPlayer} onRestart={onRestart} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    fireEvent.click(screen.getByText(/Jogar de novo/))
    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('botão "Outro jogo" chama onBackToMenu em modo solo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={5} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    fireEvent.click(screen.getByText(/Outro jogo/))
    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })
})

describe('GameOver — modo duo', () => {
  it('exibe o nome do vencedor quando há um ganhador', () => {
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    expect(screen.getByText('Ana ganhou!')).toBeInTheDocument()
  })

  it('exibe "Empate!" quando os pontos são iguais', () => {
    render(<GameOver moves={10} players={duoTie} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    expect(screen.getByText('Empate!')).toBeInTheDocument()
  })

  it('exibe o placar dos dois jogadores', () => {
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    expect(screen.getAllByText(/Ana/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Beto/)).toBeInTheDocument()
  })

  it('botão "Jogar de novo" chama onRestart em modo duo', () => {
    const onRestart = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={onRestart} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    fireEvent.click(screen.getByText(/Jogar de novo/))
    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('botão "Outro jogo" chama onBackToMenu em modo duo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    fireEvent.click(screen.getByText(/Outro jogo/))
    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })
})

describe('GameOver — acesso a configurações', () => {
  it('renderiza botão de config quando onOpenSettings fornecido', () => {
    render(<GameOver moves={5} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={vi.fn()} />)
    expect(screen.getByRole('button', { name: /configurações/i })).toBeInTheDocument()
  })

  it('clique no botão chama onOpenSettings', () => {
    const onOpenSettings = vi.fn()
    render(<GameOver moves={5} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={onOpenSettings} />)
    fireEvent.click(screen.getByRole('button', { name: /configurações/i }))
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 4.2: Rodar teste para confirmar falha**

Run: `cd frontend && npm test -- memory/components/GameOver`
Expected: FAIL (prop `onOpenSettings` ainda não existe em GameOver)

- [ ] **Step 4.3: Reescrever `GameOver.tsx`**

Substituir conteúdo completo de `frontend/src/games/memory/components/GameOver.tsx` por:

```tsx
import type { Player } from '../game/types'
import { GameOverScreen } from '../../../platform/components/GameOverScreen'
import styles from './GameOver.module.css'

type Props = {
  moves: number
  players: Player[]
  onRestart: () => void
  onBackToMenu: () => void
  onOpenSettings?: () => void
}

export function GameOver({ moves, players, onRestart, onBackToMenu, onOpenSettings }: Props) {
  const isDuo = players.length > 1

  if (isDuo) {
    const winner =
      players[0].pairsFound > players[1].pairsFound
        ? players[0]
        : players[1].pairsFound > players[0].pairsFound
          ? players[1]
          : null

    return (
      <GameOverScreen
        title={winner ? `${winner.name} ganhou!` : 'Empate!'}
        onRestart={onRestart}
        onBackToMenu={onBackToMenu}
        onOpenSettings={onOpenSettings}
      >
        <div className={styles.emoji}>{winner ? '🏆' : '🎉'}</div>
        <div className={styles.scores}>
          {players.map((p, i) => (
            <p key={i} className={styles.scoreRow}>
              {p.name}: <strong>{p.pairsFound}</strong> {p.pairsFound === 1 ? 'par' : 'pares'}
            </p>
          ))}
        </div>
      </GameOverScreen>
    )
  }

  return (
    <GameOverScreen
      title={`Parabéns, ${players[0].name}!`}
      onRestart={onRestart}
      onBackToMenu={onBackToMenu}
      onOpenSettings={onOpenSettings}
    >
      <div className={styles.confetti} aria-hidden="true">
        {['★','✦','✧','◆','✺','✹','❋','✿'].map((e, i) => (
          <span key={i} className={styles.confettiPiece} style={{ '--ci': i, color: i % 2 ? '#fbbf24' : '#0d9488' } as React.CSSProperties}>
            {e}
          </span>
        ))}
      </div>
      <div className={styles.emoji}>🎉</div>
      <p className={styles.subtitle}>
        Você completou em <strong>{moves}</strong> tentativas!
      </p>
    </GameOverScreen>
  )
}
```

- [ ] **Step 4.4: Limpar `GameOver.module.css`**

Substituir conteúdo completo de `frontend/src/games/memory/components/GameOver.module.css` por (mantendo só confetti/emoji/subtitle/scores — overlay/card/title/buttons migraram pra plataforma):

```css
.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confettiPiece {
  position: absolute;
  font-size: clamp(1rem, 3vw, 1.25rem);
  top: -10%;
  left: calc(var(--ci, 0) * 12.5% + 4%);
  animation: fall 1.8s ease-in calc(var(--ci, 0) * 120ms) both;
  opacity: 0;
}

@keyframes fall {
  0%   { opacity: 0; transform: translateY(0)    rotate(0deg)   scale(0.8); }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(320px) rotate(360deg) scale(1.1); }
}

.emoji {
  font-size: 3.5rem;
  line-height: 1;
  animation: emojiPop 0.44s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

@keyframes emojiPop {
  0%   { transform: scale(0) rotate(-10deg); }
  70%  { transform: scale(1.12) rotate(4deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.subtitle {
  font-size: 1rem;
  color: #5b6b6b;
  font-weight: 500;
  margin: 0;
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.scoreRow {
  font-size: 1rem;
  color: #284a4a;
  font-weight: 500;
  margin: 0;
}
```

- [ ] **Step 4.5: Atualizar `App.tsx` — passar `onOpenSettings` para `GameOver`**

Modificar `frontend/src/App.tsx`. A função `MemoryGame` (linhas 74-115) precisa receber e propagar `onOpenSettings`. Conteúdo completo novo do arquivo:

```tsx
import { useState } from 'react'
import { TopBar } from './platform/components/TopBar'
import { GameSelector, type GameId } from './platform/components/GameSelector'
import { useGame } from './games/memory/game/useGame'
import { Board } from './games/memory/components/Board'
import { GameHeader } from './games/memory/components/GameHeader'
import { GameOver } from './games/memory/components/GameOver'
import { DeckSelector } from './games/memory/components/DeckSelector'
import { Settings } from './games/memory/components/Settings'
import { DECKS } from './games/memory/assets/decks/decks'
import { AlphabetMatchGame } from './games/alphabet-match/AlphabetMatchGame'
import type { DeckConfig, PlayerMode } from './games/memory/game/types'
import './App.css'

const DEFAULT_PAIR_COUNT = 8
const DEFAULT_PLAYER_NAMES = ['Jogador 1', 'Jogador 2']

export function App() {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null)
  const [selectedDeck, setSelectedDeck] = useState<DeckConfig | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [pairCount, setPairCount] = useState(DEFAULT_PAIR_COUNT)
  const [playerMode, setPlayerMode] = useState<PlayerMode>('solo')
  const [playerNames, setPlayerNames] = useState<string[]>(DEFAULT_PLAYER_NAMES)

  const handleBackToMenu = () => {
    setSelectedGame(null)
    setSelectedDeck(null)
    setShowSettings(false)
  }

  const openSettings = () => setShowSettings(true)

  return (
    <>
      <TopBar
        isInGame={selectedGame !== null}
        onExitGame={handleBackToMenu}
      />
      {selectedGame === null && (
        <GameSelector onSelect={setSelectedGame} />
      )}
      {selectedGame === 'memory' && (
        showSettings ? (
          <Settings
            pairCount={pairCount}
            onChangePairCount={setPairCount}
            playerMode={playerMode}
            playerNames={playerNames}
            onChangePlayerMode={setPlayerMode}
            onChangePlayerNames={setPlayerNames}
            onBack={() => setShowSettings(false)}
          />
        ) : !selectedDeck ? (
          <DeckSelector
            decks={DECKS}
            onSelect={setSelectedDeck}
            onOpenSettings={openSettings}
          />
        ) : (
          <MemoryGame
            deck={selectedDeck}
            pairCount={pairCount}
            players={playerMode === 'duo' ? playerNames : [playerNames[0]]}
            onBackToMenu={handleBackToMenu}
            onOpenSettings={openSettings}
          />
        )
      )}
      {selectedGame === 'alphabet-match' && (
        <AlphabetMatchGame onBackToMenu={handleBackToMenu} />
      )}
    </>
  )
}

function MemoryGame({
  deck,
  pairCount,
  players,
  onBackToMenu,
  onOpenSettings,
}: {
  deck: DeckConfig
  pairCount: number
  players: string[]
  onBackToMenu: () => void
  onOpenSettings: () => void
}) {
  const config = { deck: deck.items, pairCount, players }
  const {
    cards,
    moves,
    isComplete,
    players: playerState,
    currentPlayerIndex,
    flipCard,
    restart,
  } = useGame(config)

  return (
    <main className="app">
      <GameHeader
        moves={moves}
        players={playerState}
        currentPlayerIndex={currentPlayerIndex}
        onAbandon={onBackToMenu}
      />
      <Board cards={cards} animals={deck.items} onFlip={flipCard} />
      {isComplete && (
        <GameOver
          moves={moves}
          players={playerState}
          onRestart={restart}
          onBackToMenu={onBackToMenu}
          onOpenSettings={onOpenSettings}
        />
      )}
    </main>
  )
}
```

- [ ] **Step 4.6: Rodar testes + build**

Run: `cd frontend && npm test && npm run build`
Expected: todos passam, build OK.

- [ ] **Step 4.7: Verificação manual**

Run: `cd frontend && npm run dev`
Abrir Jogo da Memória, completar uma partida (modo solo com `pairCount=4` é rápido). Verificar na tela de GameOver:
- Botão ⚙️ aparece no canto superior direito do card.
- Clicar no ⚙️ abre a tela de configurações.
- Fechar configurações retorna para o fluxo anterior.
- Botões "Jogar de novo" e "Outro jogo" seguem funcionando.

Encerrar o dev server.

- [ ] **Step 4.8: Commit**

```bash
git add frontend/src/games/memory/components/GameOver.tsx \
        frontend/src/games/memory/components/GameOver.module.css \
        frontend/src/games/memory/components/GameOver.test.tsx \
        frontend/src/App.tsx
git commit -m "feat(memory): GameOver usa GameOverScreen + acesso a config no fim de jogo"
```

---

## Task 5 — Migrar `GameOver` do Alphabet-Match para `GameOverScreen` (sem config)

**Files:**
- Modify: `frontend/src/games/alphabet-match/components/GameOver.tsx`
- Modify: `frontend/src/games/alphabet-match/components/GameOver.module.css`

Nota: o alphabet-match **não** tem tela de configurações hoje. Portanto não passamos `onOpenSettings` — o botão não aparece (padrão opt-in). Objetivo é apenas consolidar o padrão visual.

- [ ] **Step 5.1: Reescrever `GameOver.tsx`**

Substituir conteúdo completo de `frontend/src/games/alphabet-match/components/GameOver.tsx` por:

```tsx
import { GameOverScreen } from '../../../platform/components/GameOverScreen'
import styles from './GameOver.module.css'

type Props = {
  totalAttempts: number
  totalRounds: number
  onRestart: () => void
  onBackToMenu: () => void
}

export function GameOver({ totalAttempts, totalRounds, onRestart, onBackToMenu }: Props) {
  return (
    <GameOverScreen
      title="Parabéns!"
      onRestart={onRestart}
      onBackToMenu={onBackToMenu}
    >
      <div className={styles.confetti} aria-hidden="true">
        {['★','✦','✧','◆','✺','✹','❋','✿'].map((e, i) => (
          <span key={i} className={styles.confettiPiece} style={{ '--ci': i, color: i % 2 ? '#fbbf24' : '#0d9488' } as React.CSSProperties}>
            {e}
          </span>
        ))}
      </div>
      <div className={styles.emoji}>🎉</div>
      <p className={styles.subtitle}>
        Você acertou {totalRounds} letras em <strong>{totalAttempts}</strong> {totalAttempts === 1 ? 'tentativa' : 'tentativas'}!
      </p>
    </GameOverScreen>
  )
}
```

- [ ] **Step 5.2: Limpar `GameOver.module.css`**

Substituir conteúdo completo de `frontend/src/games/alphabet-match/components/GameOver.module.css` por:

```css
.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confettiPiece {
  position: absolute;
  font-size: clamp(1rem, 3vw, 1.25rem);
  top: -10%;
  left: calc(var(--ci, 0) * 12.5% + 4%);
  animation: fall 1.8s ease-in calc(var(--ci, 0) * 120ms) both;
  opacity: 0;
}

@keyframes fall {
  0%   { opacity: 0; transform: translateY(0)    rotate(0deg)   scale(0.8); }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(320px) rotate(360deg) scale(1.1); }
}

.emoji {
  font-size: 3.5rem;
  line-height: 1;
  animation: emojiPop 0.44s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

@keyframes emojiPop {
  0%   { transform: scale(0) rotate(-10deg); }
  70%  { transform: scale(1.12) rotate(4deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.subtitle {
  font-size: 1rem;
  color: #5b6b6b;
  font-weight: 500;
  margin: 0;
}
```

- [ ] **Step 5.3: Rodar testes + build**

Run: `cd frontend && npm test && npm run build`
Expected: todos passam, build OK. (Não há teste específico do `GameOver` do alphabet-match hoje.)

- [ ] **Step 5.4: Verificação manual**

Run: `cd frontend && npm run dev`
Abrir Alphabet Match, jogar até o fim. Verificar:
- Tela de GameOver aparece com visual praticamente idêntico ao anterior.
- **Sem** botão ⚙️ (este jogo não tem config).
- Botões "Jogar de novo" e "Outro jogo" funcionando.

Encerrar o dev server.

- [ ] **Step 5.5: Commit**

```bash
git add frontend/src/games/alphabet-match/components/GameOver.tsx \
        frontend/src/games/alphabet-match/components/GameOver.module.css
git commit -m "refactor(alphabet-match): GameOver usa GameOverScreen da plataforma"
```

---

## Task 6 — Verificação final + lint

- [ ] **Step 6.1: Rodar suíte completa**

Run: `cd frontend && npm run lint && npm test && npm run build`
Expected: tudo verde.

- [ ] **Step 6.2: Smoke test de regressão (dev server)**

Run: `cd frontend && npm run dev`
Checklist:
- [ ] Menu principal → Memória → DeckSelector mostra ⚙️ **abaixo** da TopBar e responde ao clique.
- [ ] Config abre, permite mudar modo/nomes/pares, salva e volta.
- [ ] Iniciar partida (qualquer deck). ⚙️ **não aparece** durante a partida.
- [ ] Completar a partida → GameOver mostra ⚙️ no canto do card; clicar abre config.
- [ ] Menu principal → Alphabet Match → jogar até o fim → GameOver aparece **sem** ⚙️.
- [ ] Em viewport pequeno (iPhone SE ~375×667) e grande (1440px), o ⚙️ está sempre visível e nunca coberto.

Encerrar dev server.

- [ ] **Step 6.3: Sem commit nesta task**

Nada a commitar — apenas validação.

---

## Self-review notes

**Spec coverage:**
- Regra "config só fora da partida" → App.tsx passa `onOpenSettings` apenas em `DeckSelector` e `GameOver`; não tocado no `GameHeader` da partida.
- `GameStartScreen` + `GameOverScreen` em `platform/components/` → Tasks 1, 2.
- Opt-in por jogo → Alphabet Match não passa `onOpenSettings` (Task 5).
- Posição top-right padronizada → CSS `.gear` em ambos componentes.
- Painel de config em tela cheia → nenhuma mudança necessária (comportamento atual do `Settings` já é tela cheia).
- Refatoração do `DeckSelector` → Task 3.
- Refatoração dos dois `GameOver` → Tasks 4 e 5.

**Out of scope (explicitado na spec):** criar config para alphabet-match, extrair `showSettings` para contexto, atualizar CLAUDE.md — **não incluídos**.

**Tokens v2:** cores e dimensões reaproveitadas exatamente como aparecem em `DeckSelector.module.css` e `GameOver.module.css` atuais. Nada novo introduzido.
