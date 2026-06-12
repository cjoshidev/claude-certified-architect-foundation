/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // Scoring logic is pure JS and needs no DOM.
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
