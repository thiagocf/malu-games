import { useState } from 'react'
import type { Player } from '../game/types'
import styles from './GameHeader.module.css'

type Props = {
  moves: number
  players: Player[]
  currentPlayerIndex: number
  onAbandon: () => void
}

export function GameHeader({ moves, players, currentPlayerIndex, onAbandon }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const isDuo = players.length > 1

  return (
    <>
      <header className={styles.header}>
        <div className={styles.stat}>
          <span className={styles.label}>MOVIMENTOS</span>
          <span className={styles.value}>{moves}</span>
        </div>
        <h1 className={styles.title}>◆ Memória</h1>
        <button className={styles.abandon} onClick={() => setShowConfirm(true)}>
          ✕ Sair
        </button>
      </header>

      <div className={styles.scoreboard}>
        <div className={styles.scores}>
          {players.map((p, i) => (
            <span
              key={i}
              className={isDuo && i === currentPlayerIndex ? styles.activePlayer : styles.player}
            >
              {p.name}: {p.pairsFound} {p.pairsFound === 1 ? 'par' : 'pares'}
            </span>
          ))}
        </div>
        {isDuo && (
          <p className={styles.turn}>Vez de: {players[currentPlayerIndex].name}</p>
        )}
      </div>

      {showConfirm && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <p className={styles.dialogTitle}>Abandonar a partida?</p>
            <p className={styles.dialogBody}>O progresso será perdido.</p>
            <div className={styles.dialogButtons}>
              <button className={styles.btnCancel} onClick={() => setShowConfirm(false)}>
                Continuar jogando
              </button>
              <button className={styles.btnConfirm} onClick={onAbandon}>
                Abandonar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
