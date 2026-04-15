import { useState } from 'react'
import styles from './Settings.module.css'
import type { PlayerMode } from '../game/types'

const PAIR_OPTIONS = [4, 6, 8, 10, 12] as const
const DEFAULT_NAMES = ['Jogador 1', 'Jogador 2']

type Props = {
  pairCount: number
  onChangePairCount: (count: number) => void
  playerMode: PlayerMode
  playerNames: string[]
  onChangePlayerMode: (mode: PlayerMode) => void
  onChangePlayerNames: (names: string[]) => void
  onBack: () => void
}

export function Settings({
  pairCount,
  onChangePairCount,
  playerMode,
  playerNames,
  onChangePlayerMode,
  onChangePlayerNames,
  onBack,
}: Props) {
  const [localPairCount, setLocalPairCount] = useState(pairCount)
  const [localMode, setLocalMode] = useState<PlayerMode>(playerMode)
  const [localNames, setLocalNames] = useState<string[]>(playerNames)
  const [saved, setSaved] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasChanges =
    localPairCount !== pairCount ||
    localMode !== playerMode ||
    localNames[0] !== playerNames[0] ||
    localNames[1] !== playerNames[1]

  function handleSave() {
    const names = localNames.map((n, i) => n.trim() || DEFAULT_NAMES[i])
    onChangePairCount(localPairCount)
    onChangePlayerMode(localMode)
    onChangePlayerNames(names)
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

  function handleNameChange(index: number, value: string) {
    const next = [...localNames]
    next[index] = value
    setLocalNames(next)
  }

  return (
    <main className={styles.container}>
      <button className={styles.back} onClick={handleBack}>←</button>
      <h1 className={styles.title}>⚙️ Configurações</h1>

      <div className={styles.section}>
        <p className={styles.label}>Modo de jogo</p>
        <div className={styles.options}>
          <button
            className={`${styles.option} ${styles.modeOption} ${localMode === 'solo' ? styles.selected : ''}`}
            onClick={() => setLocalMode('solo')}
          >
            Solo
          </button>
          <button
            className={`${styles.option} ${styles.modeOption} ${localMode === 'duo' ? styles.selected : ''}`}
            onClick={() => setLocalMode('duo')}
          >
            2 Jogadores
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.nameField}>
          <label className={styles.label}>Jogador 1</label>
          <input
            className={styles.nameInput}
            value={localNames[0]}
            placeholder={DEFAULT_NAMES[0]}
            onChange={e => handleNameChange(0, e.target.value)}
          />
        </div>
        {localMode === 'duo' && (
          <div className={styles.nameField}>
            <label className={styles.label}>Jogador 2</label>
            <input
              className={styles.nameInput}
              value={localNames[1]}
              placeholder={DEFAULT_NAMES[1]}
              onChange={e => handleNameChange(1, e.target.value)}
            />
          </div>
        )}
      </div>

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
