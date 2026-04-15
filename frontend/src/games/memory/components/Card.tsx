import type { Card as CardType } from '../game/types'
import styles from './Card.module.css'

type Props = {
  card: CardType
  animalEmoji: string
  onClick: () => void
  index: number
}

export function Card({ card, animalEmoji, onClick, index }: Props) {
  const isActive = card.isFlipped || card.isMatched
  return (
    <div
      className={`${styles.scene} ${card.isMatched ? styles.matched : ''}`}
      onClick={!card.isFlipped && !card.isMatched ? onClick : undefined}
      style={{ '--i': index } as React.CSSProperties}
    >
      <div className={`${styles.card} ${isActive ? styles.flipped : ''}`}>
        <div className={`${styles.face} ${styles.back}`}>
          <span className={styles.backStars} aria-hidden="true">✦</span>
        </div>
        <div className={`${styles.face} ${styles.front}`}>{animalEmoji}</div>
      </div>
    </div>
  )
}
