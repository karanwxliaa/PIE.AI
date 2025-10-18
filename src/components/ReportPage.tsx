// src/components/ReportPage.tsx
import { motion } from 'framer-motion'
import React from 'react'

type Props = {
  company: string
  onEnd?: () => void
}

export default function ReportPage({ company, onEnd }: Props) {
  const [score, setScore] = React.useState(86) // demo score
  React.useEffect(() => {
    let i = 62
    const t = setInterval(() => {
      i += Math.ceil((86 - i) / 6)
      if (i >= 86) { i = 86; clearInterval(t) }
      setScore(i)
    }, 140)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="pie-report">
      {/* End button (top-left) */}
        <div style={{ position: 'fixed', right: 18, top: 18, zIndex: 50 }}>
        <button className="btn" onClick={onEnd}>End ⤺</button>
        </div>
      {/* Removed internal header to avoid overlap with global title */}
      {/* <div className="title">
        <span className="pill">DEMO REPORT</span>
        {company} — Robustness Score
      </div> */}

      <div className="pie-report-grid">
        {/* Score */}
        <div className="pie-card pie-score">
          <div className="pie-score-ring">
            <motion.div
              className="pie-score-sweep"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            />
            <div className="pie-score-num">{score}</div>
          </div>
          <div className="pie-score-sub">/ 100</div>
          <div className="pie-muted">Confidence: High • Signals scanned: 63</div>
        </div>

        {/* Original Buyer (source of truth) */}
        <div className="pie-card">
          <div className="pie-card-title">Verified Original Buyer</div>
          <ul className="pie-list">
            <li><strong>Buyer:</strong> Hansa Imports GmbH (DE)</li>
            <li><strong>Relationship:</strong> Direct (no middlemen)</li>
            <li><strong>Evidence:</strong> PO #PO-2487 • Bill of Lading • 2 verified wire trails</li>
          </ul>
        </div>

        {/* Founders */}
        <div className="pie-card">
          <div className="pie-card-title">Founders</div>
          <ul className="pie-list">
            <li>Riya Malhotra — CEO (ex-Flipkart, exited 2019)</li>
            <li>Arvind Katyal — COO (ex-BlueDart)</li>
          </ul>
          <div className="pie-note">No bankruptcies found; 1 prior exit (2019).</div>
        </div>

        {/* Reviews & Activity */}
        <div className="pie-card">
          <div className="pie-card-title">Reviews & Online Activity</div>
          <ul className="pie-list">
            <li>Trust-style aggregate: 4.2/5 from 128 mentions</li>
            <li>Forums/Blogs: 0 critical threads; 3 neutral comparisons</li>
            <li>Social: steady engagement; no inorganic spikes</li>
          </ul>
        </div>

        {/* Cases / Red Flags */}
        <div className="pie-card">
          <div className="pie-card-title">Cases / Red Flags (12 mo)</div>
          <ul className="pie-list">
            <li>One low-severity supplier dispute (resolved; quality variance)</li>
            <li>No sanctions, PEP hits or AML exceptions</li>
          </ul>
        </div>

        {/* Procurement Hints */}
        <div className="pie-card">
          <div className="pie-card-title">Procurement Hints</div>
          <ul className="pie-list">
            <li>Warehouse: 3PL-X (on-time 98%)</li>
            <li>Carrier: Carrier-Z (cost-optimized lane EU-IN)</li>
            <li>Backup Vendor: Vendor-Y (flag: dropship risk)</li>
          </ul>
        </div>
      </div>

      <div className="pie-actions">
        <button className="btn" onClick={() => window.print()}>Export PDF</button>
      </div>
      <div className="pie-disclaimer">All data is demo/simulated for product walkthrough.</div>
    </div>
  )
}
