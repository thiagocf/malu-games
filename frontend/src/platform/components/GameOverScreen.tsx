import type { ReactNode } from 'react'
import styles from './GameOverScreen.module.css'

type Props = {
  title: ReactNode
  children: ReactNode
  onRestart: () => void
  onBackToMenu: () => void
  onOpenSettings?: () => void
  restartLabel?: string
  menuLabel?: string
}

export function GameOverScreen({
  title,
  children,
  onRestart,
  onBackToMenu,
  onOpenSettings,
  restartLabel = 'Jogar de novo',
  menuLabel = 'Outro jogo',
}: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        {onOpenSettings && (
          <button
            type="button"
            className={styles.gear}
            aria-label="Configurações"
            onClick={onOpenSettings}
          >
            ⚙️
          </button>
        )}
        <h2 className={styles.title}>{title}</h2>
        {children}
        <div className={styles.buttons}>
          <button className={styles.button} onClick={onRestart}>{restartLabel}</button>
          <button className={styles.buttonSecondary} onClick={onBackToMenu}>{menuLabel}</button>
        </div>
      </div>
    </div>
  )
}
