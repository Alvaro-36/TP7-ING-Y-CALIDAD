import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Los tests unitarios estan escritos para Jest y se mantienen tal cual.
// Esta configuracion permite que Vitest los ejecute sin modificarlos:
// - globals: describe/test/it/expect/beforeEach/... sin importarlos.
// - alias de '@jest/globals' a un shim que expone `jest` sobre la API `vi`.
export default defineConfig({
  resolve: {
    alias: {
      '@jest/globals': fileURLToPath(new URL('./vitest.jest-shim.js', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.js', 'src/**/*.{test,spec}.js'],
  },
})
