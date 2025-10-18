// src/components/ProcessFlow.tsx
import { motion } from 'framer-motion'
import React from 'react'

type Props = {
  steps: string[]
  onDone: () => void
  paceMs?: number
}

export default function ProcessFlow({ steps, onDone, paceMs = 950 }: Props) {
  const [active, setActive] = React.useState(0)
  React.useEffect(() => {
    if (active >= steps.length) {
      const t = setTimeout(onDone, 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setActive((a) => a + 1), paceMs)
    return () => clearTimeout(t)
  }, [active, steps.length, onDone, paceMs])

  return (
    <div className="pie-pipeline">
      <ol className="pie-steps">
        {steps.map((s, i) => {
          const state = i < active ? 'done' : i === active ? 'active' : 'todo'
          return (
            <li key={i} data-state={state}>
              <span className="pie-step-idx">{i + 1}</span>
              <motion.span
                className="pie-step-text"
                initial={{ opacity: 0.4 }}
                animate={{
                  opacity: state === 'active' ? 1 : state === 'done' ? 0.85 : 0.45,
                  x: state === 'active' ? 0 : 0,
                }}
                transition={{ duration: 0.25 }}
              >
                {s}
              </motion.span>
              <span className="pie-step-check">✓</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
