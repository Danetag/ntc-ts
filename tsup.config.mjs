import { defineConfig } from 'tsup'

export const buildConfigurations = [
  {
    entry: {
      'ntc-ts': 'src/index.ts',
      'ntc-ts.module': 'src/index.ts'
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    splitting: false,
    clean: false,
    outDir: 'dist'
  },
  {
    entry: {
      'ntc-ts': 'src/index.ts'
    },
    format: ['cjs'],
    sourcemap: true,
    clean: false,
    outDir: 'dist',
    outExtension: () => ({ js: '.cjs' })
  },
  {
    entry: {
      'ntc-ts.umd': 'src/index.ts'
    },
    format: ['iife'],
    globalName: 'ntcTs',
    sourcemap: true,
    clean: false,
    outDir: 'dist',
    outExtension: () => ({ js: '.js' })
  }
]

export default defineConfig(buildConfigurations)
