import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react-swc'
import * as path from "node:path";
import legacy from "@vitejs/plugin-legacy"

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  // prevent vite from obscuring rust errors
  clearScreen: false,
  server: {
    // Tauri expects a fixed port, fail if that port is not available
    strictPort: true,
    // if the host Tauri is expecting is set, use it
    host: host || false,
    port: 5173,
  },
  // Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target:
        'chrome105',
    // don't minify for debug builds
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    outDir: "../dist/",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      }
    }
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src')},
  },
  root: "src",
  define: {
    global: {},
  },
  plugins: [
      react(),
      // nodePolyfills(),
      legacy({
        renderLegacyChunks: true,
        modernTargets: ["edge>=109"],
        modernPolyfills: true,
        polyfills: true,
        externalSystemJS: true
      }),
  ]
})
