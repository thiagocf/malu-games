import { useState } from 'react'
import styles from './GameHeader.module.css'

type Props = {
  moves: number
  onAbandon: () => void
}

export function GameHeader({ moves, onAbandon }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.stat}>
          <span className={styles.label}>Tentativas</span>
          <span className={styles.value}>{moves}</span>
        </div>
        <h1 className={styles.title}>Jogo da Memória</h1>
        <button className={styles.abandon} onClick={() => setShowConfirm(true)}>
          Abandonar
        </button>
      </header>

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
