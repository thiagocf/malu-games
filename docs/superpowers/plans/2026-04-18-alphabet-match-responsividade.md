# Alphabet Match — Responsividade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir 5 problemas de responsividade no Alphabet Match e melhorar a experiência em tablet e landscape mobile, alterando apenas CSS modules.

**Architecture:** Três correções pontuais em arquivos individuais (Tasks 1–3), seguidas de dois blocos `@media` adicionados em `RoundScreen.module.css` (Tasks 4–5). Nenhuma mudança em TypeScript ou estrutura de componentes.

**Tech Stack:** CSS Modules, Vite (`npm run dev`), Chrome DevTools para verificação de viewport.

---

## Arquivos modificados

| Arquivo | Caminho completo | Mudança |
|---|---|---|
| `FeedbackPopup.module.css` | `frontend/src/games/alphabet-match/components/FeedbackPopup.module.css` | `.image` width/height: px fixo → clamp |
| `GameHeader.module.css` | `frontend/src/games/alphabet-match/components/GameHeader.module.css` | `.label` font-size: 0.65rem → 0.75rem |
| `GameOver.module.css` | `frontend/src/games/alphabet-match/components/GameOver.module.css` | `.card` padding lateral: 3rem → clamp |
| `RoundScreen.module.css` | `frontend/src/games/alphabet-match/components/RoundScreen.module.css` | Adicionar `@media (min-width: 600px)` e `@media (orientation: landscape) and (max-height: 500px)` |

---

## Task 1: FeedbackPopup — imagem responsiva

**Files:**
- Modify: `frontend/src/games/alphabet-match/components/FeedbackPopup.module.css:38-41`

- [ ] **Step 1: Iniciar o servidor de desenvolvimento** (se não estiver rodando)

```bash
cd frontend && npm run dev
```

Abrir `http://localhost:5173` no Chrome.

- [ ] **Step 2: Verificar o problema atual**

No Chrome DevTools → Toggle device toolbar → selecionar iPhone SE (375×667) → jogar uma rodada errada para abrir o FeedbackPopup. A imagem deve aparecer com 140px fixos. Não é um bug visível a 375px, mas fica proporcional ao card. Agora testar em **320×568** (Galaxy S8 pequeno): a imagem ocupa quase toda a largura do card (max-width 320px, width 90% = 288px, padding 2rem = 32px cada lado → 224px úteis; imagem 140px ainda cabe mas deixa pouca margem para texto).

- [ ] **Step 3: Aplicar a correção**

Em `frontend/src/games/alphabet-match/components/FeedbackPopup.module.css`, substituir:

```css
.image {
  width: 140px;
  height: 140px;
  object-fit: contain;
  border-radius: 16px;
  display: block;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}
```

Por:

```css
.image {
  width: clamp(80px, 35vw, 140px);
  height: clamp(80px, 35vw, 140px);
  object-fit: contain;
  border-radius: 16px;
  display: block;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}
```

- [ ] **Step 4: Verificar a correção**

No DevTools, testar em **320×568**: a imagem deve ter `clamp(80px, 35vw=112px, 140px)` = 112px — cabe com espaço para o texto. Testar em **375×667**: imagem = `35vw=131px`. Testar em **768×1024** (iPad): imagem = `clamp(80, 269, 140)` = 140px (máximo). Todas as telas devem mostrar o FeedbackPopup sem overflow.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/games/alphabet-match/components/FeedbackPopup.module.css
git commit -m "fix(alphabet-match): imagem do FeedbackPopup responsiva com clamp"
```

---

## Task 2: GameHeader — font-size acessível

**Files:**
- Modify: `frontend/src/games/alphabet-match/components/GameHeader.module.css:21-22`

- [ ] **Step 1: Aplicar a correção**

Em `frontend/src/games/alphabet-match/components/GameHeader.module.css`, substituir:

```css
.label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #9333ea;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

Por:

```css
.label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9333ea;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

- [ ] **Step 2: Verificar**

Com o servidor rodando, verificar em qualquer viewport que o texto "TURNO" (ou label equivalente) no header está visível e legível. `0.75rem` = 12px — mínimo de acessibilidade. O layout do header não deve quebrar (o texto é pequeno por design, só cresce 1.5px).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/games/alphabet-match/components/GameHeader.module.css
git commit -m "fix(alphabet-match): aumentar font-size do label para mínimo acessível"
```

---

## Task 3: GameOver — padding responsivo

**Files:**
- Modify: `frontend/src/games/alphabet-match/components/GameOver.module.css:23`

- [ ] **Step 1: Aplicar a correção**

Em `frontend/src/games/alphabet-match/components/GameOver.module.css`, substituir apenas a linha de `padding` dentro de `.card`:

```css
.card {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  padding: 2.5rem 3rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
```

Por:

```css
.card {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  padding: 2.5rem clamp(1.5rem, 5vw, 3rem);
  text-align: center;
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
```

- [ ] **Step 2: Verificar**

Completar uma rodada do jogo para abrir o GameOver. Testar em **320×568**: o card deve ter padding lateral `clamp(1.5rem, 5vw=16px, 3rem)` = 16px — os botões e o texto devem caber sem overflow. Testar em **768px**: padding = `clamp(1.5rem, 38.4px, 3rem)` = 3rem (máximo) — visual idêntico ao atual.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/games/alphabet-match/components/GameOver.module.css
git commit -m "fix(alphabet-match): padding do GameOver responsivo em telas pequenas"
```

---

## Task 4: RoundScreen — breakpoint tablet (≥ 600px)

**Files:**
- Modify: `frontend/src/games/alphabet-match/components/RoundScreen.module.css` (adicionar ao final)

- [ ] **Step 1: Adicionar o bloco @media ao final do arquivo**

Adicionar ao final de `frontend/src/games/alphabet-match/components/RoundScreen.module.css`:

```css
@media (min-width: 600px) {
  .container {
    max-width: 640px;
  }

  .grid {
    max-width: 520px;
    gap: 1.25rem;
  }

  .option {
    min-height: 120px;
  }
}
```

- [ ] **Step 2: Verificar em tablet**

No DevTools, selecionar **iPad Mini (768×1024)**. O container deve expandir para até 640px, o grid para 520px, e os cards devem ter pelo menos 120px de altura — visivelmente maiores que no mobile. A letra já escala automaticamente via `clamp(4rem, 12vw, 6rem)` = `clamp(4rem, 92px, 6rem)` = 92px em 768px.

Verificar também em **600×900** (menor tablet/phablet): container 640px mas viewport só tem 600px → container fica em 100% → ok, não transborda.

- [ ] **Step 3: Verificar regressão em mobile**

Redimensionar para **375×667**: a media query não deve ativar. Cards devem ter comportamento idêntico ao anterior (aspect-ratio: 1, sem min-height).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/games/alphabet-match/components/RoundScreen.module.css
git commit -m "feat(alphabet-match): breakpoint tablet com cards maiores (≥600px)"
```

---

## Task 5: RoundScreen — layout landscape mobile

**Files:**
- Modify: `frontend/src/games/alphabet-match/components/RoundScreen.module.css` (adicionar ao final, após o bloco da Task 4)

- [ ] **Step 1: Adicionar o bloco @media landscape ao final do arquivo**

Adicionar ao final de `frontend/src/games/alphabet-match/components/RoundScreen.module.css` (após o bloco `@media (min-width: 600px)` da Task 4):

```css
@media (orientation: landscape) and (max-height: 500px) {
  .container {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    gap: 1.5rem;
    padding: 0 1rem;
  }

  .letterCard {
    padding: 0.75rem 1.25rem;
    flex-shrink: 0;
  }

  .letter {
    font-size: clamp(2rem, 8vh, 3.5rem);
  }

  .grid {
    max-width: none;
    gap: 0.75rem;
  }

  .option {
    min-height: 0;
  }
}
```

**Por que `min-height: 0`:** a Task 4 adiciona `min-height: 120px` para tablets (≥600px). Em landscape mobile a largura também pode ser ≥600px, então precisamos resetar para que os cards não fiquem altos demais em telas com pouca altura.

- [ ] **Step 2: Verificar em landscape mobile**

No DevTools, selecionar **iPhone SE** e girar (ou usar dimensões manuais **667×375**). O layout deve mudar para:
- Letra à esquerda (`.letterCard`) com fonte menor
- Grid 2×2 à direita
- Tudo visível sem scroll

Testar também em **812×375** (iPhone X landscape) — deve funcionar igualmente.

- [ ] **Step 3: Verificar que iPad landscape não é afetado**

Selecionar **iPad Mini landscape (1024×768)**. A altura é 768px > 500px, então a query `max-height: 500px` **não** dispara. O layout deve continuar como coluna (portrait padrão + tablet breakpoint da Task 4).

- [ ] **Step 4: Verificar regressão em portrait mobile**

Selecionar **375×667** (portrait). A query `orientation: landscape` não dispara. Comportamento idêntico ao original.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/games/alphabet-match/components/RoundScreen.module.css
git commit -m "feat(alphabet-match): layout landscape mobile side-by-side"
```

---

## Verificação final

- [ ] Testar o fluxo completo do jogo (5 rodadas + GameOver) nos 4 contextos:
  - iPhone SE portrait (375×667)
  - iPhone SE landscape (667×375)
  - iPad Mini portrait (768×1024)
  - Tela pequena portrait (320×568)
- [ ] Confirmar os critérios de sucesso do spec:
  - [ ] FeedbackPopup não transborda em 320px de largura
  - [ ] GameHeader label tem font-size ≥ 12px
  - [ ] GameOver não comprime conteúdo em 320px
  - [ ] Cards no iPad têm ≥ 120px de altura
  - [ ] Jogo completo visível sem scroll em landscape com 667×375
