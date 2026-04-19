import { GameOverScreen } from '../../../platform/components/GameOverScreen'
import styles from './GameOver.module.css'

type Props = {
  totalAttempts: number
  totalRounds: number
  onRestart: () => void
  onBackToMenu: () => void
}

export function GameOver({ totalAttempts, totalRounds, onRestart, onBackToMenu }: Props) {
  return (
    <GameOverScreen
      title="Parabéns!"
      onRestart={onRestart}
      onBackToMenu={onBackToMenu}
    >
      <div className={styles.confetti} aria-hidden="true">
        {['★','✦','✧','◆','✺','✹','❋','✿'].map((e, i) => (
          <span key={i} className={styles.confettiPiece} style={{ '--ci': i, color: i % 2 ? '#fbbf24' : '#0d9488' } as React.CSSProperties}>
            {e}
          </span>
        ))}
      </div>
      <div className={styles.emoji}>🎉</div>
      <p className={styles.subtitle}>
        Você acertou {totalRounds} letras em <strong>{totalAttempts}</strong> {totalAttempts === 1 ? 'tentativa' : 'tentativas'}!
      </p>
    </GameOverScreen>
  )
}
