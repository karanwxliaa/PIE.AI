// src/components/ResearchScan.tsx
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

type Props = {
  items: string[]
  onDone: () => void
  durationPerItem?: number // ms
}

export default function ResearchScan({ items, onDone, durationPerItem = 900 }: Props) {
  const [idx, setIdx] = React.useState(0)

  React.useEffect(() => {
    if (idx >= items.length) {
      const t = setTimeout(onDone, 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setIdx((i) => i + 1), durationPerItem)
    return () => clearTimeout(t)
  }, [idx, items.length, durationPerItem, onDone])

  const label = items[idx] || ' '
  const progress = Math.min(idx / items.length, 1)

  return (
    <div className="pie-scan-root">
      {/* HUD */}
      <div className="pie-rec">
        <span className="pie-rec-dot" /> REC
        <span className="pie-rec-txt">  •  Automated research</span>
      </div>

      {/* Progress */}
      <div className="pie-scan-progress">
        <div className="pie-scan-bar" style={{ transform: `scaleX(${progress})` }} />
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          className="pie-scan-label"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35 }}
        >
          Researching: <strong>{label}</strong>
        </motion.div>
      </AnimatePresence>

      {/* Scanner band */}
      <motion.div
        className="pie-scan-band"
        initial={{ x: '-120%' }}
        animate={{ x: '120%' }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
      />
      {/* Fine noise */}
      <div className="pie-scan-noise" />
    </div>
  )
}
