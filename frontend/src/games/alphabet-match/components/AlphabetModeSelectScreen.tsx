import type { AlphabetMatchMode } from '../game/types'
import styles from './AlphabetModeSelectScreen.module.css'

type Props = {
  onSelectMode: (mode: AlphabetMatchMode) => void
  onBackToMenu: () => void
}

export function AlphabetModeSelectScreen({ onSelectMode, onBackToMenu }: Props) {
  return (
    <main className={styles.container}>
      <button type="button" className={styles.backButton} onClick={onBackToMenu}>
        Voltar
      </button>
      <h1 className={styles.title}>Como quer brincar?</h1>
      <div className={styles.grid}>
        <button type="button" className={styles.card} onClick={() => onSelectMode('letter-to-animal')}>
          <span className={styles.letterCue}>A</span>
          <span className={styles.miniImages} aria-hidden="true">
            <span>🐝</span><span>🐘</span><span>🐱</span>
          </span>
          <span className={styles.name}>Ache o animal</span>
        </button>
        <button type="button" className={styles.card} onClick={() => onSelectMode('animal-to-letter')}>
          <span className={styles.animalCue} aria-hidden="true">🐘</span>
          <span className={styles.letterOptions} aria-hidden="true">
            <span>A</span><span>E</span><span>G</span>
          </span>
          <span className={styles.name}>Ache a letra</span>
        </button>
      </div>
    </main>
  )
}
