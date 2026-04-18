# Auth + Backend — Design Spec

**Data:** 2026-04-13
**Projeto:** malu-games
**Status:** Aprovado

---

## Contexto

O projeto hoje é 100% estático — React + Vite no GitHub Pages, sem servidor, sem banco. Esta spec define a arquitetura para transformar malu-games em uma plataforma com área autenticada, preparada para guardar dados de performance dos jogadores em fases futuras.

---

## Objetivo

Adicionar autenticação com Google para pais/responsáveis, conectar o frontend a uma API NestJS própria, e preparar o banco de dados para a evolução da plataforma. A lógica dos jogos permanece intocada.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite + TypeScript (GitHub Pages) |
| Auth | Supabase (Google OAuth, emite JWT) |
| API | NestJS + TypeScript |
| ORM | Prisma |
| Banco | Supabase PostgreSQL |
| Hosting API | Railway ou Render |

---

## Arquitetura Geral

```
Frontend (GitHub Pages)
  supabase-js (só para auth)
      ↓
  Supabase Auth → Google OAuth → JWT
      ↓
  API NestJS (Railway/Render)
  JwtAuthGuard valida JWT via SUPABASE_JWT_SECRET
      ↓
  Supabase PostgreSQL (via Prisma)
```

O frontend usa `@supabase/supabase-js` exclusivamente para login/logout. Todo o restante (dados, perfis, performance) passa pela API NestJS.

---

## Autenticação

- Google OAuth gerenciado pelo Supabase
- Supabase emite JWT assinado com `SUPABASE_JWT_SECRET`
- NestJS valida o JWT localmente (sem round-trip ao Supabase por request)
- JWT armazenado em memória no frontend (via `AuthContext`) — não em `localStorage`
- Todas as chamadas à API incluem `Authorization: Bearer <jwt>`
- O `sub` do JWT é o UUID do pai — mesmo `id` usado na tabela `users`

---

## Estrutura do Repositório

Monorepo:

```
malu-games/
  frontend/        ← React atual (movido de src/ para frontend/)
  api/             ← NestJS novo
  package.json     ← workspaces
```

---

## Estrutura da API (NestJS)

Organização por vertical slices, cada slice é um módulo NestJS. Slices crescem para feature modules quando ganharem mais de uma feature distinta.

```
api/src/
  modules/
    auth/
      auth.module.ts
      auth.guard.ts              ← JwtAuthGuard
      current-user.decorator.ts  ← @CurrentUser()
      supabase.strategy.ts
    
    users/
      users.module.ts
      users.controller.ts        ← GET /users/me, POST /users/me
      users.service.ts
      users.dto.ts
      user.entity.ts
    
    child-profiles/              ← v2
      child-profiles.module.ts
      child-profiles.controller.ts
      child-profiles.service.ts
      child-profiles.dto.ts
      child-profile.entity.ts
    
    game-sessions/               ← v3 (estrutura reservada, vazia)
  
  app.module.ts
  main.ts
  prisma/
    schema.prisma
```

**Regra de dependência entre slices:** cada slice exporta apenas o `Service` quando outro slice precisar. Nunca importar arquivos internos de outro slice diretamente.

---

## Schema do Banco (Prisma)

```prisma
model User {
  id        String   @id         // UUID do Supabase Auth
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())

  childProfiles ChildProfile[]
}

model ChildProfile {
  id        String   @id @default(uuid())
  parentId  String
  name      String
  avatar    String?
  createdAt DateTime @default(now())

  parent User @relation(fields: [parentId], references: [id])
}
```

O `id` de `User` é o mesmo UUID emitido pelo Supabase Auth — sem tabela de mapeamento.

---

## Mudanças no Frontend

**Login é opcional.** Os jogos são acessíveis sem autenticação — o site funciona exatamente como hoje para quem não faz login. O login é um recurso para pais que queiram, futuramente, acompanhar performance dos filhos.

**Entra:**
- `@supabase/supabase-js` — login/logout Google
- `AuthContext` — guarda JWT em memória, expõe `user`, `signIn`, `signOut`, `isAuthenticated`
- Botão de login acessível na tela principal (ex: ícone no canto, ou opção no menu)
- Sem proteção de rotas — todos os jogos continuam livres

**Não muda:**
- `engine.ts`, `useGame.ts`, todos os componentes do jogo
- CSS Modules, visual, animações, sons
- Navegação atual (DeckSelector → Settings → Game)

**Fluxo (opcional):**
```
Usuário abre o site → jogos disponíveis imediatamente
  → opcionalmente clica "Entrar com Google"
  → Supabase redireciona, retorna JWT
  → AuthContext guarda o JWT em memória
  → chamadas à API (quando houver) incluem Authorization: Bearer <jwt>
  → jogos continuam funcionando normalmente, agora com identidade
```

---

## Deploy

```
GitHub (monorepo)
  frontend/ → GitHub Actions → GitHub Pages
  api/      → Railway ou Render (deploy via push na main)

Supabase
  Auth (Google OAuth configurado no dashboard)
  PostgreSQL (connection string em DATABASE_URL)
```

**Variáveis de ambiente da API:**
- `SUPABASE_JWT_SECRET` — valida JWTs sem round-trip
- `DATABASE_URL` — connection string do Supabase PostgreSQL

**Variáveis públicas do frontend:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Ambas são públicas por design do Supabase (a anon key não é um segredo).

---

## Fora de Escopo (esta fase)

- Dados de performance dos jogadores (v3)
- Múltiplos perfis de filhos com login próprio
- Dashboard de progresso
- Notificações ou relatórios para os pais

---

## Evolução Planejada

- **v2:** CRUD de perfis de filhos (`child-profiles` slice)
- **v3:** Registro de sessões de jogo e métricas de performance (`game-sessions` slice)
- **v4:** Dashboard de progresso por filho
