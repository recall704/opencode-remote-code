// Prepares the intermediate `tsc` output that `scripts/bundle.mjs` consumes.
//
// This runs against the staging tree (`.build/`), never against `dist/`: the
// bundler reads `.build/`, emits `dist/plugins/remote-code.js`, and then deletes
// `.build/`, so `dist/` only ever holds the single-file plugin.
const fs = require('fs')
const path = require('path')

const buildDir = path.join(__dirname, '..', '.build')

// The tool modules import their types from "@opencode-ai/plugin", which is a
// peer dependency resolved by OpenCode at runtime and never installed here.
// tsc maps it to the local shim via `paths` for type-checking, but the emit
// keeps the bare specifier — rewrite it to the relative shim so the bundler
// can resolve it.
const toolsDir = path.join(buildDir, 'tools')
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js'))

for (const file of files) {
  const filePath = path.join(toolsDir, file)
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content
  content = content.replace(/from "@opencode-ai\/plugin"/g, 'from "../types/plugin-shim.js"')
  if (content !== original) {
    fs.writeFileSync(filePath, content)
    console.log(`[postbuild] Patched ${file}`)
  }
}

// Copy the prompt .txt files next to their compiled loader. The bundler inlines
// them into the artifact, so this is staging only — nothing here survives into
// `dist/`.
const promptsSrc = path.join(__dirname, '..', 'src', 'prompts')
const promptsDst = path.join(buildDir, 'prompts')
if (fs.existsSync(promptsSrc)) {
  const txtFiles = fs.readdirSync(promptsSrc).filter(f => f.endsWith('.txt'))
  for (const file of txtFiles) {
    fs.copyFileSync(path.join(promptsSrc, file), path.join(promptsDst, file))
  }
  console.log(`[postbuild] Staged ${txtFiles.length} prompt file(s)`)
}

console.log('[postbuild] Done')
