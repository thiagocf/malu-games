# Design: Alphabet Match — Seleção + Confirmação + Feedback de Sucesso

**Data:** 2026-04-20  
**Status:** Aprovado

---

## Objetivo

Modificar o fluxo do jogo Alphabet Match para que a criança primeiro selecione um animal (ouvindo seu nome), e só então confirme a resposta. Adicionar feedback de sucesso com áudio ao acertar. Bloquear progressivamente as opções erradas para guiar a criança ao acerto.

---

## Fluxo de Interação

```
[Rodada exibe letra + 4 opções]
        ↓
Criança toca uma carta
        ↓
→ Carta fica destacada (selected)
→ Speech API fala: "Borboleta"
→ Botão "É esse! ✓" aparece
        ↓
Criança pode trocar (toca outra carta → fala novo nome)
        ↓
Criança aperta "É esse! ✓"
        ↓
    [ERROU]                        [ACERTOU]
       ↓                               ↓
FeedbackPopup abre             SuccessPopup abre
Fala: "Esse é o Borboleta!"    Fala: "Isso mesmo! Elefante,
Botão "Tentar novamente"             com a letra E!"
       ↓                        Botão "Próximo →"
Opção bloqueada (grayed out)           ↓
Seleção limpa                   Avança para próxima rodada
Tenta de novo com menos opções
```

**Regras:**
- A criança pode trocar a seleção livremente antes de confirmar; cada troca fala o nome do novo animal.
- Ao errar, a opção escolhida fica bloqueada (`disabled` + opacidade reduzida); a seleção é limpa.
- A criança sempre chega ao acerto — nunca é bloqueada do progresso.
- Erros por rodada são contabilizados no score final (comportamento já existente via `attempts`).
- Ao avançar de rodada: `selectedAnimalId` e `blockedIds` são resetados.

---

## Mudanças por Arquivo

### `useSounds.ts` — adicionar `speakAnimalName`

Nova função usando `window.speechSynthesis` com `lang: 'pt-BR'`:

```ts
speakAnimalName(label: string, letter?: string): void
```

- Sem `letter`: fala `"{label}"` (ao selecionar)
- Com `letter`: fala `"Isso mesmo! {label}, com a letra {letter}!"` (ao acertar)
- Ao errar (chamado pelo FeedbackPopup via prop ou efeito): fala `"Esse é o {label}!"`
- Falha silenciosa se `speechSynthesis` não estiver disponível.

### `useGame.ts` — novos estados e ações

| Adição | Tipo | Descrição |
|--------|------|-----------|
| `selectedAnimalId` | `string \| null` | Animal atualmente selecionado |
| `blockedIds` | `string[]` | Opções já erradas nesta rodada |
| `previewAnimal(animalId)` | `(id: string) => void` | Seleciona + fala o nome (substitui o clique direto) |
| `confirmAnimal()` | `() => void` | Verifica resposta do animal selecionado |

- `selectAnimal` é renomeado internamente; a API pública exposta ao `RoundScreen` passa a ser `previewAnimal` + `confirmAnimal`.
- `showCorrect` passa a controlar o `SuccessPopup` em vez de apenas o highlight na carta.
- Ao avançar de rodada: limpa `selectedAnimalId` e `blockedIds`.

### `RoundScreen.tsx` — novos props

| Prop | Tipo | Uso |
|------|------|-----|
| `selectedAnimalId` | `string \| null` | Destaca carta selecionada |
| `blockedIds` | `string[]` | Desabilita + acinzenta opções erradas |
| `onPreview` | `(id: string) => void` | Toque na carta |
| `onConfirm` | `() => void` | Botão "É esse! ✓" |

- Botão "É esse! ✓" renderiza somente quando `selectedAnimalId !== null`.
- Carta bloqueada: `disabled={true}` + classe CSS de opacidade reduzida.
- Carta selecionada: borda destacada (cor primária do tema).
- Remove prop `onSelect` atual.

### `FeedbackPopup.tsx` — fala ao montar

- Sem mudança visual.
- Ao montar, chama `speakAnimalName(animal.label)` com prefixo "Esse é o".
- Recebe `onMount: () => void` como prop; `useGame` passa a função de fala. O componente não importa lógica diretamente.

### `SuccessPopup.tsx` — novo componente

Espelho visual do `FeedbackPopup`, com paleta de sucesso (verde):

```
[Foto do animal correto]
"Isso mesmo! Elefante, com a letra E!"
[Botão "Próximo →"]
```

- Ao montar: chama `speakAnimalName(label, letter)`.
- `onNext` chama `confirmSuccess` no `useGame` (que dispara `advanceRound`).

### `engine.ts` — sem alterações

A seleção é estado de UI, não lógica de jogo. O engine permanece inalterado.

---

## Degradação Graciosa (Speech API)

| Cenário | Comportamento |
|---------|---------------|
| `speechSynthesis` não suportado | Jogo funciona normalmente, sem áudio verbal |
| Voz PT-BR indisponível | Usa voz padrão do dispositivo |
| Fala em progresso ao trocar seleção | Cancela fala anterior (`speechSynthesis.cancel()`) antes de falar o novo nome |

---

## O que não muda

- `engine.ts` — sem alterações
- `GameHeader.tsx` — sem alterações
- `GameOver.tsx` — sem alterações
- Lógica de score (contagem de `attempts`) — sem alterações
- Assets de imagens e dados de animais — sem alterações
