import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'node',
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'int',
          include: ['tests/int/**/*.int.spec.ts'],
          globalSetup: ['./tests/int/globalSetup.ts'],
          setupFiles: ['./tests/int/setup.ts'],
          fileParallelism: false,
          testTimeout: 30_000,
          hookTimeout: 300_000,
        },
      },
    ],
  },
})
