import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import console from 'node:console'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'ntc-ts-smoke-'))
const expectedDistFiles = [
  'colors/minimal.d.ts',
  'colors/original.d.ts',
  'index.d.ts',
  'ntc-ts.cjs',
  'ntc-ts.cjs.map',
  'ntc-ts.d.cts',
  'ntc-ts.d.ts',
  'ntc-ts.js',
  'ntc-ts.js.map',
  'ntc-ts.modern.js',
  'ntc-ts.modern.js.map',
  'ntc-ts.module.d.ts',
  'ntc-ts.module.js',
  'ntc-ts.module.js.map',
  'ntc-ts.umd.js',
  'ntc-ts.umd.js.map',
  'ntc.d.ts',
  'types.d.ts'
]

try {
  const packageMetadata = JSON.parse(await readFile(path.join(rootDirectory, 'package.json'), 'utf8'))
  assert.equal(packageMetadata.exports['.'].import.default, './dist/ntc-ts.module.js')
  assert.equal(packageMetadata.exports['.'].require.default, './dist/ntc-ts.cjs')
  assert.equal(packageMetadata.exports['.'].import.types, './dist/ntc-ts.d.ts')
  assert.equal(packageMetadata.exports['.'].require.types, './dist/ntc-ts.d.cts')
  assert.equal(packageMetadata.unpkg, './dist/ntc-ts.umd.js')

  const packResult = JSON.parse(execFileSync(
    'npm',
    ['pack', '--json', '--pack-destination', temporaryDirectory],
    { cwd: rootDirectory, encoding: 'utf8' }
  ))[0]
  const packagedFiles = new Set(packResult.files.map(({ path: filePath }) => filePath))
  for (const fileName of expectedDistFiles) {
    assert(packagedFiles.has(`dist/${fileName}`), `package is missing dist/${fileName}`)
  }

  const tarball = path.join(temporaryDirectory, packResult.filename)
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], {
    cwd: temporaryDirectory,
    stdio: 'inherit'
  })

  await writeFile(path.join(temporaryDirectory, 'esm.mjs'), [
    "import { getColorName, MINIMAL_COLORS } from 'ntc-ts'",
    "if (getColorName('#000').name !== 'Black' || MINIMAL_COLORS.length === 0) process.exit(1)",
    ''
  ].join('\n'))
  await writeFile(path.join(temporaryDirectory, 'cjs.cjs'), [
    "const { getColorName, MINIMAL_COLORS } = require('ntc-ts')",
    "if (getColorName('#000').name !== 'Black' || MINIMAL_COLORS.length === 0) process.exit(1)",
    ''
  ].join('\n'))
  execFileSync(process.execPath, ['esm.mjs'], { cwd: temporaryDirectory, stdio: 'inherit' })
  execFileSync(process.execPath, ['cjs.cjs'], { cwd: temporaryDirectory, stdio: 'inherit' })

  const umdSource = await readFile(
    path.join(temporaryDirectory, 'node_modules/ntc-ts/dist/ntc-ts.umd.js'),
    'utf8'
  )
  const { runInNewContext } = await import('node:vm')
  const browserContext = {}
  runInNewContext(umdSource, browserContext)
  assert.equal(browserContext.ntcTs.getColorName('#000').name, 'Black')

  await writeFile(path.join(temporaryDirectory, 'consumer.mts'), [
    "import { getColorName, type COLOR } from 'ntc-ts'",
    "const palette: COLOR[] = [['000000', 'Black']]",
    'getColorName(palette[0][0])',
    ''
  ].join('\n'))
  await writeFile(path.join(temporaryDirectory, 'consumer.cts'), [
    "import { getColorName, type COLOR } from 'ntc-ts'",
    "const palette: COLOR[] = [['000000', 'Black']]",
    'getColorName(palette[0][0])',
    ''
  ].join('\n'))
  await writeFile(path.join(temporaryDirectory, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      noEmit: true,
      strict: true,
      target: 'ES2020'
    },
    files: ['consumer.mts', 'consumer.cts']
  }))
  const typescriptCompiler = fileURLToPath(import.meta.resolve('typescript/bin/tsc'))
  execFileSync(process.execPath, [typescriptCompiler, '--project', 'tsconfig.json'], {
    cwd: temporaryDirectory,
    stdio: 'inherit'
  })

  for (const fileName of expectedDistFiles.filter(fileName => fileName.endsWith('.map'))) {
    const sourceMap = JSON.parse(await readFile(path.join(rootDirectory, 'dist', fileName), 'utf8'))
    assert.equal(sourceMap.file, fileName.slice(0, -4))
    assert(sourceMap.sources.length > 0, `${fileName} has no sources`)
  }

  console.log('Package smoke checks passed (ESM, CJS, browser global, files, maps, and types).')
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}
