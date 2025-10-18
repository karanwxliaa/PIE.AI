import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function HeroInput({ onSubmit }:{ onSubmit:(value:string)=>void }){
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <motion.div
      initial={{scale:0.9, opacity:0}}
      animate={{scale:1, opacity:1}}
      exit={{scale:0.8, opacity:0}}
      transition={{duration:0.6, ease:'easeOut'}}
      style={{
        width:340, height:340, borderRadius:'50%', position:'relative',
        background: 'radial-gradient(60% 60% at 50% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0.06)),'+
                    'conic-gradient(from 220deg, rgba(122,162,255,0.6), rgba(180,139,255,0.6), rgba(122,162,255,0.6))',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 0 50px rgba(255,255,255,0.06)',
        display: 'grid', placeItems:'center',
      }}
    >
      <div style={{textAlign:'center', width:'80%'}}>
        <div style={{fontWeight:800, fontSize:24, letterSpacing:0.5, marginBottom:12}}>Welcome to PIE.AI</div>
        <div style={{fontSize:13, opacity:0.8, marginBottom:16}}>Enter Company Name:</div>
        <form onSubmit={(e)=>{ e.preventDefault(); if(value.trim()) onSubmit(value.trim())}} style={{display:'flex', gap:8, justifyContent:'center'}}>
          <input
            ref={inputRef}
            value={value}
            onChange={e=>setValue(e.target.value)}
            placeholder="Type your input…"
            style={{
              width:180, padding:'10px 12px', borderRadius:10,
              border:'1px solid rgba(255,255,255,0.25)',
              background:'rgba(255,255,255,0.06)',
              color:'white', outline:'none'
            }}
          />
          <button className="btn" type="submit">Start ▶︎</button>
        </form>
      </div>
    </motion.div>
  )
}
