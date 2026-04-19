import type { ReactNode } from 'react'
import styles from './GameStartScreen.module.css'

type Props = {
  title: ReactNode
  subtitle?: ReactNode
  onOpenSettings?: () => void
  children: ReactNode
}

export function GameStartScreen({ title, subtitle, onOpenSettings, children }: Props) {
  return (
    <main className={styles.container}>
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
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {children}
    </main>
  )
}
