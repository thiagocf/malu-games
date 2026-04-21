---
name: malu-games setup status
description: Estado atual do projeto malu-games — o que foi feito e o que falta para completar o setup de deploy
type: project
---

Jogo da memória web para a Malu (4 anos), open source, sem ads. Implementação completa e commitada no repositório.

**Why:** Primeiro jogo de uma plataforma educativa para a filha do usuário. O foco foi entregar a v1 web rápido, com arquitetura limpa para evoluir depois para mobile (React Native).

**How to apply:** Ao retomar, verificar o que ainda falta no setup de deploy antes de qualquer nova feature.

---

## O que está pronto

- Código completo em `main`: React + Vite + TypeScript, 8 pares de animais, estilo suave/mágico
- Repositório: https://github.com/thiagocf/malu-games
- GitHub Actions workflow: `.github/workflows/deploy.yml` — roda testes + build + deploy no push para `main`
- `vite.config.ts` com `base: '/malu-games/'` (correto para GitHub Pages)
- URL final será: https://thiagocf.github.io/malu-games/

## O que FALTA para o deploy funcionar

1. **Autenticar o `gh` CLI:** `gh auth login`
2. **Ativar GitHub Pages via CLI:**
   ```bash
   gh api repos/thiagocf/malu-games/pages --method POST -f build_type=workflow
   ```
   Ou manualmente: GitHub → repo → Settings → Pages → Source → **GitHub Actions**
3. **Disparar o primeiro deploy** (o workflow roda automaticamente no próximo push, ou manualmente em Actions → Deploy to GitHub Pages → Run workflow)

## Node.js local

O projeto requer Node ≥ 20.9. Usar:
```bash
export PATH="/Users/thiagofernandes/.nvm/versions/node/v20.6.1/bin:$PATH"
```
(v20.6.1 é a versão mais recente disponível via nvm — funciona para dev/build, mas tem warnings de engine no ESLint)

## Stack e arquitetura

- `src/games/memory/game/engine.ts` — lógica pura (testável, sem React)
- `src/games/memory/game/useGame.ts` — hook React (separa lógica da UI)
- `src/games/memory/components/` — Card, Board, GameHeader, GameOver
- `src/games/memory/assets/animals/animals.ts` — deck dos 8 animais
- Testes: `npm test` (Vitest v1, 15 testes, todos no engine)
