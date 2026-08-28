import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Tauri sets TAURI_ENV_PLATFORM during `tauri dev`/`tauri build`; the desktop
// bundle serves assets from its own root, not the GitHub Pages subpath.
const isTauri = !!process.env.TAURI_ENV_PLATFORM;

export default defineConfig(({ command }) => ({
  // Hosted at https://earth1283.github.io/french-website/ — assets need the
  // subpath in production builds; dev server and the Tauri bundle stay at /
  base: command === 'build' && !isTauri ? '/french-website/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Tauri needs a fixed, predictable dev server port to point its webview at.
  clearScreen: false,
  server: {
    allowedHosts: ['mc5.leapmotorintl.com'],
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/framer-motion')) return 'motion';
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/zustand')) return 'ui';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts';
        },
      },
    },
  },
}))
