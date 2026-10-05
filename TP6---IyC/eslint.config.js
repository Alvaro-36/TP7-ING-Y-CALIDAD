import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'frontend/dist/**', 'cypress/screenshots/**', 'cypress/videos/**'],
  },
  js.configs.recommended,
  {
    // Configuracion base: modulos ES
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Se permite catch vacio como fallback intencional (ver cargarReservas en frontend/app.js)
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // Frontend: corre en el navegador
    files: ['frontend/**/*.js', 'src/**/*.js'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    // Archivos de configuracion: corren en Node
    files: ['*.config.js', 'vitest.jest-shim.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Tests unitarios (Jest / Vitest con globals)
    files: ['tests/**/*.js', 'src/**/*.{test,spec}.js'],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
  {
    // Tests E2E de Cypress (Mocha + Chai + cy)
    files: ['cypress/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.mocha,
        cy: 'readonly',
        Cypress: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
      },
    },
  },
]
