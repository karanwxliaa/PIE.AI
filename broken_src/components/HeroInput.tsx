import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * Landing hero input
 * - Keeps existing API: onSubmit(value: string)
 * - Visual refresh inspired by "DemoStage": large gradient node + glass input bar
 * - Uses current theme CSS variables from styles.css (no new deps, minimal changes)
 */
export default function HeroInput({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus input on mount (matches prior behavior/expectation)
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(value.trim())
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.94, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ position: 'relative', width: 360, height: 420 }}
    >
      {/* Gradient node / orb */}
      <div
        style={{
          position: 'absolute',
          inset: '0 0 90px 0',
          margin: 'auto',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background:
            'radial-gradient(60% 60% at 50% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0.06)),' +
            'conic-gradient(from 220deg at 50% 50%, rgba(122,162,255,0.24), rgba(180,139,255,0.22), rgba(98,245,192,0.18), rgba(122,162,255,0.24))',
          border: '1px solid var(--glass-border)',
          boxShadow:
            '0 20px 40px rgba(0,0,0,0.35), inset 0 0 40px rgba(122,162,255,0.15), inset 0 0 80px rgba(180,139,255,0.10)',
          backdropFilter: 'blur(8px)',
        }}
        aria-hidden
      />

      {/* Subtle inner pulse */}
      <motion.div
        aria-hidden
        initial={{ scale: 0.96, opacity: 0.7 }}
        animate={{ scale: 1.02, opacity: 0.95 }}
        transition={{ duration: 1.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 360,
          height: 360,
          borderRadius: '50%',
          filter: 'blur(22px)',
          background:
            'radial-gradient(closest-side, rgba(122,162,255,0.22), rgba(122,162,255,0))',
          pointerEvents: 'none',
        }}
      />

      {/* Glass input bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          margin: '0 auto',
          width: 340,
          maxWidth: '92vw',
          padding: 6,
          borderRadius: 14,
          background: 'var(--glass)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What do you want PIE.ai to find?"
          aria-label="Query"
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid var(--glass-border)',
            background: 'transparent',
            color: 'var(--fg)',
            outline: 'none',
          }}
        />
        <button
          className="btn"
          type="submit"
          style={{
            whiteSpace: 'nowrap',
            background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
            borderColor: 'transparent',
            color: 'white',
            padding: '12px 14px',
          }}
        >
          Enter
        </button>
      </form>
    </motion.div>
  )
}
