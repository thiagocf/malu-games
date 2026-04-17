import type { Round } from '../game/types'
import styles from './RoundScreen.module.css'

type Props = {
  round: Round
  showCorrect: boolean
  onSelect: (animalId: string) => void
}

export function RoundScreen({ round, showCorrect, onSelect }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.letterCard}>
        <span className={styles.letter}>{round.letter}</span>
      </div>
      <div className={styles.grid}>
        {round.options.map(animal => {
          const isCorrect = animal.id === round.correctAnimal.id
          return (
            <button
              key={animal.id}
              className={`${styles.option} ${showCorrect && isCorrect ? styles.correct : ''}`}
              onClick={() => onSelect(animal.id)}
              disabled={showCorrect}
            >
              <img
                src={animal.imagePath}
                alt={animal.label}
                className={styles.image}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
