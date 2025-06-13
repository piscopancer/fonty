import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  const isDev = options.watch
  return isDev
    ? {
        entry: ['src/extension.ts'],
        format: 'esm',
        external: ['vscode'],
        clean: true,
        watch: true,
      }
    : {
        entry: ['src/extension.ts'],
        format: 'esm',
        minify: 'terser',
        target: 'esnext',
        noExternal: ['jsdom'],
        external: ['vscode'],
        clean: true,
      }
})
