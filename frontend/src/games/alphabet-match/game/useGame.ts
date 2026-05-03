import { useState, useCallback, useEffect } from 'react'
import { createGame, checkAnswer, checkLetterAnswer, recordAttempt, completeRound, advanceRound } from './engine'
import type { AlphabetMatchMode, Animal, GameConfig, GameState } from './types'
import { useSounds } from './useSounds'
import {
  SUCCESS_MESSAGE_TEMPLATES,
  formatSuccessMessage,
  selectSuccessMessageIndex,
} from './successMessages'

type FeedbackState = { animal: Animal } | null
type LetterFeedbackState = { animal: Animal; selectedLetter: string } | null
type SuccessState = { animal: Animal; letter: string; messageIndex: number } | null

export function useGame(config: GameConfig, mode: AlphabetMatchMode = 'letter-to-animal') {
  const [state, setState] = useState<GameState>(() => createGame(config))
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [letterFeedback, setLetterFeedback] = useState<LetterFeedbackState>(null)
  const [success, setSuccess] = useState<SuccessState>(null)
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [blockedIds, setBlockedIds] = useState<string[]>([])
  const [blockedLetters, setBlockedLetters] = useState<string[]>([])

  const {
    playCorrect,
    playWrong,
    playVictory,
    speakAnimalName,
    speakAnimalError,
    speakSuccessMessage,
    speakRoundIntro,
    speakLetter,
    speakLetterError,
    speakAnimalToLetterIntro,
  } = useSounds()

  const currentRound = state.rounds[state.currentRoundIndex] ?? null

  useEffect(() => {
    if (state.isComplete) playVictory()
  }, [state.isComplete, playVictory])

  useEffect(() => {
    if (!currentRound) return
    if (mode === 'animal-to-letter') {
      speakAnimalToLetterIntro(currentRound.correctAnimal.label)
      return
    }
    speakRoundIntro(currentRound.letter)
  }, [state.currentRoundIndex, mode, speakAnimalToLetterIntro, speakRoundIntro])

  const previewAnimal = useCallback((animalId: string) => {
    if (feedback || letterFeedback || success) return
    if (blockedIds.includes(animalId)) return
    const round = state.rounds[state.currentRoundIndex]
    if (!round) return
    const animal = round.options.find(a => a.id === animalId)!
    setSelectedAnimalId(animalId)
    speakAnimalName(animal.label)
  }, [state, feedback, letterFeedback, success, blockedIds, speakAnimalName])

  const confirmAnimal = useCallback(() => {
    if (!selectedAnimalId || feedback || letterFeedback || success) return

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
  }, [selectedAnimalId, state, feedback, letterFeedback, success, playCorrect, playWrong, speakSuccessMessage, speakAnimalError])

  const previewChallengeAnimal = useCallback(() => {
    if (!currentRound || feedback || letterFeedback || success) return
    speakAnimalName(currentRound.correctAnimal.label)
  }, [currentRound, feedback, letterFeedback, success, speakAnimalName])

  const selectLetter = useCallback((letter: string) => {
    if (feedback || letterFeedback || success) return
    if (blockedLetters.includes(letter)) return
    setSelectedLetter(letter)
    speakLetter(letter)
  }, [feedback, letterFeedback, success, blockedLetters, speakLetter])

  const confirmLetter = useCallback(() => {
    if (!selectedLetter || feedback || letterFeedback || success) return

    const result = checkLetterAnswer(state, selectedLetter)

    if (result.correct) {
      const messageIndex = selectSuccessMessageIndex()
      const message = formatSuccessMessage(
        SUCCESS_MESSAGE_TEMPLATES[messageIndex],
        result.correctAnimal.label,
        result.correctAnimal.firstLetter
      )
      playCorrect()
      speakSuccessMessage(message)
      setState(prev => completeRound(recordAttempt(prev)))
      setSuccess({ animal: result.correctAnimal, letter: result.correctAnimal.firstLetter, messageIndex })
      setSelectedLetter(null)
    } else {
      playWrong()
      speakLetterError(result.selectedLetter)
      setState(prev => recordAttempt(prev))
      setLetterFeedback({ animal: result.correctAnimal, selectedLetter: result.selectedLetter })
      setBlockedLetters(prev => [...prev, result.selectedLetter])
      setSelectedLetter(null)
    }
  }, [selectedLetter, state, feedback, letterFeedback, success, playCorrect, playWrong, speakSuccessMessage, speakLetterError])

  const dismissFeedback = useCallback(() => {
    setFeedback(null)
    setLetterFeedback(null)
  }, [])

  const dismissSuccess = useCallback(() => {
    setSuccess(null)
    setBlockedIds([])
    setBlockedLetters([])
    setState(prev => advanceRound(prev))
  }, [])

  const restart = useCallback(() => {
    setState(createGame(config))
    setFeedback(null)
    setLetterFeedback(null)
    setSuccess(null)
    setSelectedAnimalId(null)
    setSelectedLetter(null)
    setBlockedIds([])
    setBlockedLetters([])
  }, [config])

  const speakLetterReplay = useCallback(() => {
    if (!currentRound) return
    speakLetter(currentRound.letter)
  }, [currentRound, speakLetter])

  return {
    state,
    currentRound,
    feedback,
    letterFeedback,
    success,
    selectedAnimalId,
    selectedLetter,
    blockedIds,
    blockedLetters,
    previewAnimal,
    confirmAnimal,
    previewChallengeAnimal,
    selectLetter,
    confirmLetter,
    dismissFeedback,
    dismissSuccess,
    restart,
    speakLetterReplay,
  }
}
