import { rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'tsup'

import { buildConfigurations } from '../tsup.config.mjs'

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// Clean once, then build each format in order so parallel tsup configs cannot
// delete or overwrite one another's output.
await rm(path.join(rootDirectory, 'dist'), { recursive: true, force: true })

for (const buildConfiguration of buildConfigurations) {
  // Avoid loading the config file again when using tsup's programmatic API.
  await build({ ...buildConfiguration, config: false })
}
