import { resolve } from 'node:path'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'es2023',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' }
  },
  esbuildOptions(options) {
    options.alias = {
      ...options.alias,
      '@xeno-js/sentry-vue': resolve(import.meta.dirname, 'src'),
    }
  },
  external: [
    '@sentry/vue',
    '@xeno-js/core',
    '@xeno-js/shared',
    'vue-router'
  ],
})