type Props = {
  step: string
  onNext: () => void
  onCloseAll: () => void
}

export default function HUD({ step, onNext, onCloseAll }: Props){
  return (
    <div style={{position:'fixed', right:18, top:18, display:'flex', gap:8}}>
      {/* Replaces the old Pause button in the same spot */}
      <button className="btn" onClick={onCloseAll}>Close all</button>
      <button className="btn" onClick={onNext}>Next ▶︎</button>
    </div>
  )
}
