import styles from './GameHeader.module.css'

type Props = {
  currentRound: number
  totalRounds: number
}

export function GameHeader({ currentRound, totalRounds }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.progress}>
        <span className={styles.label}>Turno</span>
        <span className={styles.value}>{currentRound} de {totalRounds}</span>
      </div>
    </header>
  )
}
