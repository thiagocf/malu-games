# Alphabet Match — Seleção + Confirmação + Feedback de Sucesso

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar fluxo de seleção prévia com áudio (Web Speech API) e confirmação explícita, bloquear opções erradas progressivamente, e exibir popup de sucesso com fala ao acertar.

**Architecture:** `useSounds` ganha funções de fala via Web Speech API; `useGame` substitui `selectAnimal`/`showCorrect` por `previewAnimal`/`confirmAnimal`/`dismissSuccess` com estados `selectedAnimalId`, `blockedIds` e `success`; `RoundScreen` recebe novos props e renderiza botão de confirmar; `SuccessPopup` é criado como espelho do `FeedbackPopup`; `AlphabetMatchGame` conecta tudo.

**Tech Stack:** React 18, TypeScript, CSS Modules, Web Speech API (`window.speechSynthesis`), Vitest + Testing Library

---

## Mapa de arquivos

| Arquivo | Operação |
|--------|----------|
| `frontend/src/games/alphabet-match/game/useSounds.ts` | Modificar — adicionar `speakAnimalName`, `speakAnimalError` |
| `frontend/src/games/alphabet-match/game/useSounds.test.ts` | Criar — testes unitários do Speech API |
| `frontend/src/games/alphabet-match/game/useGame.ts` | Modificar — novo estado e ações |
| `frontend/src/games/alphabet-match/game/useGame.test.ts` | Modificar — atualizar para nova API |
| `frontend/src/games/alphabet-match/components/RoundScreen.tsx` | Modificar — novos props, botão confirmar |
| `frontend/src/games/alphabet-match/components/RoundScreen.module.css` | Modificar — classes `selected`, `blocked`, `confirmBtn` |
| `frontend/src/games/alphabet-match/components/RoundScreen.test.tsx` | Modificar — atualizar para nova API |
| `frontend/src/games/alphabet-match/components/FeedbackPopup.tsx` | Modificar — adicionar prop `onMount` |
| `frontend/src/games/alphabet-match/components/FeedbackPopup.test.tsx` | Modificar — testar `onMount` |
| `frontend/src/games/alphabet-match/components/SuccessPopup.tsx` | Criar |
| `frontend/src/games/alphabet-match/components/SuccessPopup.module.css` | Criar |
| `frontend/src/games/alphabet-match/components/SuccessPopup.test.tsx` | Criar |
| `frontend/src/games/alphabet-match/AlphabetMatchGame.tsx` | Modificar — conectar nova API do useGame |

---

## Task 1: Adicionar `speakAnimalName` e `speakAnimalError` ao `useSounds.ts`

**Files:**
- Criar: `frontend/src/games/alphabet-match/game/useSounds.test.ts`
- Modificar: `frontend/src/games/alphabet-match/game/useSounds.ts`

- [ ] **Step 1: Criar o arquivo de teste com mock do speechSynthesis**

```ts
// frontend/src/games/alphabet-match/game/useSounds.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSounds } from './useSounds'

const mockSpeak = vi.fn()
const mockCancel = vi.fn()

beforeEach(() => {
  mockSpeak.mockClear()
  mockCancel.mockClear()
  vi.stubGlobal('speechSynthesis', { speak: mockSpeak, cancel: mockCancel })
})

describe('useSounds — speakAnimalName', () => {
  it('cancela fala anterior e fala só o label quando letter não é fornecida', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakAnimalName('Abelha') })

    expect(mockCancel).toHaveBeenCalledTimes(1)
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Abelha')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('fala a frase de sucesso quando letter é fornecida', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakAnimalName('Elefante', 'E') })

    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Isso mesmo! Elefante, com a letra E!')
  })

  it('não lança erro quando speechSynthesis não está disponível', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useSounds())
    expect(() => {
      act(() => { result.current.speakAnimalName('Abelha') })
    }).not.toThrow()
  })
})

describe('useSounds — speakAnimalError', () => {
  it('fala a frase de erro com o nome do animal', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakAnimalError('Borboleta') })

    expect(mockCancel).toHaveBeenCalledTimes(1)
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Esse é o Borboleta!')
    expect(utterance.lang).toBe('pt-BR')
  })
})
```

- [ ] **Step 2: Rodar o teste para confirmar falha**

```bash
cd frontend && npm run test -- useSounds.test.ts
```

Esperado: FAIL com "result.current.speakAnimalName is not a function"

- [ ] **Step 3: Implementar `speakAnimalName` e `speakAnimalError` em `useSounds.ts`**

Substituir o conteúdo do arquivo por:

```ts
import { useCallback, useRef } from 'react'

function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx = (window.AudioContext ?? (window as unknown as Record<string, typeof AudioContext>)['webkitAudioContext'])
  return new AudioCtx()
}

function playTone(ctx: AudioContext, freq: number, type: OscillatorType, duration: number, gain = 0.18) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  gainNode.gain.setValueAtTime(gain, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'
  window.speechSynthesis.speak(utterance)
}

export function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext()
    }
    return ctxRef.current
  }, [])

  const playCorrect = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    playTone(ctx, 523, 'sine', 0.2, 0.2)
    setTimeout(() => playTone(ctx, 659, 'sine', 0.2, 0.22), 100)
    setTimeout(() => playTone(ctx, 784, 'sine', 0.3, 0.24), 200)
  }, [getCtx])

  const playWrong = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    playTone(ctx, 330, 'sine', 0.25, 0.12)
  }, [getCtx])

  const playVictory = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(ctx, freq, 'sine', 0.35, 0.25), i * 120)
    })
  }, [getCtx])

  const speakAnimalName = useCallback((label: string, letter?: string) => {
    speak(letter ? `Isso mesmo! ${label}, com a letra ${letter}!` : label)
  }, [])

  const speakAnimalError = useCallback((label: string) => {
    speak(`Esse é o ${label}!`)
  }, [])

  return { playCorrect, playWrong, playVictory, speakAnimalName, speakAnimalError }
}
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

```bash
cd frontend && npm run test -- useSounds.test.ts
```

Esperado: PASS (5 testes)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/games/alphabet-match/game/useSounds.ts \
        frontend/src/games/alphabet-match/game/useSounds.test.ts
git commit -m "feat(alphabet-match): adiciona speakAnimalName e speakAnimalError ao useSounds"
```

---

## Task 2: Refatorar `useGame.ts` — novo estado e ações

**Files:**
- Modificar: `frontend/src/games/alphabet-match/game/useGame.ts`
- Modificar: `frontend/src/games/alphabet-match/game/useGame.test.ts`

- [ ] **Step 1: Atualizar o mock de `useSounds` e reescrever os testes em `useGame.test.ts`**

Substituir o conteúdo por:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { StrictMode } from 'react'
import { useGame } from './useGame'
import type { Animal, GameConfig } from './types'

const playCorrect = vi.fn()
const playWrong = vi.fn()
const playVictory = vi.fn()
const speakAnimalName = vi.fn()
const speakAnimalError = vi.fn()

vi.mock('./useSounds', () => ({
  useSounds: () => ({ playCorrect, playWrong, playVictory, speakAnimalName, speakAnimalError }),
}))

const makeAnimal = (id: string, firstLetter: string): Animal => ({
  id,
  label: id.charAt(0).toUpperCase() + id.slice(1),
  imagePath: `/fake/${id}.jpeg`,
  firstLetter,
})

const animals: Animal[] = [
  makeAnimal('abelha', 'A'),
  makeAnimal('aguia', 'A'),
  makeAnimal('baleia', 'B'),
  makeAnimal('burro', 'B'),
  makeAnimal('cachorro', 'C'),
  makeAnimal('cavalo', 'C'),
  makeAnimal('dinossauro', 'D'),
  makeAnimal('elefante', 'E'),
]

function renderGame(config: GameConfig) {
  return renderHook(() => useGame(config), { wrapper: StrictMode })
}

beforeEach(() => {
  vi.useFakeTimers()
  playCorrect.mockClear()
  playWrong.mockClear()
  playVictory.mockClear()
  speakAnimalName.mockClear()
  speakAnimalError.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useGame — previewAnimal', () => {
  it('define selectedAnimalId ao chamar previewAnimal', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const animalId = result.current.currentRound!.options[0].id

    act(() => { result.current.previewAnimal(animalId) })

    expect(result.current.selectedAnimalId).toBe(animalId)
  })

  it('chama speakAnimalName com o label do animal selecionado', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const animal = result.current.currentRound!.options[0]

    act(() => { result.current.previewAnimal(animal.id) })

    expect(speakAnimalName).toHaveBeenCalledWith(animal.label)
  })

  it('troca a seleção ao chamar previewAnimal em outro animal', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const [first, second] = result.current.currentRound!.options

    act(() => { result.current.previewAnimal(first.id) })
    act(() => { result.current.previewAnimal(second.id) })

    expect(result.current.selectedAnimalId).toBe(second.id)
    expect(speakAnimalName).toHaveBeenCalledTimes(2)
  })

  it('não faz nada se o animal está em blockedIds', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!
    const wrongAnimal = round.options.find(a => a.id !== round.correctAnimal.id)!

    act(() => { result.current.previewAnimal(wrongAnimal.id) })
    act(() => { result.current.confirmAnimal() })
    act(() => { result.current.dismissFeedback() })

    speakAnimalName.mockClear()
    act(() => { result.current.previewAnimal(wrongAnimal.id) })

    expect(result.current.selectedAnimalId).toBeNull()
    expect(speakAnimalName).not.toHaveBeenCalled()
  })
})

describe('useGame — confirmAnimal (acerto)', () => {
  it('define success com o animal e a letra ao acertar', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!

    act(() => { result.current.previewAnimal(round.correctAnimal.id) })
    act(() => { result.current.confirmAnimal() })

    expect(result.current.success).not.toBeNull()
    expect(result.current.success!.animal.id).toBe(round.correctAnimal.id)
    expect(result.current.success!.letter).toBe(round.letter)
  })

  it('limpa selectedAnimalId após acerto', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!

    act(() => { result.current.previewAnimal(round.correctAnimal.id) })
    act(() => { result.current.confirmAnimal() })

    expect(result.current.selectedAnimalId).toBeNull()
  })

  it('chama playCorrect ao acertar', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!

    act(() => { result.current.previewAnimal(round.correctAnimal.id) })
    act(() => { result.current.confirmAnimal() })

    expect(playCorrect).toHaveBeenCalledTimes(1)
  })

  it('registra exatamente uma tentativa ao acertar', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!

    act(() => { result.current.previewAnimal(round.correctAnimal.id) })
    act(() => { result.current.confirmAnimal() })

    expect(result.current.state.totalAttempts).toBe(1)
  })
})

describe('useGame — dismissSuccess', () => {
  it('avança para a próxima rodada ao chamar dismissSuccess', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!

    act(() => { result.current.previewAnimal(round.correctAnimal.id) })
    act(() => { result.current.confirmAnimal() })
    act(() => { result.current.dismissSuccess() })

    expect(result.current.state.currentRoundIndex).toBe(1)
    expect(result.current.success).toBeNull()
  })

  it('reseta blockedIds ao avançar de rodada', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!
    const wrong = round.options.find(a => a.id !== round.correctAnimal.id)!

    act(() => { result.current.previewAnimal(wrong.id) })
    act(() => { result.current.confirmAnimal() })
    act(() => { result.current.dismissFeedback() })

    act(() => { result.current.previewAnimal(round.correctAnimal.id) })
    act(() => { result.current.confirmAnimal() })
    act(() => { result.current.dismissSuccess() })

    expect(result.current.blockedIds).toEqual([])
  })

  it('completa o jogo após a última rodada', () => {
    const totalRounds = 3
    const { result } = renderGame({ totalRounds, animals })

    for (let i = 0; i < totalRounds; i++) {
      const round = result.current.currentRound!
      act(() => { result.current.previewAnimal(round.correctAnimal.id) })
      act(() => { result.current.confirmAnimal() })
      act(() => { result.current.dismissSuccess() })
    }

    expect(result.current.state.isComplete).toBe(true)
  })

  it('toca vitória exatamente uma vez ao completar o jogo', () => {
    const totalRounds = 2
    const { result } = renderGame({ totalRounds, animals })

    for (let i = 0; i < totalRounds; i++) {
      const round = result.current.currentRound!
      act(() => { result.current.previewAnimal(round.correctAnimal.id) })
      act(() => { result.current.confirmAnimal() })
      act(() => { result.current.dismissSuccess() })
    }

    expect(playVictory).toHaveBeenCalledTimes(1)
  })
})

describe('useGame — confirmAnimal (erro)', () => {
  it('define feedback com o animal errado', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!
    const wrong = round.options.find(a => a.id !== round.correctAnimal.id)!

    act(() => { result.current.previewAnimal(wrong.id) })
    act(() => { result.current.confirmAnimal() })

    expect(result.current.feedback).not.toBeNull()
    expect(result.current.feedback!.animal.id).toBe(wrong.id)
  })

  it('adiciona o animal errado ao blockedIds', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!
    const wrong = round.options.find(a => a.id !== round.correctAnimal.id)!

    act(() => { result.current.previewAnimal(wrong.id) })
    act(() => { result.current.confirmAnimal() })

    expect(result.current.blockedIds).toContain(wrong.id)
  })

  it('chama playWrong ao errar', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!
    const wrong = round.options.find(a => a.id !== round.correctAnimal.id)!

    act(() => { result.current.previewAnimal(wrong.id) })
    act(() => { result.current.confirmAnimal() })

    expect(playWrong).toHaveBeenCalledTimes(1)
  })

  it('limpa selectedAnimalId após erro', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!
    const wrong = round.options.find(a => a.id !== round.correctAnimal.id)!

    act(() => { result.current.previewAnimal(wrong.id) })
    act(() => { result.current.confirmAnimal() })

    expect(result.current.selectedAnimalId).toBeNull()
  })

  it('registra uma tentativa ao errar', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!
    const wrong = round.options.find(a => a.id !== round.correctAnimal.id)!

    act(() => { result.current.previewAnimal(wrong.id) })
    act(() => { result.current.confirmAnimal() })

    expect(result.current.state.totalAttempts).toBe(1)
  })
})

describe('useGame — guards', () => {
  it('confirmAnimal não faz nada se não há selectedAnimalId', () => {
    const { result } = renderGame({ totalRounds: 3, animals })

    act(() => { result.current.confirmAnimal() })

    expect(result.current.feedback).toBeNull()
    expect(result.current.success).toBeNull()
    expect(result.current.state.totalAttempts).toBe(0)
  })

  it('previewAnimal não faz nada enquanto success está aberto', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!

    act(() => { result.current.previewAnimal(round.correctAnimal.id) })
    act(() => { result.current.confirmAnimal() })

    speakAnimalName.mockClear()
    const other = round.options.find(a => a.id !== round.correctAnimal.id)!
    act(() => { result.current.previewAnimal(other.id) })

    expect(speakAnimalName).not.toHaveBeenCalled()
  })

  it('previewAnimal não faz nada enquanto feedback está aberto', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!
    const wrong = round.options.find(a => a.id !== round.correctAnimal.id)!

    act(() => { result.current.previewAnimal(wrong.id) })
    act(() => { result.current.confirmAnimal() })

    speakAnimalName.mockClear()
    act(() => { result.current.previewAnimal(round.correctAnimal.id) })

    expect(speakAnimalName).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Rodar os testes para confirmar falha**

```bash
cd frontend && npm run test -- useGame.test.ts
```

Esperado: FAIL com "result.current.previewAnimal is not a function"

- [ ] **Step 3: Reescrever `useGame.ts`**

```ts
import { useState, useCallback, useEffect } from 'react'
import { createGame, checkAnswer, recordAttempt, completeRound, advanceRound } from './engine'
import type { Animal, GameConfig, GameState } from './types'
import { useSounds } from './useSounds'

type FeedbackState = { animal: Animal } | null
type SuccessState = { animal: Animal; letter: string } | null

export function useGame(config: GameConfig) {
  const [state, setState] = useState<GameState>(() => createGame(config))
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [success, setSuccess] = useState<SuccessState>(null)
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null)
  const [blockedIds, setBlockedIds] = useState<string[]>([])

  const { playCorrect, playWrong, playVictory, speakAnimalName, speakAnimalError } = useSounds()

  const currentRound = state.rounds[state.currentRoundIndex] ?? null

  useEffect(() => {
    if (state.isComplete) playVictory()
  }, [state.isComplete, playVictory])

  const previewAnimal = useCallback((animalId: string) => {
    if (feedback || success) return
    if (blockedIds.includes(animalId)) return
    const round = state.rounds[state.currentRoundIndex]
    const animal = round.options.find(a => a.id === animalId)!
    setSelectedAnimalId(animalId)
    speakAnimalName(animal.label)
  }, [state, feedback, success, blockedIds, speakAnimalName])

  const confirmAnimal = useCallback(() => {
    if (!selectedAnimalId || feedback || success) return

    const result = checkAnswer(state, selectedAnimalId)
    const round = state.rounds[state.currentRoundIndex]

    if (result.correct) {
      playCorrect()
      setState(prev => completeRound(recordAttempt(prev)))
      setSuccess({ animal: result.selectedAnimal, letter: round.letter })
      setSelectedAnimalId(null)
    } else {
      playWrong()
      setState(prev => recordAttempt(prev))
      setFeedback({ animal: result.selectedAnimal })
      setBlockedIds(prev => [...prev, selectedAnimalId])
      setSelectedAnimalId(null)
    }
  }, [selectedAnimalId, state, feedback, success, playCorrect, playWrong])

  const dismissFeedback = useCallback(() => {
    setFeedback(null)
  }, [])

  const dismissSuccess = useCallback(() => {
    setSuccess(null)
    setBlockedIds([])
    setState(prev => advanceRound(prev))
  }, [])

  const onFeedbackMount = useCallback(() => {
    if (feedback) speakAnimalError(feedback.animal.label)
  }, [feedback, speakAnimalError])

  const onSuccessMount = useCallback(() => {
    if (success) speakAnimalName(success.animal.label, success.letter)
  }, [success, speakAnimalName])

  const restart = useCallback(() => {
    setState(createGame(config))
    setFeedback(null)
    setSuccess(null)
    setSelectedAnimalId(null)
    setBlockedIds([])
  }, [config])

  return {
    state,
    currentRound,
    feedback,
    success,
    selectedAnimalId,
    blockedIds,
    previewAnimal,
    confirmAnimal,
    dismissFeedback,
    dismissSuccess,
    onFeedbackMount,
    onSuccessMount,
    restart,
  }
}
```

- [ ] **Step 4: Rodar os testes**

```bash
cd frontend && npm run test -- useGame.test.ts
```

Esperado: PASS (todos os testes)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/games/alphabet-match/game/useGame.ts \
        frontend/src/games/alphabet-match/game/useGame.test.ts
git commit -m "feat(alphabet-match): refatora useGame com previewAnimal, confirmAnimal e dismissSuccess"
```

---

## Task 3: Atualizar `RoundScreen.tsx`, CSS e testes

**Files:**
- Modificar: `frontend/src/games/alphabet-match/components/RoundScreen.tsx`
- Modificar: `frontend/src/games/alphabet-match/components/RoundScreen.module.css`
- Modificar: `frontend/src/games/alphabet-match/components/RoundScreen.test.tsx`

- [ ] **Step 1: Reescrever os testes do `RoundScreen`**

```tsx
// frontend/src/games/alphabet-match/components/RoundScreen.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoundScreen } from './RoundScreen'
import styles from './RoundScreen.module.css'
import type { Animal, Round } from '../game/types'

const makeAnimal = (id: string, label: string): Animal => ({
  id,
  label,
  imagePath: `/fake/${id}.jpeg`,
  firstLetter: label.charAt(0),
})

const correctAnimal = makeAnimal('abelha', 'Abelha')
const distractors = [
  makeAnimal('baleia', 'Baleia'),
  makeAnimal('cachorro', 'Cachorro'),
  makeAnimal('dinossauro', 'Dinossauro'),
]

const round: Round = {
  letter: 'A',
  correctAnimal,
  options: [correctAnimal, ...distractors],
  attempts: 0,
  completed: false,
}

const defaultProps = {
  round,
  selectedAnimalId: null,
  blockedIds: [] as string[],
  onPreview: () => {},
  onConfirm: () => {},
}

describe('RoundScreen', () => {
  it('renderiza todas as opções com imagens acessíveis', () => {
    render(<RoundScreen {...defaultProps} />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
    expect(screen.getByAltText('Abelha')).toBeInTheDocument()
    expect(screen.getByAltText('Baleia')).toBeInTheDocument()
  })

  it('impede drag nativo nas imagens', () => {
    render(<RoundScreen {...defaultProps} />)
    for (const img of screen.getAllByRole('img')) {
      expect(img).toHaveAttribute('draggable', 'false')
    }
  })

  it('chama onPreview com o id do animal ao clicar uma opção', () => {
    const onPreview = vi.fn()
    render(<RoundScreen {...defaultProps} onPreview={onPreview} />)
    fireEvent.click(screen.getByAltText('Abelha').closest('button')!)
    expect(onPreview).toHaveBeenCalledWith('abelha')
  })

  it('não exibe botão de confirmar quando nenhum animal está selecionado', () => {
    render(<RoundScreen {...defaultProps} selectedAnimalId={null} />)
    expect(screen.queryByRole('button', { name: /é esse/i })).toBeNull()
  })

  it('exibe botão de confirmar quando um animal está selecionado', () => {
    render(<RoundScreen {...defaultProps} selectedAnimalId="abelha" />)
    expect(screen.getByRole('button', { name: /é esse/i })).toBeInTheDocument()
  })

  it('chama onConfirm ao clicar no botão de confirmar', () => {
    const onConfirm = vi.fn()
    render(<RoundScreen {...defaultProps} selectedAnimalId="abelha" onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: /é esse/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('aplica classe selected na carta selecionada', () => {
    render(<RoundScreen {...defaultProps} selectedAnimalId="abelha" />)
    const selectedButton = screen.getByAltText('Abelha').closest('button')!
    expect(selectedButton.className).toContain(styles.selected)
  })

  it('não aplica classe selected em cartas não selecionadas', () => {
    render(<RoundScreen {...defaultProps} selectedAnimalId="abelha" />)
    const otherButton = screen.getByAltText('Baleia').closest('button')!
    expect(otherButton.className).not.toContain(styles.selected)
  })

  it('desabilita e aplica classe blocked nas opções bloqueadas', () => {
    render(<RoundScreen {...defaultProps} blockedIds={['baleia']} />)
    const blockedButton = screen.getByAltText('Baleia').closest('button')!
    expect(blockedButton).toBeDisabled()
    expect(blockedButton.className).toContain(styles.blocked)
  })

  it('não desabilita opções não bloqueadas', () => {
    render(<RoundScreen {...defaultProps} blockedIds={['baleia']} />)
    const freeButton = screen.getByAltText('Abelha').closest('button')!
    expect(freeButton).not.toBeDisabled()
  })
})
```

- [ ] **Step 2: Rodar os testes para confirmar falha**

```bash
cd frontend && npm run test -- RoundScreen.test.tsx
```

Esperado: FAIL com múltiplos erros de props/classes

- [ ] **Step 3: Adicionar classes CSS ao `RoundScreen.module.css`**

Adicionar ao final do arquivo (antes do último `@media`):

```css
.option.selected {
  border-color: #0d9488;
  border-width: 2.5px;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.18);
}

.option.blocked {
  opacity: 0.35;
  cursor: default;
}

.confirmBtn {
  background: #16a34a;
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 1.125rem;
  font-weight: 700;
  padding: 0.875rem 2rem;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  width: 100%;
  max-width: 380px;
  transition: opacity 0.15s;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
}

.confirmBtn:hover {
  opacity: 0.88;
}

.confirmBtn:active {
  opacity: 0.75;
}
```

- [ ] **Step 4: Reescrever `RoundScreen.tsx`**

```tsx
import type { Round } from '../game/types'
import styles from './RoundScreen.module.css'

type Props = {
  round: Round
  selectedAnimalId: string | null
  blockedIds: string[]
  onPreview: (animalId: string) => void
  onConfirm: () => void
}

export function RoundScreen({ round, selectedAnimalId, blockedIds, onPreview, onConfirm }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.letterCard}>
        <span className={styles.letter}>{round.letter}</span>
      </div>
      <div className={styles.grid}>
        {round.options.map(animal => {
          const isSelected = animal.id === selectedAnimalId
          const isBlocked = blockedIds.includes(animal.id)
          return (
            <button
              key={animal.id}
              type="button"
              className={[
                styles.option,
                isSelected ? styles.selected : '',
                isBlocked ? styles.blocked : '',
              ].join(' ')}
              onClick={() => onPreview(animal.id)}
              disabled={isBlocked}
            >
              <img
                src={animal.imagePath}
                alt={animal.label}
                className={styles.image}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </button>
          )
        })}
      </div>
      {selectedAnimalId !== null && (
        <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
          É esse! ✓
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Rodar os testes**

```bash
cd frontend && npm run test -- RoundScreen.test.tsx
```

Esperado: PASS (todos os testes)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/games/alphabet-match/components/RoundScreen.tsx \
        frontend/src/games/alphabet-match/components/RoundScreen.module.css \
        frontend/src/games/alphabet-match/components/RoundScreen.test.tsx
git commit -m "feat(alphabet-match): RoundScreen com seleção, bloqueio e botão de confirmar"
```

---

## Task 4: Adicionar `onMount` ao `FeedbackPopup`

**Files:**
- Modificar: `frontend/src/games/alphabet-match/components/FeedbackPopup.tsx`
- Modificar: `frontend/src/games/alphabet-match/components/FeedbackPopup.test.tsx`

- [ ] **Step 1: Adicionar teste do `onMount`**

Substituir o conteúdo de `FeedbackPopup.test.tsx` por:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FeedbackPopup } from './FeedbackPopup'
import type { Animal } from '../game/types'

const animal: Animal = {
  id: 'baleia',
  label: 'Baleia',
  imagePath: '/fake/baleia.jpeg',
  firstLetter: 'B',
}

describe('FeedbackPopup', () => {
  it('impede drag nativo na imagem', () => {
    render(<FeedbackPopup animal={animal} onDismiss={() => {}} onMount={() => {}} />)
    expect(screen.getByAltText('Baleia')).toHaveAttribute('draggable', 'false')
  })

  it('chama onMount ao montar', () => {
    const onMount = vi.fn()
    render(<FeedbackPopup animal={animal} onDismiss={() => {}} onMount={onMount} />)
    expect(onMount).toHaveBeenCalledTimes(1)
  })

  it('chama onDismiss ao clicar no botão', () => {
    const onDismiss = vi.fn()
    render(<FeedbackPopup animal={animal} onDismiss={onDismiss} onMount={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Rodar os testes para confirmar falha**

```bash
cd frontend && npm run test -- FeedbackPopup.test.tsx
```

Esperado: FAIL — prop `onMount` não existe ainda

- [ ] **Step 3: Atualizar `FeedbackPopup.tsx`**

```tsx
import { useEffect } from 'react'
import type { Animal } from '../game/types'
import styles from './FeedbackPopup.module.css'

type Props = {
  animal: Animal
  onDismiss: () => void
  onMount: () => void
}

export function FeedbackPopup({ animal, onDismiss, onMount }: Props) {
  useEffect(() => {
    onMount()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const firstLetter = animal.label.charAt(0)
  const rest = animal.label.slice(1)

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <img
          src={animal.imagePath}
          alt={animal.label}
          className={styles.image}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
        <p className={styles.text}>
          Esse é o <span className={styles.highlight}>{firstLetter}</span>{rest}!
        </p>
        <button className={styles.button} onClick={onDismiss}>
          🔄 Tentar novamente
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Rodar os testes**

```bash
cd frontend && npm run test -- FeedbackPopup.test.tsx
```

Esperado: PASS (3 testes)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/games/alphabet-match/components/FeedbackPopup.tsx \
        frontend/src/games/alphabet-match/components/FeedbackPopup.test.tsx
git commit -m "feat(alphabet-match): FeedbackPopup aceita onMount para falar o nome do animal"
```

---

## Task 5: Criar `SuccessPopup`

**Files:**
- Criar: `frontend/src/games/alphabet-match/components/SuccessPopup.tsx`
- Criar: `frontend/src/games/alphabet-match/components/SuccessPopup.module.css`
- Criar: `frontend/src/games/alphabet-match/components/SuccessPopup.test.tsx`

- [ ] **Step 1: Criar o teste**

```tsx
// frontend/src/games/alphabet-match/components/SuccessPopup.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SuccessPopup } from './SuccessPopup'
import type { Animal } from '../game/types'

const animal: Animal = {
  id: 'elefante',
  label: 'Elefante',
  imagePath: '/fake/elefante.jpeg',
  firstLetter: 'E',
}

describe('SuccessPopup', () => {
  it('renderiza a imagem do animal correto', () => {
    render(<SuccessPopup animal={animal} letter="E" onNext={() => {}} onMount={() => {}} />)
    expect(screen.getByAltText('Elefante')).toBeInTheDocument()
  })

  it('exibe a letra destacada no texto', () => {
    render(<SuccessPopup animal={animal} letter="E" onNext={() => {}} onMount={() => {}} />)
    expect(screen.getByText('E', { selector: 'span' })).toBeInTheDocument()
  })

  it('chama onMount ao montar', () => {
    const onMount = vi.fn()
    render(<SuccessPopup animal={animal} letter="E" onNext={() => {}} onMount={onMount} />)
    expect(onMount).toHaveBeenCalledTimes(1)
  })

  it('chama onNext ao clicar no botão Próximo', () => {
    const onNext = vi.fn()
    render(<SuccessPopup animal={animal} letter="E" onNext={onNext} onMount={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('impede drag nativo na imagem', () => {
    render(<SuccessPopup animal={animal} letter="E" onNext={() => {}} onMount={() => {}} />)
    expect(screen.getByAltText('Elefante')).toHaveAttribute('draggable', 'false')
  })
})
```

- [ ] **Step 2: Rodar o teste para confirmar falha**

```bash
cd frontend && npm run test -- SuccessPopup.test.tsx
```

Esperado: FAIL — módulo não existe

- [ ] **Step 3: Criar `SuccessPopup.module.css`**

```css
/* frontend/src/games/alphabet-match/components/SuccessPopup.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(240, 253, 244, 0.88);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: appear 0.26s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes appear {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.card {
  background: #ffffff;
  border-radius: 22px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 12px 40px rgba(22, 163, 74, 0.16);
  border: 1.5px solid #bbf7d0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 320px;
  width: 90%;
}

.image {
  width: clamp(80px, 35vw, 128px);
  height: clamp(80px, 35vw, 128px);
  object-fit: contain;
  border-radius: 14px;
  display: block;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.text {
  font-size: 1.125rem;
  font-weight: 500;
  color: #284a4a;
  line-height: 1.4;
}

.highlight {
  font-weight: 800;
  color: #16a34a;
}

.button {
  background: #16a34a;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  padding: 0.75rem 1.75rem;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  box-shadow: 0 1px 0 rgba(22, 163, 74, 0.12);
  transition: opacity 0.15s;
}

.button:hover {
  opacity: 0.85;
}
```

- [ ] **Step 4: Criar `SuccessPopup.tsx`**

```tsx
// frontend/src/games/alphabet-match/components/SuccessPopup.tsx
import { useEffect } from 'react'
import type { Animal } from '../game/types'
import styles from './SuccessPopup.module.css'

type Props = {
  animal: Animal
  letter: string
  onNext: () => void
  onMount: () => void
}

export function SuccessPopup({ animal, letter, onNext, onMount }: Props) {
  useEffect(() => {
    onMount()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const firstLetter = animal.label.charAt(0)
  const rest = animal.label.slice(1)

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <img
          src={animal.imagePath}
          alt={animal.label}
          className={styles.image}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
        <p className={styles.text}>
          Isso mesmo! <span className={styles.highlight}>{firstLetter}</span>{rest},
          {' '}com a letra <span className={styles.highlight}>{letter}</span>!
        </p>
        <button className={styles.button} onClick={onNext}>
          Próximo →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Rodar os testes**

```bash
cd frontend && npm run test -- SuccessPopup.test.tsx
```

Esperado: PASS (5 testes)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/games/alphabet-match/components/SuccessPopup.tsx \
        frontend/src/games/alphabet-match/components/SuccessPopup.module.css \
        frontend/src/games/alphabet-match/components/SuccessPopup.test.tsx
git commit -m "feat(alphabet-match): cria SuccessPopup com fala e botão Próximo"
```

---

## Task 6: Conectar tudo em `AlphabetMatchGame.tsx`

**Files:**
- Modificar: `frontend/src/games/alphabet-match/AlphabetMatchGame.tsx`

- [ ] **Step 1: Atualizar `AlphabetMatchGame.tsx`**

```tsx
import { useGame } from './game/useGame'
import { GameHeader } from './components/GameHeader'
import { RoundScreen } from './components/RoundScreen'
import { FeedbackPopup } from './components/FeedbackPopup'
import { SuccessPopup } from './components/SuccessPopup'
import { GameOver } from './components/GameOver'
import { ANIMALS } from './assets/animals'
import type { GameConfig } from './game/types'

const config: GameConfig = {
  totalRounds: 5,
  animals: ANIMALS,
}

type Props = {
  onBackToMenu: () => void
}

export function AlphabetMatchGame({ onBackToMenu }: Props) {
  const {
    state,
    currentRound,
    feedback,
    success,
    selectedAnimalId,
    blockedIds,
    previewAnimal,
    confirmAnimal,
    dismissFeedback,
    dismissSuccess,
    onFeedbackMount,
    onSuccessMount,
    restart,
  } = useGame(config)

  if (state.isComplete) {
    return (
      <GameOver
        totalAttempts={state.totalAttempts}
        totalRounds={state.rounds.length}
        onRestart={restart}
        onBackToMenu={onBackToMenu}
      />
    )
  }

  if (!currentRound) return null

  return (
    <main className="app">
      <GameHeader
        currentRound={state.currentRoundIndex + 1}
        totalRounds={state.rounds.length}
      />
      <RoundScreen
        round={currentRound}
        selectedAnimalId={selectedAnimalId}
        blockedIds={blockedIds}
        onPreview={previewAnimal}
        onConfirm={confirmAnimal}
      />
      {feedback && (
        <FeedbackPopup
          animal={feedback.animal}
          onDismiss={dismissFeedback}
          onMount={onFeedbackMount}
        />
      )}
      {success && (
        <SuccessPopup
          animal={success.animal}
          letter={success.letter}
          onNext={dismissSuccess}
          onMount={onSuccessMount}
        />
      )}
    </main>
  )
}
```

- [ ] **Step 2: Rodar todos os testes do jogo**

```bash
cd frontend && npm run test -- --reporter=verbose alphabet-match
```

Esperado: PASS em todos os arquivos de teste do alphabet-match

- [ ] **Step 3: Verificar no browser**

```bash
cd /root && npm run dev:frontend
```

Abrir `http://localhost:5173`, navegar até Alphabet Match e verificar:
- [ ] Tocar carta → carta fica destacada + ouve o nome do animal
- [ ] Trocar carta → destaque muda + ouve novo nome
- [ ] Botão "É esse! ✓" aparece ao selecionar
- [ ] Confirmar resposta errada → popup de erro abre falando o nome, opção fica bloqueada
- [ ] Confirmar resposta certa → popup de sucesso abre falando "Isso mesmo! X, com a letra Y!"
- [ ] Botão "Próximo →" avança a rodada
- [ ] Rodadas erradas acumulam no score final

- [ ] **Step 4: Commit final**

```bash
git add frontend/src/games/alphabet-match/AlphabetMatchGame.tsx
git commit -m "feat(alphabet-match): conecta fluxo completo de seleção, confirmação e feedback de sucesso"
```
