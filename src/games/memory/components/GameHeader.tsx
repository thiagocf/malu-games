import styles from './GameHeader.module.css'

type Props = {
  moves: number
  onRestart: () => void
}

export function GameHeader({ moves, onRestart }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.stat}>
        <span className={styles.label}>Tentativas</span>
        <span className={styles.value}>{moves}</span>
      </div>
      <h1 className={styles.title}>Jogo da Memória</h1>
      <button className={styles.restart} onClick={onRestart}>↺ Novo</button>
    </header>
  )
}
