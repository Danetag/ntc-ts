import { copyFile, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDirectory = path.join(rootDirectory, 'dist')
const declarationFiles = [
  'colors/minimal.d.ts',
  'colors/original.d.ts',
  'index.d.ts',
  'ntc.d.ts',
  'types.d.ts'
]

await Promise.all(declarationFiles.map(async fileName => {
  const declarationFile = path.join(distDirectory, fileName)
  const declarationSource = await readFile(declarationFile, 'utf8')
  await writeFile(
    declarationFile,
    declarationSource.replace(/(from ['"]\.\.?(?:\/.+?))(?<!\.js)(['"])/g, '$1.js$2')
  )
}))

const indexDeclaration = path.join(distDirectory, 'index.d.ts')
await Promise.all([
  copyFile(indexDeclaration, path.join(distDirectory, 'ntc-ts.d.ts')),
  copyFile(indexDeclaration, path.join(distDirectory, 'ntc-ts.d.cts')),
  copyFile(indexDeclaration, path.join(distDirectory, 'ntc-ts.module.d.ts'))
])

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
