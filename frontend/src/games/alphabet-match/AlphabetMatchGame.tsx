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
    restart,
    speakLetterReplay,
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
        onLetterTap={speakLetterReplay}
      />
      {feedback && (
        <FeedbackPopup
          animal={feedback.animal}
          onDismiss={dismissFeedback}
        />
      )}
      {success && (
        <SuccessPopup
          animal={success.animal}
          letter={success.letter}
          onNext={dismissSuccess}
        />
      )}
    </main>
  )
}
