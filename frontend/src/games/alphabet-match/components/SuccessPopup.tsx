import type { Animal } from '../game/types'
import { SUCCESS_MESSAGE_TEMPLATES, type SuccessMessageToken } from '../game/successMessages'
import styles from './SuccessPopup.module.css'

type Props = {
  animal: Animal
  letter: string
  messageIndex: number
  onNext: () => void
}

export function SuccessPopup({ animal, letter, messageIndex, onNext }: Props) {
  const template = SUCCESS_MESSAGE_TEMPLATES[messageIndex] ?? SUCCESS_MESSAGE_TEMPLATES[0]

  const firstLetter = animal.label.charAt(0)
  const rest = animal.label.slice(1)

  const renderToken = (token: SuccessMessageToken, index: number) => {
    if (token === 'animal') {
      return (
        <span key={index}>
          <span className={styles.highlight}>{firstLetter}</span>{rest}
        </span>
      )
    }

    if (token === 'letter') {
      return <span key={index} className={styles.highlight}>{letter}</span>
    }

    return token
  }

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
          {template.map(renderToken)}
        </p>
        <button className={styles.button} onClick={onNext}>
          Próximo →
        </button>
      </div>
    </div>
  )
}
