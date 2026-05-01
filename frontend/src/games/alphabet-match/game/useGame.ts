import { useState, useCallback, useEffect } from 'react'
import { createGame, checkAnswer, recordAttempt, completeRound, advanceRound } from './engine'
import type { Animal, GameConfig, GameState } from './types'
import { useSounds } from './useSounds'
import {
  SUCCESS_MESSAGE_TEMPLATES,
  formatSuccessMessage,
  selectSuccessMessageIndex,
} from './successMessages'

type FeedbackState = { animal: Animal } | null
type SuccessState = { animal: Animal; letter: string; messageIndex: number } | null

export function useGame(config: GameConfig) {
  const [state, setState] = useState<GameState>(() => createGame(config))
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [success, setSuccess] = useState<SuccessState>(null)
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null)
  const [blockedIds, setBlockedIds] = useState<string[]>([])

  const { playCorrect, playWrong, playVictory, speakAnimalName, speakAnimalError, speakSuccessMessage, speakRoundIntro, speakLetter } = useSounds()

  const currentRound = state.rounds[state.currentRoundIndex] ?? null
  const currentRoundLetter = currentRound?.letter

  useEffect(() => {
    if (state.isComplete) playVictory()
  }, [state.isComplete, playVictory])

  useEffect(() => {
    if (!currentRoundLetter) return
    speakRoundIntro(currentRoundLetter)
  }, [currentRoundLetter, speakRoundIntro])

  const previewAnimal = useCallback((animalId: string) => {
    if (feedback || success) return
    if (blockedIds.includes(animalId)) return
    const round = state.rounds[state.currentRoundIndex]
    if (!round) return
    const animal = round.options.find(a => a.id === animalId)!
    setSelectedAnimalId(animalId)
    speakAnimalName(animal.label)
  }, [state, feedback, success, blockedIds, speakAnimalName])

  const confirmAnimal = useCallback(() => {
    if (!selectedAnimalId || feedback || success) return

    const result = checkAnswer(state, selectedAnimalId)
    const round = state.rounds[state.currentRoundIndex]

    if (result.correct) {
      const messageIndex = selectSuccessMessageIndex()
      const message = formatSuccessMessage(
        SUCCESS_MESSAGE_TEMPLATES[messageIndex],
        result.selectedAnimal.label,
        round.letter
      )
      playCorrect()
      speakSuccessMessage(message)
      setState(prev => completeRound(recordAttempt(prev)))
      setSuccess({ animal: result.selectedAnimal, letter: round.letter, messageIndex })
      setSelectedAnimalId(null)
    } else {
      playWrong()
      speakAnimalError(result.selectedAnimal.label, result.selectedAnimal.gender)
      setState(prev => recordAttempt(prev))
      setFeedback({ animal: result.selectedAnimal })
      setBlockedIds(prev => [...prev, selectedAnimalId])
      setSelectedAnimalId(null)
    }
  }, [selectedAnimalId, state, feedback, success, playCorrect, playWrong, speakSuccessMessage, speakAnimalError])

  const dismissFeedback = useCallback(() => {
    setFeedback(null)
  }, [])

  const dismissSuccess = useCallback(() => {
    setSuccess(null)
    setBlockedIds([])
    setState(prev => advanceRound(prev))
  }, [])

  const restart = useCallback(() => {
    setState(createGame(config))
    setFeedback(null)
    setSuccess(null)
    setSelectedAnimalId(null)
    setBlockedIds([])
  }, [config])

  const speakLetterReplay = useCallback(() => {
    if (!currentRound) return
    speakLetter(currentRound.letter)
  }, [currentRound, speakLetter])

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
    restart,
    speakLetterReplay,
  }
}
