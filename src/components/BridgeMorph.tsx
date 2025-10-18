import { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * BridgeMorph overlays 33 items at the left-column seed positions and
 * "melts" circles → box-ish shapes, then calls onDone.
 * This visually links the left-node line to the graph's first frame.
 */
export default function BridgeMorph({
  count = 33,
  duration = 700,
  onDone
}: {
  count?: number
  duration?: number
  onDone: () => void
}) {

  const { seeds, nodeSize } = useMemo(() => {
    // Must match OsintGraph / NodeBurst constants
    const NODE_WIDTH = 200
    const RANKSEP = 48
    const LEFT_MARGIN = 96
    const rootCenterAbs = LEFT_MARGIN + NODE_WIDTH / 2
    const secondColCenterAbs = rootCenterAbs + NODE_WIDTH + RANKSEP
    const secondColLeftEdge = secondColCenterAbs - NODE_WIDTH / 2
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    const spacing = computeNodesep(count)
    const columnH = spacing * (count - 1)
    const startY = vh / 2 - columnH / 2
    const seeds = Array.from({ length: count }, (_, i) => ({
      x: secondColLeftEdge,
      y: startY + i * spacing
    }))
    const nodeSize = Math.max(10, Math.min(16, Math.floor(spacing - 6)))
    return { seeds, nodeSize }
  }, [count])

  useEffect(() => {
    const t = setTimeout(() => onDone(), duration + 120)
    return () => clearTimeout(t)
  }, [duration, onDone])

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {seeds.map((p, i) => (
        <motion.div
          key={i}
          initial={{
            x: p.x, y: p.y, width: nodeSize, height: nodeSize, borderRadius: 999, opacity: 1
          }}
          animate={{
            width: 200,         // target node width
            height: 36,         // target node height
            borderRadius: 12,
            opacity: 1
          }}
          transition={{
            duration: duration / 1000,
            ease: [0.2, 0.7, 0.2, 1],
            delay: i * 0.002 // tiny cascade
          }}
          style={{
            position: 'absolute',
            left: 0, top: 0,
            background:
              'radial-gradient(60% 60% at 40% 30%, rgba(255,255,255,0.55), rgba(255,255,255,0)),' +
              'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            border: '1px solid rgba(255,255,255,0.16)',
            boxShadow: '0 8px 22px rgba(0,0,0,0.35)'
          }}
        />
      ))}
    </div>
  )
}

/** Same spacing logic as the graph so positions match perfectly. */
function computeNodesep(firstLevelCount: number) {
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const topBottomPad = 180
  const available = Math.max(240, vh - topBottomPad)
  return Math.max(16, Math.min(28, available / Math.max(1, firstLevelCount - 1)))
}
