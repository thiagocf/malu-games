# Alphabet Match — Design Spec

## Resumo

Jogo educativo onde a criança associa uma letra do alfabeto à imagem de um animal cujo nome começa com aquela letra. Ex: **E** → Elefante.

Público-alvo: crianças de ~4 anos (pré-alfabetização).

## Mecânica do jogo

1. O jogo tem **5 turnos**
2. Em cada turno, uma **letra aleatória** é apresentada no centro da tela
3. Abaixo da letra, um **grid 2x2** mostra 4 imagens de animais — apenas 1 é correto
4. A criança toca na imagem que acha ser o animal cuja inicial corresponde à letra
5. **Acerto:** feedback visual positivo (brilho/destaque via CSS), avança automaticamente para o próximo turno após ~1.5s
6. **Erro:** popup mostra a imagem do animal selecionado + texto "Esse é o **G**ato!" (primeira letra em destaque) + botão 🔄 "Tentar novamente"
7. Novas tentativas são permitidas até acertar
8. Ao completar os 5 turnos, tela de fim de jogo mostra total de tentativas

### Regras de seleção de turnos

- Apenas letras que possuem pelo menos 1 animal no deck são elegíveis
- As 5 letras de cada partida são distintas (sem repetição)
- Os 3 distratores de cada turno devem ser animais de letras **diferentes** da letra do turno
- A posição do animal correto no grid é aleatória

## Estrutura de pastas

```
frontend/src/
  platform/
    components/
      GameSelector.tsx / .module.css    # tela inicial com cards dos jogos
      TopBar.tsx / .module.css          # barra superior "Malu Games" (home)
      ExitConfirmPopup.tsx / .module.css # popup "Quer sair do jogo?" com ✅/❌
  games/
    memory/              # sem mudanças
    alphabet-match/
      game/
        engine.ts          # funções puras
        engine.test.ts     # testes unitários
        types.ts           # tipos do jogo
        useGame.ts         # hook: estado + actions
        useSounds.ts       # sons via Web Audio API
      components/
        RoundScreen.tsx / .module.css    # letra + grid 2x2 de imagens
        FeedbackPopup.tsx / .module.css  # feedback de erro com nome do animal
        GameOver.tsx / .module.css       # resultado final
        GameHeader.tsx / .module.css     # progresso (turno X de 5)
      assets/
        animals/           # 56 imagens .jpeg
        animals.ts         # catálogo: id, label, imagePath, firstLetter
  App.tsx                  # orquestra: platform → jogo selecionado
```

## Modelo de dados

```ts
// games/alphabet-match/game/types.ts

type Animal = {
  id: string
  label: string        // "Elefante"
  imagePath: string    // caminho para o .jpeg
  firstLetter: string  // "E"
}

type Round = {
  letter: string              // letra do turno
  correctAnimal: Animal       // animal correto
  options: Animal[]           // 4 opções (inclui o correto)
  attempts: number            // tentativas neste turno
  completed: boolean
}

type GameState = {
  rounds: Round[]
  currentRoundIndex: number
  totalAttempts: number       // soma de attempts de todas as rounds
  isComplete: boolean
}

type GameConfig = {
  totalRounds: number         // 5
  animals: Animal[]           // catálogo completo
}
```

## Engine (funções puras)

```ts
// games/alphabet-match/game/engine.ts

buildAvailableLetters(animals: Animal[]): string[]
// Retorna letras distintas que possuem pelo menos 1 animal no catálogo

createGame(config: GameConfig): GameState
// Sorteia N letras distintas, para cada uma:
//   - escolhe 1 animal correto (aleatório entre os da letra)
//   - escolhe 3 distratores (animais de letras diferentes)
//   - embaralha as 4 opções

checkAnswer(state: GameState, animalId: string): { correct: boolean; selectedAnimal: Animal }
// Verifica se o animal selecionado é o correto do turno atual

recordAttempt(state: GameState): GameState
// Incrementa attempts do round atual e totalAttempts

completeRound(state: GameState): GameState
// Marca round como completed

advanceRound(state: GameState): GameState
// Avança currentRoundIndex, marca isComplete se era o último turno
```

## Hook (useGame)

```ts
// games/alphabet-match/game/useGame.ts

useGame(config: GameConfig) => {
  state: GameState
  currentRound: Round
  selectAnimal: (animalId: string) => void  // checa resposta, mostra feedback
  dismissFeedback: () => void               // fecha popup de erro
  restart: () => void                       // reinicia o jogo
}
```

Fluxo interno do hook:
1. `selectAnimal` chama `checkAnswer`
2. Se **errou**: incrementa tentativas via `recordAttempt`, seta estado de feedback (mostra popup)
3. `dismissFeedback`: fecha popup, permite nova tentativa
4. Se **acertou**: `completeRound`, delay de ~1.5s, `advanceRound`

## Sons (Web Audio API)

- **Acerto:** tom ascendente alegre
- **Erro:** tom suave neutro (não punitivo)
- **Vitória (5/5):** melodia curta de celebração

Implementação em `useSounds.ts`, mesmo padrão do jogo da memória.

## Plataforma (navegação entre jogos)

### TopBar

- Barra superior fixa em todas as telas
- Exibe "Malu Games" (ou logo)
- Clique abre popup de confirmação para sair do jogo atual

### ExitConfirmPopup

- "Quer sair do jogo?"
- Botões: ❌ "Não" (fechar popup) e ✅ "Sim" (volta ao GameSelector)
- Só aparece quando a criança está dentro de um jogo

### GameSelector

- Cards visuais grandes para cada jogo disponível
- Card "Jogo da Memória" (emoji 🃏 ou similar)
- Card "Alphabet Match" (emoji 🔤 ou similar)
- Botão de configurações (⚙️) para o jogo da memória

### Mudanças no App.tsx

Estado de navegação:
```
selectedGame: null | 'memory' | 'alphabet-match'

null              → <TopBar /> + <GameSelector />
'memory'          → <TopBar /> + fluxo atual do jogo da memória
'alphabet-match'  → <TopBar /> + <AlphabetMatchGame />
```

### Mudanças no GameOver do jogo da memória

Substituir "Voltar ao menu" por:
- 🔄 "Jogar novamente" — reinicia com mesmo deck
- 🏠 "Outro jogo" — volta ao GameSelector

## UI e Visual

### Paleta e estilo

Segue o padrão existente:
- Paleta lilás/roxo (`#a855f7`, `#c084fc`) e rosa (`#ec4899`, `#f0abfc`)
- Fundo gradiente lilás → rosa
- Bordas arredondadas (16–20px), sombras suaves
- Fonte Nunito/Fredoka One
- CSS Modules, sem bibliotecas de animação

### Botões

Todos os botões usam **ícone + texto**:
- 🔄 Tentar novamente
- 🔄 Jogar novamente
- 🏠 Outro jogo

Ícones grandes e coloridos, adequados para crianças pequenas. O texto serve como apoio para adultos que acompanham.

### RoundScreen (tela principal)

- **Topo:** GameHeader com progresso ("Turno 2 de 5")
- **Centro:** letra grande e destacada (fonte grande, cor contrastante)
- **Abaixo:** grid 2x2 com imagens de animais como botões grandes e arredondados
- Imagens com borda e sombra suave, hover/active com destaque

### FeedbackPopup (erro)

- Overlay semi-transparente
- Card centralizado com:
  - Imagem do animal selecionado
  - Texto: "Esse é o **G**ato!" (primeira letra em negrito/cor destaque)
  - Botão 🔄 "Tentar novamente"

### GameOver (fim de jogo)

- Mensagem de parabéns (celebração visual)
- Total de tentativas (exibição neutra, sem julgamento)
- Botões: 🔄 "Jogar novamente" e 🏠 "Outro jogo"

## Catálogo de animais

56 imagens `.jpeg` em `assets/animals/`, cobrindo 21 letras:

| Letra | Animais |
|-------|---------|
| A | abelha, aguia, alce |
| B | baleia, beija-flor, besouro, borboleta, burro |
| C | cachorro, cavalo, cobra, coelho |
| D | dinossauro |
| E | elefante, esquilo, estrela-do-mar |
| F | flamingo, foca, formiga |
| G | gato, girafa |
| H | hamster, hiena, hipopotamo |
| I | iguana |
| J | jacaré, joaninha |
| L | leao, lobo, lontra |
| M | macaco, minhoca, morcego, mosquito |
| O | onça, ornitorrinco, ovelha |
| P | pato, peixe, porco |
| Q | quati, quero-quero |
| R | raposa, rato, rinoceronte |
| S | sapo, suricato |
| T | tartaruga, tigre, touro, tucanuçu |
| U | urso, urubu |
| V | vaca, veado |
| Z | zebra |

**Letras sem cobertura (excluídas dos turnos):** K, N, W, X, Y.

## Testes

- Testes unitários para `engine.ts` (mesmo padrão do jogo da memória):
  - `buildAvailableLetters` retorna apenas letras com animais
  - `createGame` gera rounds com letras distintas e 4 opções
  - `checkAnswer` retorna correto/incorreto
  - `recordAttempt` incrementa contadores
  - `advanceRound` avança e detecta fim de jogo
- Componentes não precisam de testes por ora (mesmo padrão atual)

## Fora de escopo

- Outros decks além de animais (frutas, veículos, etc.)
- Configuração de número de turnos
- Modo multiplayer
- Animações além de CSS puro
- Áudio de pronúncia do nome do animal
