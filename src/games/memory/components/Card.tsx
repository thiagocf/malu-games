import type { Card as CardType } from '../game/types'
import styles from './Card.module.css'

type Props = {
  card: CardType
  animalEmoji: string
  onClick: () => void
}

export function Card({ card, animalEmoji, onClick }: Props) {
  const isActive = card.isFlipped || card.isMatched
  return (
    <div
      className={`${styles.scene} ${card.isMatched ? styles.matched : ''}`}
      onClick={!card.isFlipped && !card.isMatched ? onClick : undefined}
    >
      <div className={`${styles.card} ${isActive ? styles.flipped : ''}`}>
        <div className={`${styles.face} ${styles.back}`}>?</div>
        <div className={`${styles.face} ${styles.front}`}>{animalEmoji}</div>
      </div>
    </div>
  )
}
