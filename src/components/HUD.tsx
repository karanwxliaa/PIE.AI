// src/components/HUD.tsx
type Props = {
  step: string
  autoPlay: boolean
  onToggle: () => void
  onNext: () => void
}
export default function HUD({ autoPlay, onToggle, onNext }: Props) {
  return (
    <div style={{ position: 'fixed', right: 18, top: 18, display: 'flex', gap: 8, zIndex: 45 }}>
      <button className="btn" onClick={onToggle}>{autoPlay ? 'Pause' : 'Play'}</button>
      <button className="btn" onClick={onNext}>Next ▶︎</button>
    </div>
  )
}
