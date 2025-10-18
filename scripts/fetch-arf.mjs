import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const out = path.join(__dirname, '..', 'public', 'arf.json')
const targets = [
  'https://osintframework.com/arf.json',
  'https://raw.githubusercontent.com/lockfale/OSINT-Framework/master/public/arf.json'
]

const ua = { 'User-Agent': 'pie-ai-demo/0.1 (postinstall fetch)' }

async function main(){
  for (const url of targets) {
    try {
      const r = await fetch(url, { headers: ua })
      if (!r.ok) continue
      const text = await r.text()
      try { JSON.parse(text) } catch(e) { continue }
      fs.mkdirSync(path.dirname(out), { recursive: true })
      fs.writeFileSync(out, text)
      console.log('[postinstall] Downloaded arf.json from', url)
      return
    } catch (e) {
      // try next
    }
  }
  console.warn('[postinstall] Could not download arf.json. The app will use a small built-in snapshot.')
}

main()
