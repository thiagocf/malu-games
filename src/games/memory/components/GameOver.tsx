import { useEffect } from 'react'
import styles from './GameOver.module.css'

type Props = {
  moves: number
  onRestart: () => void
  onBackToMenu: () => void
}

export function GameOver({ moves, onRestart, onBackToMenu }: Props) {
  useEffect(() => {
    const timer = setTimeout(onBackToMenu, 3000)
    return () => clearTimeout(timer)
  }, [onBackToMenu])

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.confetti} aria-hidden="true">
          {['🌟', '✨', '🎊', '⭐', '💫', '🌈', '🎉', '🦋'].map((e, i) => (
            <span key={i} className={styles.confettiPiece} style={{ '--ci': i } as React.CSSProperties}>
              {e}
            </span>
          ))}
        </div>
        <div className={styles.emoji}>🎉</div>
        <h2 className={styles.title}>Parabéns, Malu!</h2>
        <p className={styles.subtitle}>
          Você completou em <strong>{moves}</strong> tentativas!
        </p>
        <button className={styles.button} onClick={onRestart}>
          Jogar de novo
        </button>
      </div>
    </div>
  )
}
