import { nodeResolve } from '@rollup/plugin-node-resolve';
import { visualizer } from 'rollup-plugin-visualizer';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  input: 'index.js',
  output: {
    file: 'bundle.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    sourcemaps(),
    visualizer({
      open: true,
      sourcemap: true,
    })
  ]
};