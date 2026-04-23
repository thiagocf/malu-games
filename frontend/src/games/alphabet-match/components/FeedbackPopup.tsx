import type { Animal } from '../game/types'
import styles from './FeedbackPopup.module.css'

type Props = {
  animal: Animal
  onDismiss: () => void
}

export function FeedbackPopup({ animal, onDismiss }: Props) {

  const firstLetter = animal.label.charAt(0)
  const rest = animal.label.slice(1)
  const article = animal.gender === 'F' ? 'Essa é a' : 'Esse é o'

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <img
          src={animal.imagePath}
          alt={animal.label}
          className={styles.image}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
        <p className={styles.text}>
          {article} <span className={styles.highlight}>{firstLetter}</span>{rest}!
        </p>
        <button className={styles.button} onClick={onDismiss}>
          🔄 Tentar novamente
        </button>
      </div>
    </div>
  )
}
