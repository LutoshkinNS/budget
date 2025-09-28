import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {
            logger: {
                // @ts-ignore
                logEvent(filename, event) {
                    switch (event.kind) {
                        case 'CompileSuccess': {
                            console.log(`✅ Compiled: ${filename}`);
                            break;
                        }
                        case 'CompileError': {
                            console.log(`❌ Skipped: ${filename}`);
                            break;
                        }
                        default: {}
                    }
                }
            }
        }]],
      },
    }),
  ],
})
