import { execFileSync } from 'node:child_process'
import console from 'node:console'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execPath, stderr } from 'node:process'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'ntc-ts-package-'))
const consumerDirectory = path.join(temporaryDirectory, 'consumer')

function run (executable, args, options = {}) {
  try {
    return execFileSync(executable, args, {
      cwd: consumerDirectory,
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    })
  } catch (error) {
    if (error.stdout) stderr.write(error.stdout)
    if (error.stderr) stderr.write(error.stderr)
    throw error
  }
}

try {
  const packOutput = execFileSync(
    'npm',
    ['pack', '--json', '--pack-destination', temporaryDirectory],
    { cwd: rootDirectory, encoding: 'utf8' }
  )
  const [{ filename }] = JSON.parse(packOutput)
  const tarballPath = path.join(temporaryDirectory, filename)

  await writeFile(path.join(temporaryDirectory, 'package.json'), '{}\n')
  await writeFile(path.join(temporaryDirectory, '.npmrc'), 'fund=false\naudit=false\n')
  await mkdir(consumerDirectory)
  await writeFile(path.join(consumerDirectory, 'package.json'), '{"private":true,"type":"module"}\n')
  run('npm', ['install', '--ignore-scripts', '--no-package-lock', tarballPath])

  await writeFile(path.join(consumerDirectory, 'esm.mjs'), `
import { MINIMAL_COLORS, getColorName, initColors } from 'ntc-ts'
initColors(MINIMAL_COLORS)
if (getColorName('#ff0000').name !== 'Red') throw new Error('ESM import returned an unexpected result')
`)
  run(execPath, ['esm.mjs'])

  await writeFile(path.join(consumerDirectory, 'commonjs.cjs'), `
const { MINIMAL_COLORS, getColorName, initColors } = require('ntc-ts')
initColors(MINIMAL_COLORS)
if (getColorName('#ff0000').name !== 'Red') throw new Error('CommonJS require returned an unexpected result')
`)
  run(execPath, ['commonjs.cjs'])

  const iifeSource = await readFile(
    path.join(consumerDirectory, 'node_modules', 'ntc-ts', 'dist', 'ntc-ts.umd.js'),
    'utf8'
  )
  const browserContext = {}
  vm.runInNewContext(iifeSource, browserContext, { filename: 'ntc-ts.umd.js' })
  browserContext.ntcTs.initColors(browserContext.ntcTs.MINIMAL_COLORS)
  if (browserContext.ntcTs.getColorName('#ff0000').name !== 'Red') {
    throw new Error('Browser IIFE global returned an unexpected result')
  }

  await writeFile(path.join(consumerDirectory, 'consumer.ts'), `
import { getColorName, initColors, MINIMAL_COLORS } from 'ntc-ts'
import type { COLOR, FORMATTED_COLOR } from 'ntc-ts'
const palette: COLOR[] = MINIMAL_COLORS
initColors(palette)
const result: FORMATTED_COLOR = getColorName('#ff0000')
void result
`)
  await writeFile(path.join(consumerDirectory, 'tsconfig.json'), `${JSON.stringify({
    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      noEmit: true,
      strict: true,
      target: 'ES2022'
    },
    files: ['consumer.ts']
  }, null, 2)}\n`)
  run(execPath, [
    path.join(rootDirectory, 'node_modules', 'typescript', 'bin', 'tsc'),
    '--project',
    'tsconfig.json'
  ])

  console.log('Packed package passed ESM, CommonJS, browser IIFE, and TypeScript consumer checks.')
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}
