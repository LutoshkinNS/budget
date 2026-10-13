import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
    // Интеграционные тесты применяют миграции к временной SQLite.
    hookTimeout: 30_000
  }
});
