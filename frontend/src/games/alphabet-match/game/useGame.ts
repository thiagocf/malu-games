import { useState, useCallback } from 'react'
import { createGame, checkAnswer, recordAttempt, completeRound, advanceRound } from './engine'
import type { Animal, GameConfig, GameState } from './types'
import { useSounds } from './useSounds'

type FeedbackState = { animal: Animal } | null

export function useGame(config: GameConfig) {
  const [state, setState] = useState<GameState>(() => createGame(config))
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [showCorrect, setShowCorrect] = useState(false)

  const { playCorrect, playWrong, playVictory } = useSounds()

  const currentRound = state.rounds[state.currentRoundIndex] ?? null

  const selectAnimal = useCallback((animalId: string) => {
    if (feedback || showCorrect) return

    setState(prev => {
      const result = checkAnswer(prev, animalId)

      if (result.correct) {
        playCorrect()
        setShowCorrect(true)
        const withAttempt = recordAttempt(prev)
        const completed = completeRound(withAttempt)

        setTimeout(() => {
          setState(s => {
            const next = advanceRound(s)
            if (next.isComplete) playVictory()
            return next
          })
          setShowCorrect(false)
        }, 1500)

        return completed
      }

      playWrong()
      setFeedback({ animal: result.selectedAnimal })
      return recordAttempt(prev)
    })
  }, [feedback, showCorrect, playCorrect, playWrong, playVictory])

  const dismissFeedback = useCallback(() => {
    setFeedback(null)
  }, [])

  const restart = useCallback(() => {
    setState(createGame(config))
    setFeedback(null)
    setShowCorrect(false)
  }, [config])

  return { state, currentRound, feedback, showCorrect, selectAnimal, dismissFeedback, restart }
}
