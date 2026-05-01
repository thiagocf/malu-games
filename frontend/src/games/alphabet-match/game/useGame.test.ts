import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { StrictMode } from 'react'
import { useGame } from './useGame'
import type { Animal, GameConfig } from './types'

const playCorrect = vi.fn()
const playWrong = vi.fn()
const playVictory = vi.fn()
const speakAnimalName = vi.fn()
const speakAnimalError = vi.fn()
const speakRoundIntro = vi.fn()
const speakLetter = vi.fn()
const speakSuccessMessage = vi.fn()

vi.mock('./useSounds', () => ({
  useSounds: () => ({
    playCorrect,
    playWrong,
    playVictory,
    speakAnimalName,
    speakAnimalError,
    speakRoundIntro,
    speakLetter,
    speakSuccessMessage,
  }),
}))

const makeAnimal = (id: string, firstLetter: string): Animal => ({
  id,
  label: id.charAt(0).toUpperCase() + id.slice(1),
  imagePath: `/fake/${id}.jpeg`,
  firstLetter,
  gender: 'M',
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
  playCorrect.mockClear()
  playWrong.mockClear()
  playVictory.mockClear()
  speakAnimalName.mockClear()
  speakAnimalError.mockClear()
  speakRoundIntro.mockClear()
  speakLetter.mockClear()
  speakSuccessMessage.mockClear()
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
    expect(result.current.success!.messageIndex).toBeGreaterThanOrEqual(0)
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

  it('fala a mesma frase que sera exibida no popup de sucesso', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!

    act(() => { result.current.previewAnimal(round.correctAnimal.id) })
    act(() => { result.current.confirmAnimal() })

    expect(speakSuccessMessage).toHaveBeenCalledWith(
      expect.stringContaining(round.correctAnimal.label)
    )
    expect(speakSuccessMessage).toHaveBeenCalledWith(
      expect.stringContaining(round.letter)
    )
    expect(result.current.success!.messageIndex).toBeGreaterThanOrEqual(0)
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

describe('useGame — audio da letra', () => {
  it('chama speakRoundIntro com a letra ao iniciar a primeira rodada', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const letter = result.current.currentRound!.letter
    expect(speakRoundIntro).toHaveBeenCalledWith(letter)
  })

  it('nao repete speakRoundIntro quando a rodada atual e atualizada por acerto', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!
    speakRoundIntro.mockClear()

    act(() => { result.current.previewAnimal(round.correctAnimal.id) })
    act(() => { result.current.confirmAnimal() })

    expect(speakRoundIntro).not.toHaveBeenCalled()
  })

  it('nao repete speakRoundIntro quando a rodada atual e atualizada por erro', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!
    const wrong = round.options.find(a => a.id !== round.correctAnimal.id)!
    speakRoundIntro.mockClear()

    act(() => { result.current.previewAnimal(wrong.id) })
    act(() => { result.current.confirmAnimal() })

    expect(speakRoundIntro).not.toHaveBeenCalled()
  })

  it('chama speakRoundIntro com a nova letra ao avançar rodada', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    speakRoundIntro.mockClear()

    const round = result.current.currentRound!
    act(() => { result.current.previewAnimal(round.correctAnimal.id) })
    act(() => { result.current.confirmAnimal() })
    act(() => { result.current.dismissSuccess() })

    const newLetter = result.current.currentRound!.letter
    expect(speakRoundIntro).toHaveBeenCalledWith(newLetter)
  })

  it('speakLetterReplay chama speakLetter com a letra da rodada atual', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const letter = result.current.currentRound!.letter

    act(() => { result.current.speakLetterReplay() })

    expect(speakLetter).toHaveBeenCalledWith(letter)
  })
})
