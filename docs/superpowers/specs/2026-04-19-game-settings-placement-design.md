# Acesso a Configurações — Padrão Cross-Game

**Data:** 2026-04-19
**Escopo:** Definir um padrão estrutural para que qualquer jogo ofereça uma tela de configuração com botão de acesso em posição consistente e otimizada para UX.
**Abordagem escolhida:** Componentes de plataforma `GameStartScreen` + `GameOverScreen`, ambos opcionais, com slot padronizado de botão de configuração no canto superior direito.

---

## Contexto

### Problemas atuais

1. No Jogo da Memória, o botão ⚙️ vive dentro de `DeckSelector.tsx` (canto superior direito da tela). Como a `TopBar` global passou a ocupar o topo da página, o botão ficou **parcialmente coberto** pela barra em certos viewports.
2. Em telas grandes (desktop), o botão fica colado ao canto do conteúdo, longe do centro visual — **baixa visibilidade**.
3. Não há padrão cross-game: `alphabet-match` não tem configurações hoje e, quando tiver, cada jogo implementaria do seu jeito.
4. A paleta v1 (lilás/roxo) documentada no `CLAUDE.md` está desatualizada — o projeto já migrou para v2 (teal + butter, commit `6dd126f`). Nenhum código novo deste design deve hardcodar cores; usar os tokens do design system v2.

### Decisões já tomadas na brainstorm

- **Regra de visibilidade:** o botão de configuração aparece **somente quando não há partida em andamento**. Isso cobre a tela de pré-jogo e a tela de fim de jogo, e elimina o risco de a criança de 4 anos perder progresso por clique acidental.
- **Posição visual:** canto superior direito, dentro de dois containers estáveis que a plataforma oferece.
- **Abertura do painel:** tela cheia (substitui a tela atual), não modal.
- **Padrão opt-in por jogo:** jogos sem configuração simplesmente não usam o slot; nada aparece.

---

## Arquivos afetados

### Novos (plataforma)

- `frontend/src/platform/components/GameStartScreen.tsx` + `.module.css`
- `frontend/src/platform/components/GameOverScreen.tsx` + `.module.css`

### Modificados

- `frontend/src/games/memory/components/DeckSelector.tsx` — passa a renderizar conteúdo dentro de `GameStartScreen`; perde a engrenagem local e o `onOpenSettings` sai das props (a responsabilidade sobe).
- `frontend/src/games/memory/components/DeckSelector.module.css` — remove `.gear` e estilos relacionados.
- `frontend/src/games/memory/components/GameOver.tsx` + `.module.css` — migra para `GameOverScreen`, mantendo as estatísticas específicas do memory como `children`.
- `frontend/src/games/alphabet-match/components/GameOver.tsx` + `.module.css` — idem.
- `frontend/src/App.tsx` — passa a função de abrir configurações para `DeckSelector`/equivalente via `GameStartScreen`, e para os `GameOver` via `GameOverScreen`. A lógica de `showSettings` permanece no App.

### Possivelmente afetados (investigar na implementação)

- Testes de `GameOver` em ambos os jogos — atualizar asserções se a estrutura DOM mudar.

---

## Seção 1 — Componentes de plataforma

### `GameStartScreen`

**Papel:** container padronizado para telas de pré-jogo (antes da partida começar). Opcional — jogos sem pré-jogo não o usam.

**Props:**

```ts
type GameStartScreenProps = {
  title: ReactNode          // ex: "🎮 Jogo da Memória"
  subtitle?: ReactNode      // ex: "Escolhe um tema!"
  onOpenSettings?: () => void  // se ausente, botão não aparece
  children: ReactNode       // conteúdo específico do jogo (grid de decks, seletor, "Jogar!", etc.)
}
```

**Layout:**

- Container `<main>` ocupando a área abaixo da `TopBar` global.
- Se `onOpenSettings` fornecido: botão de configuração **absolutamente posicionado** no canto superior direito do container (`top` e `right` com valores dos tokens de spacing do design system v2), acima do `title`. Aria-label: "Configurações".
- `title` centralizado com margem horizontal suficiente para nunca colidir com o botão (reservar ~48px à direita).
- `subtitle` abaixo do title quando presente.
- `children` ocupa o espaço restante.

**Estilo visual:** seguir tokens v2 (paleta teal + butter). Sem hardcode de cor.

**Regra de responsividade:** o layout interno é responsabilidade dos `children`. O componente apenas garante: (a) botão não colidir com title, (b) botão sempre visível (nunca atrás da `TopBar`), (c) padding externo consistente com os tokens do design system.

### `GameOverScreen`

**Papel:** container padronizado para a tela de fim de jogo. Renderizada como overlay modal sobre a tela do jogo.

**Props:**

```ts
type GameOverScreenProps = {
  title: ReactNode          // ex: "🎉 Parabéns!"
  onOpenSettings?: () => void  // se ausente, botão não aparece
  onRestart: () => void
  onBackToMenu: () => void
  restartLabel?: string     // default: "Jogar de novo"
  menuLabel?: string        // default: "Menu"
  children: ReactNode       // estatísticas e conteúdo específico do jogo
}
```

**Layout:**

- Overlay com backdrop seguindo o padrão já usado pelos `GameOver` atuais (verificar tokens existentes).
- Card central com as mesmas regras do `GameStartScreen`: botão de config top-right absoluto, title central com margem à direita, children no meio, botões de ação na base.
- Botões de ação (`restart`, `menu`) em linha, com estilo "primário/secundário" conforme design system.

**Observação sobre o botão de config no GameOver:** abrir configurações daqui deve **voltar pro fluxo do jogo**, não pra uma partida nova. Caller decide (Memory: abre config e, ao fechar, volta pro `DeckSelector`; Alphabet-match: idem, se vier a ter config).

### Acessibilidade (ambos)

- Botão de config: `<button>` com `aria-label="Configurações"`, foco visível seguindo tokens v2.
- Tamanho-alvo mínimo 44×44px (WCAG AA + usabilidade criança).
- Contraste do botão vs fundo: 4.5:1 no mínimo.

---

## Seção 2 — Refatoração do Jogo da Memória

### `DeckSelector`

**Antes:**

```tsx
<main className={styles.container}>
  <button className={styles.gear} onClick={onOpenSettings}>⚙️</button>
  <h1>🎮 Jogo da Memória</h1>
  <p>Escolhe um tema para jogar!</p>
  <div className={styles.grid}>{/* decks */}</div>
</main>
```

**Depois:**

```tsx
<GameStartScreen
  title="🎮 Jogo da Memória"
  subtitle="Escolhe um tema para jogar!"
  onOpenSettings={onOpenSettings}
>
  <div className={styles.grid}>{/* decks */}</div>
</GameStartScreen>
```

**Remover do CSS:** `.container`, `.gear`, `.title`, `.subtitle` — movidos para o componente de plataforma. Manter apenas `.grid`, `.card`, `.emoji`, `.name`, `.cardLast`.

### `GameOver` (memory)

Migrar para `GameOverScreen`. O caller passa:

- `title`: mensagem de vitória já usada.
- `onOpenSettings`: callback que fecha o overlay e abre o painel de config.
- `restartLabel`, `menuLabel`: rótulos atuais.
- `children`: conteúdo atual de estatísticas (movimentos, placar se duo).

### `App.tsx`

Expandir o `showSettings` para poder ser aberto a partir do `GameOver`. Passar `onOpenSettings` como prop ao `GameOver` do memory.

---

## Seção 3 — Adoção opcional no Alphabet Match

**Fora do escopo deste spec** introduzir configurações no `alphabet-match`. Mas, como oportunidade estrutural:

- Migrar `alphabet-match/GameOver.tsx` para `GameOverScreen` **sem `onOpenSettings`** — apenas para consolidar o padrão visual. Isso mantém consistência visual entre jogos sem criar config que não existe.
- `GameStartScreen` no alphabet-match fica para quando houver configuração a oferecer (dificuldade, quantidade de rodadas, etc.). Não criar agora.

---

## Seção 4 — Princípios que guiam este design

1. **Regra única e previsível:** config só fora de partida. Uma frase, sem exceções, aplica a todos os jogos.
2. **Posição sempre igual:** top-right de um container estável. Em telas grandes e pequenas, a criança (e o adulto) sempre procura no mesmo lugar.
3. **Plataforma provê o slot; jogo provê o conteúdo:** separação clara de responsabilidades. Um jogo novo que quiser config só precisa passar `onOpenSettings` — zero decisão de UI a cada jogo.
4. **Opt-in, não imposto:** jogos sem config não têm botão. Sem placeholder, sem barra vazia.
5. **Zero conflito com a evolução da plataforma:** `TopBar` global fica livre para crescer com avatar/login/notificações sem disputar espaço com config de jogo.

---

## Fora de escopo

- Introduzir tela de configurações no `alphabet-match`.
- Extrair a lógica de `showSettings` para um contexto/hook de plataforma. Por ora, o `App.tsx` continua orquestrando.
- Atualizar o `CLAUDE.md` para refletir a paleta v2 (item separado de documentação).
- Permitir config durante partida (decisão explícita: não permitir na v1 do padrão).
