import type { DeckConfig } from '../game/types'
import styles from './DeckSelector.module.css'

type Props = {
  decks: DeckConfig[]
  onSelect: (deck: DeckConfig) => void
  onOpenSettings: () => void
}

export function DeckSelector({ decks, onSelect, onOpenSettings }: Props) {
  return (
    <main className={styles.container}>
      <button className={styles.gear} onClick={onOpenSettings}>⚙️</button>
      <h1 className={styles.title}>🎮 Jogo da Memória</h1>
      <p className={styles.subtitle}>Escolhe um tema para jogar!</p>
      <div className={styles.grid}>
        {decks.map((deck, i) => (
          <button
            key={deck.id}
            className={`${styles.card}${i === decks.length - 1 && decks.length % 2 !== 0 ? ` ${styles.cardLast}` : ''}`}
            onClick={() => onSelect(deck)}
          >
            <span className={styles.emoji}>{deck.emoji}</span>
            <span className={styles.name}>{deck.name}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
