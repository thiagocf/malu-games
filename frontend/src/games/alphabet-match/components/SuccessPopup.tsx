import { useEffect } from 'react'
import type { Animal } from '../game/types'
import styles from './SuccessPopup.module.css'

type Props = {
  animal: Animal
  letter: string
  onNext: () => void
  onMount: () => void
}

export function SuccessPopup({ animal, letter, onNext, onMount }: Props) {
  useEffect(() => {
    onMount()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const firstLetter = animal.label.charAt(0)
  const rest = animal.label.slice(1)

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
          Isso mesmo! <span className={styles.highlight}>{firstLetter}</span>{rest},
          {' '}com a letra <span className={styles.highlight}>{letter}</span>!
        </p>
        <button className={styles.button} onClick={onNext}>
          Próximo →
        </button>
      </div>
    </div>
  )
}
