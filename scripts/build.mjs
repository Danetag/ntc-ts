import { execFileSync } from 'node:child_process'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { rollup } from 'rollup'

import rollupConfiguration from '../rollup.config.mjs'

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDirectory = path.join(rootDirectory, 'dist')
const typescriptCompiler = fileURLToPath(import.meta.resolve('typescript/bin/tsc'))

await rm(distDirectory, { recursive: true, force: true })

const { output: outputConfigurations, ...inputConfiguration } = rollupConfiguration
const bundle = await rollup(inputConfiguration)
try {
  for (const output of outputConfigurations) {
    await bundle.write(output)
  }
} finally {
  await bundle.close()
}

execFileSync(
  process.execPath,
  [typescriptCompiler, '--project', path.join(rootDirectory, 'tsconfig.build.json')],
  { cwd: rootDirectory, stdio: 'inherit' }
)
