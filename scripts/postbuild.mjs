import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDirectory = path.join(rootDirectory, 'dist')
const colorsDirectory = path.join(distDirectory, 'colors')

await mkdir(colorsDirectory, { recursive: true })

const moduleFile = path.join(distDirectory, 'ntc-ts.module.js')
const modernFile = path.join(distDirectory, 'ntc-ts.modern.js')
const moduleSource = await readFile(moduleFile, 'utf8')
await writeFile(
  modernFile,
  moduleSource.replace('ntc-ts.module.js.map', 'ntc-ts.modern.js.map')
)

const moduleMap = JSON.parse(await readFile(`${moduleFile}.map`, 'utf8'))
moduleMap.file = 'ntc-ts.modern.js'
await writeFile(`${modernFile}.map`, JSON.stringify(moduleMap))

const declarationShims = {
  'index.d.ts': "export * from './ntc-ts.js'\n",
  'ntc.d.ts': [
    'export {',
    '  cachedColors,',
    '  colors,',
    '  flushCachedColors,',
    '  getColorName,',
    '  initColors,',
    '  NOT_A_COLOR',
    "} from './ntc-ts.js'",
    ''
  ].join('\n'),
  'types.d.ts': "export type { CACHED_COLOR, COLOR, FORMATTED_COLOR } from './ntc-ts.js'\n",
  'colors/minimal.d.ts': "export { MINIMAL_COLORS } from '../ntc-ts.js'\n",
  'colors/original.d.ts': "export { ORIGINAL_COLORS } from '../ntc-ts.js'\n"
}

await Promise.all(Object.entries(declarationShims).map(async ([fileName, contents]) => {
  await writeFile(path.join(distDirectory, fileName), contents)
}))
