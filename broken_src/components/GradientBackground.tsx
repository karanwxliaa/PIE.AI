import { memo } from 'react'
import { motion } from 'framer-motion'

/**
 * Wider, subtler ambient gradients that fill the canvas.
 * Soft motion keeps it elegant (no tacky hotspots).
 */
export default memo(function GradientBackground(){
  return (
    <div style={{position:'absolute', inset:0, overflow:'hidden'}} aria-hidden>
      {/* Large ambient wash */}
      <motion.div
        initial={{ opacity: 0.22, scale: 0.98 }}
        animate={{ opacity: 0.28, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1200px 900px at 20% 15%, rgba(122,162,255,0.20), transparent 60%),' +
            'radial-gradient(1100px 800px at 85% 80%, rgba(180,139,255,0.18), transparent 60%),' +
            'linear-gradient(180deg, #0b0f14, #0f1720)',
          filter: 'saturate(110%)',
        }}
      />

      {/* Slow drifting halo TL */}
      <motion.div
        initial={{ x: -80, y: -60, opacity: 0.35 }}
        animate={{ x: -20, y: -10, opacity: 0.4 }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: 900, height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(140,170,255,0.18), rgba(140,170,255,0))',
          top: -200, left: -260,
          filter: 'blur(80px)'
        }}
      />

      {/* Slow drifting halo BR */}
      <motion.div
        initial={{ x: 60, y: 80, opacity: 0.30 }}
        animate={{ x: 10, y: 20, opacity: 0.36 }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: 1000, height: 1000,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(200,150,255,0.16), rgba(200,150,255,0))',
          bottom: -260, right: -280,
          filter: 'blur(100px)'
        }}
      />
    </div>
  )
})
