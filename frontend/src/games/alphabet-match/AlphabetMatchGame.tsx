import { useGame } from './game/useGame'
import { GameHeader } from './components/GameHeader'
import { RoundScreen } from './components/RoundScreen'
import { LetterRoundScreen } from './components/LetterRoundScreen'
import { FeedbackPopup } from './components/FeedbackPopup'
import { LetterFeedbackPopup } from './components/LetterFeedbackPopup'
import { SuccessPopup } from './components/SuccessPopup'
import { GameOver } from './components/GameOver'
import { ANIMALS } from './assets/animals'
import type { AlphabetMatchMode, GameConfig } from './game/types'

const config: GameConfig = {
  totalRounds: 5,
  animals: ANIMALS,
}

type Props = {
  mode: AlphabetMatchMode
  onBackToMenu: () => void
  onChangeMode: () => void
}

export function AlphabetMatchGame({ mode, onBackToMenu, onChangeMode }: Props) {
  const {
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
  } = useGame(config, mode)

  if (state.isComplete) {
    return (
      <GameOver
        totalAttempts={state.totalAttempts}
        totalRounds={state.rounds.length}
        onRestart={restart}
        onBackToMenu={onBackToMenu}
        onChangeMode={onChangeMode}
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
      {mode === 'letter-to-animal' ? (
        <RoundScreen
          round={currentRound}
          selectedAnimalId={selectedAnimalId}
          blockedIds={blockedIds}
          onPreview={previewAnimal}
          onConfirm={confirmAnimal}
          onLetterTap={speakLetterReplay}
        />
      ) : (
        <LetterRoundScreen
          round={currentRound}
          selectedLetter={selectedLetter}
          blockedLetters={blockedLetters}
          onPreviewAnimal={previewChallengeAnimal}
          onSelectLetter={selectLetter}
          onConfirm={confirmLetter}
        />
      )}
      {feedback && (
        <FeedbackPopup
          animal={feedback.animal}
          onDismiss={dismissFeedback}
        />
      )}
      {letterFeedback && (
        <LetterFeedbackPopup
          animal={letterFeedback.animal}
          selectedLetter={letterFeedback.selectedLetter}
          onDismiss={dismissFeedback}
        />
      )}
      {success && (
        <SuccessPopup
          animal={success.animal}
          letter={success.letter}
          messageIndex={success.messageIndex}
          onNext={dismissSuccess}
        />
      )}
    </main>
  )
}
