type Props = { size?: number }

export function LogoMark({ size = 22 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="4"  y="5"  width="17" height="17" rx="4" fill="var(--mg-teal-600)" />
      <rect x="27" y="5"  width="17" height="17" rx="4" fill="var(--mg-teal-700)" />
      <rect x="4"  y="27" width="40" height="17" rx="8" fill="var(--mg-amber-400)" />
    </svg>
  )
}
