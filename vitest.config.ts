/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'out', '.firebase'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', 'out/', '.firebase/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
