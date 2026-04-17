import styles from './GameSelector.module.css'

export type GameId = 'memory' | 'alphabet-match'

type GameEntry = {
  id: GameId
  emoji: string
  name: string
}

const GAMES: GameEntry[] = [
  { id: 'memory', emoji: '🃏', name: 'Jogo da Memória' },
  { id: 'alphabet-match', emoji: '🔤', name: 'Alphabet Match' },
]

type Props = {
  onSelect: (gameId: GameId) => void
}

export function GameSelector({ onSelect }: Props) {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>🎮 Malu Games</h1>
      <p className={styles.subtitle}>Escolhe um jogo!</p>
      <div className={styles.grid}>
        {GAMES.map(game => (
          <button
            key={game.id}
            className={styles.card}
            onClick={() => onSelect(game.id)}
          >
            <span className={styles.emoji}>{game.emoji}</span>
            <span className={styles.name}>{game.name}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
