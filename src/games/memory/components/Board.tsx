import type { Animal, Card as CardType } from '../game/types'
import { Card } from './Card'
import styles from './Board.module.css'

type Props = {
  cards: CardType[]
  animals: Animal[]
  onFlip: (id: number) => void
}

export function Board({ cards, animals, onFlip }: Props) {
  const emojiMap = Object.fromEntries(animals.map(a => [a.id, a.emoji]))
  return (
    <div className={styles.grid}>
      {cards.map(card => (
        <Card
          key={card.id}
          card={card}
          animalEmoji={emojiMap[card.animalId]}
          onClick={() => onFlip(card.id)}
        />
      ))}
    </div>
  )
}
