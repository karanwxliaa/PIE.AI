import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 5174

// Simple health
app.get('/api/health', (_,res)=> res.json({ ok: true }))

// Proxy arf.json with fallbacks
app.get('/api/arf', async (req, res) => {
  res.set('Cache-Control','no-store')
  const localPath = path.join(__dirname, '..', 'public', 'arf.json')
  try {
    if (fs.existsSync(localPath)) {
      const raw = fs.readFileSync(localPath, 'utf8')
      res.type('application/json').send(raw)
      return
    }
  } catch(err) { /* ignore */ }

  const targets = [
    'https://osintframework.com/arf.json',
    'https://raw.githubusercontent.com/lockfale/OSINT-Framework/master/public/arf.json'
  ]

  for (const url of targets) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'pie-ai-demo/0.1 (+https://example.local)' } })
      if (r.ok) {
        const text = await r.text()
        try { JSON.parse(text) } catch(e) { continue }
        res.type('application/json').send(text)
        return
      }
    } catch (e) { /* try next */ }
  }

  // Final fallback: bundled snapshot
  const snapshotPath = path.join(__dirname, '..', 'src', 'data', 'osint-snapshot.json')
  const raw = fs.readFileSync(snapshotPath, 'utf8')
  res.type('application/json').send(raw)
})

app.listen(PORT, ()=> console.log(`[api] listening on http://localhost:${PORT}`))
