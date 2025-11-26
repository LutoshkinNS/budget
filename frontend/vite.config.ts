import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        babel: {
          plugins: [
            [
              "babel-plugin-react-compiler",
              {
                logger: {
                  // @ts-ignore
                  logEvent(filename, event) {
                    switch (event.kind) {
                      case "CompileSuccess": {
                        console.log(`✅ Compiled: ${filename}`);
                        break;
                      }
                      case "CompileError": {
                        console.log(`❌ Skipped: ${filename}`);
                        break;
                      }
                      default: {
                      }
                    }
                  },
                },
              },
            ],
          ],
        },
      }),
    ],
    server: {
      cors: false,
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
