import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    __API_BASE_URL__: JSON.stringify(""),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    clearMocks: true,
    environment: "jsdom",
    env: {
      VITE_APP_VERSION: "test",
      VITE_TELEGRAM_BOT_NAME: "test_bot",
    },
    restoreMocks: true,
  },
});
