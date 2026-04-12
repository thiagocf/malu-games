import styles from './GameOver.module.css'

type Props = {
  moves: number
  onRestart: () => void
}

export function GameOver({ moves, onRestart }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
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
