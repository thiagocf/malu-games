import { useState } from 'react'
import styles from './Settings.module.css'

const PAIR_OPTIONS = [4, 6, 8, 10, 12] as const

type Props = {
  pairCount: number
  onChangePairCount: (count: number) => void
  onBack: () => void
}

export function Settings({ pairCount, onChangePairCount, onBack }: Props) {
  const [localPairCount, setLocalPairCount] = useState(pairCount)
  const [saved, setSaved] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasChanges = localPairCount !== pairCount

  function handleSave() {
    onChangePairCount(localPairCount)
    setSaved(true)
    setTimeout(onBack, 800)
  }

  function handleBack() {
    if (hasChanges) {
      setShowConfirm(true)
    } else {
      onBack()
    }
  }

  return (
    <main className={styles.container}>
      <button className={styles.back} onClick={handleBack}>←</button>
      <h1 className={styles.title}>⚙️ Configurações</h1>

      <div className={styles.section}>
        <p className={styles.label}>Quantidade de pares</p>
        <div className={styles.options}>
          {PAIR_OPTIONS.map(n => (
            <button
              key={n}
              className={`${styles.option} ${n === localPairCount ? styles.selected : ''}`}
              onClick={() => setLocalPairCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p className={styles.hint}>{localPairCount} pares = {localPairCount * 2} cartas</p>
      </div>

      <button
        className={`${styles.save} ${saved ? styles.savedFeedback : ''}`}
        onClick={handleSave}
        disabled={saved}
      >
        {saved ? '✓ Salvo!' : 'Salvar'}
      </button>

      {showConfirm && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <p className={styles.dialogTitle}>Sair sem salvar?</p>
            <p className={styles.dialogBody}>As alterações serão perdidas.</p>
            <div className={styles.dialogButtons}>
              <button className={styles.btnSave} onClick={handleSave}>
                Salvar
              </button>
              <button className={styles.btnDiscard} onClick={onBack}>
                Sair sem salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
