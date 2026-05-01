import type { Round } from '../game/types'
import styles from './RoundScreen.module.css'

type Props = {
  round: Round
  selectedAnimalId: string | null
  blockedIds: string[]
  onPreview: (animalId: string) => void
  onConfirm: () => void
  onLetterTap: () => void
}

export function RoundScreen({ round, selectedAnimalId, blockedIds, onPreview, onConfirm, onLetterTap }: Props) {
  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.letterCard}
        onClick={onLetterTap}
        aria-label={`Letra ${round.letter}`}
      >
        <span className={styles.letter}>{round.letter}</span>
      </button>
      <div className={styles.grid}>
        {round.options.map(animal => {
          const isSelected = animal.id === selectedAnimalId
          const isBlocked = blockedIds.includes(animal.id)
          return (
            <button
              key={animal.id}
              type="button"
              className={[
                styles.option,
                isSelected ? styles.selected : '',
                isBlocked ? styles.blocked : '',
              ].join(' ')}
              onClick={() => onPreview(animal.id)}
              disabled={isBlocked}
            >
              <img
                src={animal.imagePath}
                alt={animal.label}
                className={styles.image}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </button>
          )
        })}
      </div>
      {selectedAnimalId !== null && (
        <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
          É esse! ✓
        </button>
      )}
    </div>
  )
}
