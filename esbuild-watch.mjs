import { context } from 'esbuild'

export default context({
  bundle: true,
  entryPoints: ['src/extension.ts'],
  external: ['vscode'],
  packages: 'bundle',
  minify: true,
  format: 'esm',
  outfile: 'dist/extension.js',
  platform: 'node',
  logLevel: 'debug',
}).then((c) => c.watch())
