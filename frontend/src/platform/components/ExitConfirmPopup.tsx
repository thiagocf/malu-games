import styles from './ExitConfirmPopup.module.css'

type Props = {
  onConfirm: () => void
  onCancel: () => void
}

export function ExitConfirmPopup({ onConfirm, onCancel }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <p className={styles.title}>Sair do jogo?</p>
        <div className={styles.buttons}>
          <button className={styles.btnCancel} onClick={onCancel}>Cancelar</button>
          <button className={styles.btnConfirm} onClick={onConfirm}>Sair</button>
        </div>
      </div>
    </div>
  )
}
