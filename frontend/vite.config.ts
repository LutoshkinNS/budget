import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
        routesDirectory: "./src/app/routes",
        generatedRouteTree: "./src/app/routes/routeTree.gen.ts",
      }),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Бюджет",
          short_name: "Бюджет",
          description: "Учёт доходов и расходов",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "/icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          navigateFallback: null,
        },
        devOptions: {
          enabled: true,
        },
      }),
      react({
        babel: {
          plugins: [
            [
              "babel-plugin-react-compiler",
              {
                logger: {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
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
                        /* empty */
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
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      cors: false,
      host: true,
      port: 3001,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL ?? "",
          changeOrigin: true,
          secure: false,
        },
      },
      allowedHosts: [env.VITE_NGROK_DOMAIN ?? ""],
    },
  };
});
