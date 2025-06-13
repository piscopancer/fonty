import { build } from 'esbuild'

export default build({
  bundle: true,
  entryPoints: ['src/extension.ts'],
  external: ['vscode'],
  packages: 'bundle',
  minify: true,
  format: 'esm',
  outfile: 'dist/extension.js',
  platform: 'node',
})
