import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['github-actions'],
    projects: [{
      extends: true,
      test: {
        name: 'fixtures',
        dir: './fixtures',
      },
    }],
  },
})
