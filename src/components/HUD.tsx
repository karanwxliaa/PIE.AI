export default function HUD({ step, autoPlay, onToggle, onNext }:{ step:string, autoPlay:boolean, onToggle:()=>void, onNext:()=>void }){
  return (
    <div style={{position:'fixed', right:18, top:18, display:'flex', gap:8}}>
      <button className="btn" onClick={onToggle}>{autoPlay ? 'Pause' : 'Play'}</button>
      <button className="btn" onClick={onNext}>Next ▶︎</button>
    </div>
  )
}
