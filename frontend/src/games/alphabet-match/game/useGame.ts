import { useState, useCallback, useEffect } from 'react'
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

  useEffect(() => {
    if (state.isComplete) playVictory()
  }, [state.isComplete, playVictory])

  const selectAnimal = useCallback((animalId: string) => {
    if (feedback || showCorrect) return

    const result = checkAnswer(state, animalId)

    if (result.correct) {
      playCorrect()
      setShowCorrect(true)
      setState(prev => completeRound(recordAttempt(prev)))

      setTimeout(() => {
        setShowCorrect(false)
        setState(prev => advanceRound(prev))
      }, 1500)
    } else {
      playWrong()
      setFeedback({ animal: result.selectedAnimal })
      setState(prev => recordAttempt(prev))
    }
  }, [state, feedback, showCorrect, playCorrect, playWrong])

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
