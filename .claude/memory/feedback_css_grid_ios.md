---
name: CSS grid items com aspect-ratio precisam de min-width: 0
description: Regra para evitar overflow de grid items no iOS WebKit quando combinados com aspect-ratio e imagens
type: feedback
---

Todo grid item com `aspect-ratio` deve ter `min-width: 0; min-height: 0`.

```css
.grid-item {
  aspect-ratio: 1;
  min-width: 0;
  min-height: 0;
}
```

Evitar `will-change: transform` em botões/cards como otimização preventiva — usar só quando há animação real acontecendo.

**Why:** No iOS WebKit, grid items têm `min-width: auto` por padrão. Com `aspect-ratio` e imagens JPEG (que têm tamanho intrínseco), isso cria uma dependência circular que faz o item vazar da coluna. `will-change: transform` agrava o problema criando compositing layers com bounding box expandido. Causou overflow de 23px no alphabet-match no iPhone 16 Pro Max (diagnosticado via debug overlay no device real).

**How to apply:** Sempre que criar um grid item com `aspect-ratio` — cards de jogo, galerias, qualquer layout grid com imagens.
