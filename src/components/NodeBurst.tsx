import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

type Pos = { x: number; y: number }

export default function NodeBurst({
  onComplete,
  migrateLeft
}: {
  onComplete?: (positions?: Pos[]) => void
  migrateLeft?: boolean
}) {
  const count = 25
  const idx = useMemo(() => Array.from({ length: count }, (_, i) => i), [count])


  // Layout constants must match OsintGraph
  const NODE_WIDTH = 200
  const RANKSEP = 48
  const LEFT_MARGIN = 96

  // Compute a perfectly straight left column (center-relative positions)

  const leftLayout = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    const rootCenterAbs = LEFT_MARGIN + NODE_WIDTH / 2
    const secondColCenterAbs = rootCenterAbs + NODE_WIDTH + RANKSEP

    const maxHeight = vh - 160
    const minSpacing = 18
    const spacing = Math.max(minSpacing, Math.min(28, maxHeight / (count - 1)))
    const columnHeight = spacing * (count - 1)
    const startY = -columnHeight / 2
    // center-relative X for the *second* column center
    const x = -vw / 2 + secondColCenterAbs
    const size = Math.max(10, Math.min(16, Math.floor(spacing - 6)))
    return { x, startY, spacing, size }
  }, [count])

  const seedPositions: Pos[] = useMemo(() => {
    if (!migrateLeft) return []
    const { x, startY, spacing } = leftLayout
    return idx.map((i) => ({ x, y: startY + i * spacing }))
  }, [idx, leftLayout, migrateLeft])

  // After the animation finishes, hand positions (for seeding the graph) to the parent
  useEffect(() => {
    const t = setTimeout(() => {
      if (onComplete) onComplete(migrateLeft ? seedPositions : undefined)
    }, 1100)
    return () => clearTimeout(t)
  }, [onComplete, migrateLeft, seedPositions])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {idx.map((i) => {
        if (!migrateLeft) {
          // Burst ring
          const angle = (i / idx.length) * Math.PI * 2
          const radius = 160 + (i % 5) * 16
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
              animate={{ x, y, scale: 1, opacity: 1, rotate: i * 12 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', mass: 1, damping: 12, stiffness: 180, delay: i * 0.01 }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background:
                  'radial-gradient(60% 60% at 40% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0)),' +
                  `conic-gradient(from ${i * 14}deg, rgba(122,162,255,0.7), rgba(180,139,255,0.7), rgba(122,162,255,0.7))`,
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: '0 4px 18px rgba(0,0,0,0.4)',
              }}
            />
          )
        } else {
          // Straight left column (perfect vertical alignment)
          const { x, startY, spacing, size } = leftLayout
          const y = startY + i * spacing
          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
              animate={{ x, y, scale: 1, opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', mass: 1, damping: 15, stiffness: 220, delay: i * 0.006 }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: size,
                height: size,
                borderRadius: '50%',
                background:
                  'radial-gradient(60% 60% at 40% 30%, rgba(255,255,255,0.55), rgba(255,255,255,0)),' +
                  'conic-gradient(from 120deg, rgba(122,162,255,0.55), rgba(180,139,255,0.55), rgba(122,162,255,0.55))',
                border: '1px solid rgba(255,255,255,0.22)',
                boxShadow: '0 3px 14px rgba(0,0,0,0.35)',
              }}
            />
          )
        }
      })}
    </div>
  )
}
