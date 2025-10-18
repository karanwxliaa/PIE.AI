import { useEffect, useState, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import GradientBackground from './components/GradientBackground'
import HeroInput from './components/HeroInput'
import NodeBurst from './components/NodeBurst'
import BridgeMorph from './components/BridgeMorph'
import OsintGraph from './components/OsintGraph'
import type { OsintGraphHandle } from './components/OsintGraph'
import HUD from './components/HUD'

type Step = 'intro' | 'burst' | 'migrateLeft' | 'bridge' | 'graph'
type Pos = { x: number; y: number }

export default function App() {
  const [step, setStep] = useState<Step>('intro')
  const [userInput, setUserInput] = useState<string>('')
  const [autoPlay, setAutoPlay] = useState(true)
  const graphRef = useRef<OsintGraphHandle>(null)
  const [seedPositions, setSeedPositions] = useState<Pos[] | null>(null) // optional; graph can compute fallback

  useEffect(() => {
    if (!autoPlay) return
    if (step === 'intro' && userInput) {
      const t = setTimeout(() => setStep('burst'), 900)
      return () => clearTimeout(t)
    }
  }, [step, autoPlay, userInput])

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <GradientBackground />

      <div className="title">
        <span className="pill">PIE.ai</span>
        <span>Interactive Demo</span>
      </div>

      <HUD
        step={step}
        onCloseAll={() => graphRef.current?.collapseAll()}
        onNext={() => {
          setAutoPlay(false)
          setStep((s) =>
            s === 'intro'
              ? userInput ? 'burst' : 'intro'
              : s === 'burst'
              ? 'migrateLeft'
              : s === 'migrateLeft'
              ? 'bridge'
              : s === 'bridge'
              ? 'graph'
              : 'graph'
          )
        }}
      />

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <div className="center" key="intro">
            <HeroInput
              onSubmit={(value) => {
                setUserInput(value)
                setStep('burst')
              }}
            />
          </div>
        )}

        {step === 'burst' && (
          <NodeBurst key="burst" onComplete={() => setStep('migrateLeft')} />
        )}

        {step === 'migrateLeft' && (
          <NodeBurst
            key="migrate"
            migrateLeft
            onComplete={(positions) => {
              setSeedPositions(positions || null) // optional
              setStep('bridge')
            }}
          />
        )}

        {step === 'bridge' && (
          <BridgeMorph key="bridge" onDone={() => setStep('graph')} />
        )}

        {step === 'graph' && (
          <OsintGraph
            ref={graphRef}
            key="graph"
            rootLabel={userInput || 'PIE.ai'}
            limitKids={33}
            seedPositions={seedPositions || undefined}
          />
        )}

      </AnimatePresence>

      <div className="hud" />
      {/* <div className="callout">Select a node to expand or click the ▶︎ button to advance.</div> */}
    </div>
  )
}
