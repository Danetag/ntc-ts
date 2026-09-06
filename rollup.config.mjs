import typescript from '@rollup/plugin-typescript'

const output = (file, format, name) => ({
  file,
  format,
  name,
  sourcemap: true,
  exports: 'named'
})

export default {
  input: 'src/index.ts',
  plugins: [
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: false,
      sourceMap: true
    })
  ],
  output: [
    output('dist/ntc-ts.js', 'es'),
    output('dist/ntc-ts.module.js', 'es'),
    output('dist/ntc-ts.cjs', 'cjs'),
    output('dist/ntc-ts.umd.js', 'iife', 'ntcTs')
  ]
}
