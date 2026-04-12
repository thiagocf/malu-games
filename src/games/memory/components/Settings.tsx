import styles from './Settings.module.css'

const PAIR_OPTIONS = [4, 6, 8, 10, 12] as const

type Props = {
  pairCount: number
  onChangePairCount: (count: number) => void
  onBack: () => void
}

export function Settings({ pairCount, onChangePairCount, onBack }: Props) {
  return (
    <main className={styles.container}>
      <button className={styles.back} onClick={onBack}>←</button>
      <h1 className={styles.title}>⚙️ Configurações</h1>

      <div className={styles.section}>
        <p className={styles.label}>Quantidade de pares</p>
        <div className={styles.options}>
          {PAIR_OPTIONS.map(n => (
            <button
              key={n}
              className={`${styles.option} ${n === pairCount ? styles.selected : ''}`}
              onClick={() => onChangePairCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p className={styles.hint}>{pairCount} pares = {pairCount * 2} cartas</p>
      </div>
    </main>
  )
}
