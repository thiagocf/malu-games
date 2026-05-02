import type { Animal } from '../game/types'
import styles from './LetterFeedbackPopup.module.css'

type Props = {
  animal: Animal
  selectedLetter: string
  onDismiss: () => void
}

export function LetterFeedbackPopup({ animal, selectedLetter, onDismiss }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <img
          src={animal.imagePath}
          alt="Animal escolhido"
          className={styles.image}
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
        />
        <p className={styles.text}>Esse animal não começa com a letra {selectedLetter}.</p>
        <button className={styles.button} onClick={onDismiss}>
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
