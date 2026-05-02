import type { Round } from '../game/types'
import styles from './LetterRoundScreen.module.css'

type Props = {
  round: Round
  selectedLetter: string | null
  blockedLetters: string[]
  onPreviewAnimal: () => void
  onSelectLetter: (letter: string) => void
  onConfirm: () => void
}

export function LetterRoundScreen({
  round,
  selectedLetter,
  blockedLetters,
  onPreviewAnimal,
  onSelectLetter,
  onConfirm,
}: Props) {
  return (
    <section className={styles.container}>
      <button
        type="button"
        className={styles.animalButton}
        aria-label="Ouvir animal"
        onClick={onPreviewAnimal}
      >
        <img
          src={round.correctAnimal.imagePath}
          alt="Animal para descobrir a letra"
          className={styles.image}
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
        />
      </button>

      <div className={styles.options}>
        {round.letterOptions.map(letter => {
          const selected = selectedLetter === letter
          const blocked = blockedLetters.includes(letter)
          return (
            <button
              key={letter}
              type="button"
              className={`${styles.letterButton} ${selected ? styles.selected : ''} ${blocked ? styles.blocked : ''}`}
              aria-label={`Letra ${letter}`}
              disabled={blocked}
              onClick={() => onSelectLetter(letter)}
            >
              {letter}
            </button>
          )
        })}
      </div>

      {selectedLetter && (
        <button type="button" className={styles.confirmButton} onClick={onConfirm}>
          É essa!
        </button>
      )}
    </section>
  )
}
