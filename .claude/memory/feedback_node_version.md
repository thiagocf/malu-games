---
name: node version requirement
description: Ambiente usa Node v16, mas Vite 5 e Vitest 1.6 exigem Node 18+ — testes falham sem upgrade
type: feedback
---

O ambiente tem **Node v16.13.0**. Vite 5 / Vitest 1.6 exigem Node 18+.

**Why:** `npm run test` falha com `TypeError: crypto.getRandomValues is not a function` — crypto.getRandomValues foi adicionado ao Node em v17.4.

**How to apply:** Sempre que for rodar testes, orientar o usuário a rodar `nvm use 18` antes. Não reportar como bug do código — é limitação do ambiente.
