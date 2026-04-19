import type { Player } from '../game/types'
import { GameOverScreen } from '../../../platform/components/GameOverScreen'
import styles from './GameOver.module.css'

type Props = {
  moves: number
  players: Player[]
  onRestart: () => void
  onBackToMenu: () => void
  onOpenSettings?: () => void
}

export function GameOver({ moves, players, onRestart, onBackToMenu, onOpenSettings }: Props) {
  const isDuo = players.length > 1

  if (isDuo) {
    const winner =
      players[0].pairsFound > players[1].pairsFound
        ? players[0]
        : players[1].pairsFound > players[0].pairsFound
          ? players[1]
          : null

    return (
      <GameOverScreen
        title={winner ? `${winner.name} ganhou!` : 'Empate!'}
        onRestart={onRestart}
        onBackToMenu={onBackToMenu}
        onOpenSettings={onOpenSettings}
      >
        <div className={styles.emoji}>{winner ? '🏆' : '🎉'}</div>
        <div className={styles.scores}>
          {players.map((p, i) => (
            <p key={i} className={styles.scoreRow}>
              {p.name}: <strong>{p.pairsFound}</strong> {p.pairsFound === 1 ? 'par' : 'pares'}
            </p>
          ))}
        </div>
      </GameOverScreen>
    )
  }

  return (
    <GameOverScreen
      title={`Parabéns, ${players[0].name}!`}
      onRestart={onRestart}
      onBackToMenu={onBackToMenu}
      onOpenSettings={onOpenSettings}
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
        Você completou em <strong>{moves}</strong> tentativas!
      </p>
    </GameOverScreen>
  )
}
