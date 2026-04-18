import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { StrictMode } from 'react'
import { useGame } from './useGame'
import type { Animal, GameConfig } from './types'

const playCorrect = vi.fn()
const playWrong = vi.fn()
const playVictory = vi.fn()

vi.mock('./useSounds', () => ({
  useSounds: () => ({ playCorrect, playWrong, playVictory }),
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
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useGame — StrictMode regression', () => {
  it('advances exactly one round per correct answer (not two under StrictMode)', () => {
    const { result } = renderGame({ totalRounds: 3, animals })

    const firstRound = result.current.currentRound!
    const correctId = firstRound.correctAnimal.id

    act(() => {
      result.current.selectAnimal(correctId)
    })

    expect(result.current.showCorrect).toBe(true)
    expect(result.current.state.currentRoundIndex).toBe(0)

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(result.current.state.currentRoundIndex).toBe(1)
    expect(result.current.showCorrect).toBe(false)
    expect(playCorrect).toHaveBeenCalledTimes(1)
  })

  it('records exactly one attempt per wrong answer', () => {
    const { result } = renderGame({ totalRounds: 3, animals })

    const firstRound = result.current.currentRound!
    const wrong = firstRound.options.find(a => a.id !== firstRound.correctAnimal.id)!

    act(() => {
      result.current.selectAnimal(wrong.id)
    })

    expect(result.current.state.totalAttempts).toBe(1)
    expect(result.current.feedback).not.toBeNull()
    expect(result.current.feedback?.animal.id).toBe(wrong.id)
    expect(playWrong).toHaveBeenCalledTimes(1)
  })

  it('completes the game without overshooting currentRoundIndex', () => {
    const totalRounds = 3
    const { result } = renderGame({ totalRounds, animals })

    for (let i = 0; i < totalRounds; i++) {
      const round = result.current.currentRound!
      act(() => {
        result.current.selectAnimal(round.correctAnimal.id)
      })
      act(() => {
        vi.advanceTimersByTime(1500)
      })
    }

    expect(result.current.state.isComplete).toBe(true)
    expect(result.current.state.currentRoundIndex).toBe(totalRounds)
    expect(result.current.currentRound).toBeNull()
  })

  it('plays victory sound exactly once when the game completes', () => {
    const totalRounds = 2
    const { result } = renderGame({ totalRounds, animals })

    for (let i = 0; i < totalRounds; i++) {
      const round = result.current.currentRound!
      act(() => {
        result.current.selectAnimal(round.correctAnimal.id)
      })
      act(() => {
        vi.advanceTimersByTime(1500)
      })
    }

    expect(playVictory).toHaveBeenCalledTimes(1)
  })

  it('ignores clicks while showCorrect is pending', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!

    act(() => {
      result.current.selectAnimal(round.correctAnimal.id)
    })

    const otherId = round.options.find(a => a.id !== round.correctAnimal.id)!.id

    act(() => {
      result.current.selectAnimal(otherId)
    })

    expect(result.current.state.totalAttempts).toBe(1)
    expect(playWrong).not.toHaveBeenCalled()
  })

  it('ignores clicks while feedback is shown', () => {
    const { result } = renderGame({ totalRounds: 3, animals })
    const round = result.current.currentRound!
    const wrong = round.options.find(a => a.id !== round.correctAnimal.id)!

    act(() => {
      result.current.selectAnimal(wrong.id)
    })

    act(() => {
      result.current.selectAnimal(round.correctAnimal.id)
    })

    expect(result.current.state.totalAttempts).toBe(1)
    expect(playCorrect).not.toHaveBeenCalled()
  })
})
