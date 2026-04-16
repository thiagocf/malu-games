import { useEffect } from 'react'
import type { Player } from '../game/types'
import styles from './GameOver.module.css'

type Props = {
  moves: number
  players: Player[]
  onRestart: () => void
  onBackToMenu: () => void
}

export function GameOver({ moves, players, onRestart, onBackToMenu }: Props) {
  const isDuo = players.length > 1

  useEffect(() => {
    if (isDuo) return
    const timer = setTimeout(onBackToMenu, 3000)
    return () => clearTimeout(timer)
  }, [onBackToMenu, isDuo])

  if (isDuo) {
    const winner =
      players[0].pairsFound > players[1].pairsFound
        ? players[0]
        : players[1].pairsFound > players[0].pairsFound
          ? players[1]
          : null

    return (
      <div className={styles.overlay}>
        <div className={styles.card}>
          <div className={styles.emoji}>{winner ? '🏆' : '🎉'}</div>
          <h2 className={styles.title}>
            {winner ? `${winner.name} ganhou!` : 'Empate!'}
          </h2>
          <div className={styles.scores}>
            {players.map((p, i) => (
              <p key={i} className={styles.scoreRow}>
                {p.name}: <strong>{p.pairsFound}</strong> {p.pairsFound === 1 ? 'par' : 'pares'}
              </p>
            ))}
          </div>
          <div className={styles.buttons}>
            <button className={styles.button} onClick={onRestart}>Jogar de novo</button>
            <button className={styles.buttonSecondary} onClick={onBackToMenu}>Menu</button>
          </div>
        </div>
      </div>
    )
  }

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
        <h2 className={styles.title}>Parabéns, {players[0].name}!</h2>
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
