import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      'ntc-ts': 'src/index.ts',
      'ntc-ts.module': 'src/index.ts'
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    splitting: false,
    clean: true,
    outDir: 'dist'
  },
  {
    entry: {
      'ntc-ts': 'src/index.ts'
    },
    format: ['cjs'],
    dts: true,
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
])
