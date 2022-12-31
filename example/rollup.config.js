import { nodeResolve } from '@rollup/plugin-node-resolve';
// import { visualizer } from 'rollup-plugin-visualizer';
import ts from "rollup-plugin-ts";

export default {
  input: './src/index.ts',
  output: {
    file: 'bundle.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    ts(),
    // visualizer({
    //   open: true,
    //   sourcemap: true,
    // })
  ]
};