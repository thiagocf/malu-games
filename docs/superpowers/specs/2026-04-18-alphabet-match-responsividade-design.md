# Alphabet Match — Responsividade UI

**Data:** 2026-04-18
**Escopo:** Melhorar responsividade do jogo Alphabet Match para mobile (portrait + landscape) e tablet
**Abordagem escolhida:** B — Fluid + media queries

---

## Contexto

O jogo Alphabet Match usa uma estratégia fluid (clamp, aspect-ratio, max-width) sem media queries. O design-critique identificou 5 problemas: valores px fixos no FeedbackPopup, font-size inacessível no GameHeader, padding excessivo no GameOver, experiência subótima em landscape mobile e espaço desperdiçado em tablet.

**Usuário-alvo:** criança de 4 anos, usa iPhone e iPad, portrait e landscape.

---

## Arquivos afetados

Apenas CSS modules — nenhuma mudança em TypeScript/TSX.

- `frontend/src/games/alphabet-match/components/FeedbackPopup.module.css`
- `frontend/src/games/alphabet-match/components/GameHeader.module.css`
- `frontend/src/games/alphabet-match/components/GameOver.module.css`
- `frontend/src/games/alphabet-match/components/RoundScreen.module.css`

---

## Seção 1 — Correções críticas (todos os tamanhos)

Mudanças pontuais sem alterar estrutura de layout.

| Arquivo | Seletor | Propriedade | Antes | Depois |
|---|---|---|---|---|
| `FeedbackPopup.module.css` | `.image` | `width` e `height` | `140px` | `clamp(80px, 35vw, 140px)` |
| `GameHeader.module.css` | `.label` | `font-size` | `0.65rem` | `0.75rem` |
| `GameOver.module.css` | `.card` | `padding` | `2.5rem 3rem` | `clamp(1.5rem, 5vw, 3rem)` |

**Motivação:**
- Imagem 140px fixa quebra o layout do FeedbackPopup em telas de 320px (card tem max-width 320px + width 90%)
- Font-size 0.65rem (~10px) está abaixo do mínimo de acessibilidade de 12px
- Padding 3rem lateral no GameOver comprime o conteúdo em 320px

---

## Seção 2 — Breakpoint tablet (≥ 600px)

Adicionar `@media (min-width: 600px)` em `RoundScreen.module.css`:

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

**Resultado:** Cards ~30% maiores em iPad. Touch target passa de ~140px para ~200px+ — mais confortável para 4 anos. A letra já usa `clamp(4rem, 12vw, 6rem)` e escala automaticamente.

---

## Seção 3 — Landscape mobile (orientation: landscape, max-height ≤ 500px)

Adicionar `@media (orientation: landscape) and (max-height: 500px)` em `RoundScreen.module.css`:

```css
@media (orientation: landscape) and (max-height: 500px) {
  .container {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    max-width: 100%;
    padding: 0.5rem 1rem;
  }
  .letterCard {
    padding: 0.75rem 1.25rem;
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

**Resultado:** Layout side-by-side — letra à esquerda, grid 2×2 à direita. Todo o conteúdo cabe na tela sem scroll em celulares landscape com ≤500px de altura (iPhone SE, iPhone 14 deitado, etc.).

---

## Comportamento por breakpoint

| Contexto | Container | Grid | Cards | Letra |
|---|---|---|---|---|
| Mobile portrait < 600px | max-width: 480px | max-width: 380px | aspect-ratio:1, ~145px | clamp(4rem,12vw,6rem) |
| Tablet ≥ 600px | max-width: 640px | max-width: 520px | min-height: 120px | clamp(4rem,12vw,6rem) |
| Landscape ≤ 500px altura | 100% width, flex row | sem max-width | altura por vh | clamp(2rem,8vh,3.5rem) |

---

## Fora de escopo

- Mudanças em TypeScript/TSX
- Novos componentes
- Breakpoint desktop (acima de 1024px) — o jogo não é foco em desktop
- Memory Game ou outros jogos — shared/ permanece vazia

---

## Critérios de sucesso

- [ ] FeedbackPopup não transborda em 320px de largura
- [ ] GameHeader `.label` tem font-size ≥ 12px
- [ ] GameOver não comprime conteúdo em 320px
- [ ] Cards no iPad têm ≥ 120px de altura
- [ ] Jogo completo visível sem scroll em landscape com 375×667px invertido
