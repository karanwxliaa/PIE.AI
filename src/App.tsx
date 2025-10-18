// src/App.tsx
import TeamSection from './components/TeamSection'
import { useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import GradientBackground from './components/GradientBackground'
import HeroInput from './components/HeroInput'
import NodeBurst from './components/NodeBurst'
import BridgeMorph from './components/BridgeMorph'
import OsintGraph, { OsintGraphHandle } from './components/OsintGraph'
import HUD from './components/HUD'
import ResearchScan from './components/ResearchScan'
import ProcessFlow from './components/ProcessFlow'
import ReportPage from './components/ReportPage'
import { makeDemoTree, researchItems, pipelineSteps } from './data/demoTree'

type Step = 'intro' | 'burst' | 'migrateLeft' | 'bridge' | 'graph' | 'scan' | 'pipeline' | 'report'
type Pos = { x: number; y: number }

export default function App() {
  const [step, setStep] = useState<Step>('intro')
  const [userInput, setUserInput] = useState<string>('')
  const [autoPlay, setAutoPlay] = useState(true)
  const [seedPositions, setSeedPositions] = useState<Pos[] | null>(null)
  const graphRef = useRef<OsintGraphHandle>(null)

  const nextStep = async () => {
    if (step === 'graph') {
      // Run the scripted expansions
      await runGraphScript()
      setStep('scan')
      return
    }
    setStep((s) =>
      s === 'intro' ? 'burst'
        : s === 'burst' ? 'migrateLeft'
          : s === 'migrateLeft' ? 'bridge'
            : s === 'bridge' ? 'graph'
              : s === 'scan' ? 'pipeline'
                : s === 'pipeline' ? 'report'
                  : 'report'
    )
  }

  async function runGraphScript() {
    const g = graphRef.current
    if (!g) return
    // 1) Supply Chain and its children
    await g.expandByLabels(['Supply Chain'])
    await g.expandPath(['Supply Chain', 'Risk Scoring'])
    await g.expandPath(['Supply Chain', 'Procurement'])
    await g.expandPath(['Supply Chain', 'Fulfillment'])
    // 2) Business Records & Forums / Blogs (flash/highlight)
    await g.expandByLabels(['Business Records'])
    await g.expandByLabels(['Forums / Blogs'])
    g.fit()
  }

  const resetToHome = () => {
    // Go back to the start, clean slate.
    setStep('intro')
    setUserInput('')
    setSeedPositions(null)
    setAutoPlay(true)
  }

  return (
      <div
        style={{
          position: 'relative',
          minHeight: '100%',
          height: '100%',
          overflowY: step === 'intro' ? 'auto' : 'hidden', // ✅ scroll only on main page
        }}
      >
      <GradientBackground />

      <div className="title">
        <span className="pill">DEMO</span>
             PIE.AI
      </div>

      <HUD
        step={step}
        autoPlay={autoPlay}
        onToggle={() => setAutoPlay((v) => !v)}
        onNext={nextStep}
      />

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <div key="intro" style={{ minHeight: '100%', paddingBottom: 24 }}>
            {/* ✅ Flow-based hero wrapper (no absolute overlay) */}
            <div className="hero-wrap">
              <HeroInput
                onSubmit={(value) => {
                  setUserInput(value)
                  if (autoPlay) setStep('burst')
                }}
              />
            </div>

            {/* Team section now comes AFTER the hero and won’t overlap */}
            <TeamSection />
          </div>
        )}
        
        {step === 'burst' && (
          <NodeBurst
            key="burst"
            onComplete={() => { if (autoPlay) setStep('migrateLeft') }}
          />
        )}

        {step === 'migrateLeft' && (
          <NodeBurst
            key="migrate"
            migrateLeft
            onComplete={(positions) => {
              setSeedPositions(positions || null)
              if (autoPlay) setStep('bridge')
            }}
          />
        )}

        {step === 'bridge' && (
          <BridgeMorph
            key="bridge"
            onDone={() => { if (autoPlay) setStep('graph') }}
          />
        )}

        {step === 'graph' && (
          <div key="graph" style={{ height: '100%' }}>
            {/* ✅ Top tip for graph interaction */}
            <div className="graph-tip">
              Click any node to expand or click Next to continue
            </div>

            <OsintGraph
              ref={graphRef}
              rootLabel={userInput || 'PIE.ai'}
              limitKids={33}
              seedPositions={seedPositions || undefined}
            />
          </div>
        )}


        {/* ✅ Double the scan speed per item (was ~900ms, now ~1800ms) */}
        {step === 'scan' && (
          <ResearchScan
            key="scan"
            items={researchItems}
            durationPerItem={1800}     // ⬅ doubled
            onDone={() => setStep('pipeline')}
          />
        )}

        {/* ✅ Double the pipeline pace (was ~950ms, now ~1900ms) */}
        {step === 'pipeline' && (
          <ProcessFlow
            key="pipeline"
            steps={pipelineSteps}
            paceMs={1900}              // ⬅ doubled
            onDone={() => setStep('report')}
          />
        )}

        {/* ✅ Report page now shows its own "End" button (top-left) and no internal title */}
        {step === 'report' && (
          <div key="report" style={{ height: '100%', padding: 24 }}>
            <ReportPage company={userInput || 'PIE.ai'} onEnd={resetToHome} />
          </div>
        )}
      </AnimatePresence>

      <div className="callout">
        {step === 'graph'
          ? 'Click nodes to expand or press Next ▶︎ to auto-expand the key branches.'
          : step === 'report'
            ? 'Review the demo report or tap End to return.'
            : 'Press Next ▶︎ to advance the demo.'}
            </div>
    </div>
  )      
}
