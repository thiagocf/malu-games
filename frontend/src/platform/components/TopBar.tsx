import { useState } from 'react'
import { ExitConfirmPopup } from './ExitConfirmPopup'
import { LogoMark } from './LogoMark'
import styles from './TopBar.module.css'

type Props = {
  isInGame: boolean
  onExitGame: () => void
}

export function TopBar({ isInGame, onExitGame }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    if (!isInGame) return
    setShowConfirm(true)
  }

  return (
    <>
      <header className={styles.topBar}>
        <button
          className={`${styles.logo} ${isInGame ? styles.clickable : ''}`}
          onClick={handleClick}
          disabled={!isInGame}
        >
          <LogoMark />
          <span>Malu<span className={styles.logoAccent}>Games</span></span>
        </button>
      </header>
      {showConfirm && (
        <ExitConfirmPopup
          onConfirm={() => {
            setShowConfirm(false)
            onExitGame()
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}
