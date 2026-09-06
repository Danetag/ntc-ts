import { execFileSync } from 'node:child_process'
import console from 'node:console'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process, { execPath } from 'node:process'
import { fileURLToPath } from 'node:url'

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'ntc-ts-runtime-'))
const consumerDirectory = path.join(temporaryDirectory, 'consumer')

function run (executable, args) {
  execFileSync(executable, args, {
    cwd: consumerDirectory,
    encoding: 'utf8',
    stdio: 'inherit'
  })
}

try {
  const packOutput = execFileSync(
    'npm',
    ['pack', '--json', '--pack-destination', temporaryDirectory],
    { cwd: rootDirectory, encoding: 'utf8' }
  )
  const [{ filename }] = JSON.parse(packOutput)

  await mkdir(consumerDirectory)
  await writeFile(path.join(consumerDirectory, 'package.json'), '{"private":true,"type":"module"}\n')
  run('npm', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--no-package-lock',
    path.join(temporaryDirectory, filename)
  ])

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

  console.log(`Packed package passed ESM and CommonJS runtime checks on Node ${process.version}.`)
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}
