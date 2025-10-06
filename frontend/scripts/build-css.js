const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')

function runTailwind() {
  const root = path.resolve(__dirname, '..')
  const binDir = path.join(root, 'node_modules', '.bin')
  const isWin = process.platform === 'win32'
  const binName = isWin ? 'tailwindcss.cmd' : 'tailwindcss'
  const binPath = path.join(binDir, binName)

  if (fs.existsSync(binPath)) {
    console.log('Running local tailwind binary:', binPath)
    const args = ['-i', 'src/index.css', '-o', 'src/tailwind.generated.css', '--minify']
    const res = spawnSync(binPath, args, { stdio: 'inherit' })
    if (res.error) {
      console.error('Error running tailwind:', res.error)
      // fallback below
      writeFallback()
      return
    }
    process.exit(res.status)
  }

  // fallback to npx if local binary not found
  console.log('Local tailwind binary not found; trying npx tailwindcss')
  const npx = isWin ? 'npx.cmd' : 'npx'
  try {
    const res = spawnSync(npx, ['tailwindcss', '-i', 'src/index.css', '-o', 'src/tailwind.generated.css', '--minify'], { stdio: 'inherit' })
    if (res.error || res.status !== 0) {
      console.error('npx tailwindcss failed, falling back')
      writeFallback()
      return
    }
    process.exit(res.status)
  } catch (err) {
    console.error('Exception while running npx tailwindcss:', err)
    writeFallback()
    return
  }
}

function writeFallback(){
  try{
    const out = "/* tailwind.generated.css - fallback created by scripts/build-css.js */\n@import './fallback.css';\n"
    const outPath = path.join(__dirname, '..', 'src', 'tailwind.generated.css')
    fs.writeFileSync(outPath, out, 'utf8')
    console.log('Wrote fallback', outPath)
    process.exit(0)
  }catch(e){
    console.error('Failed to write fallback tailwind.generated.css', e)
    process.exit(0)
  }
}

runTailwind()
