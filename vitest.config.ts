import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    clearMocks: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/games/memory/game/engine.ts',
        'src/games/memory/game/useGame.ts',
        'src/games/memory/assets/decks/decks.ts',
        'src/games/memory/components/GameOver.tsx',
        'src/games/memory/components/GameHeader.tsx',
        'src/games/memory/components/Settings.tsx',
      ],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
})
