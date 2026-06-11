import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  // Hosted at https://earth1283.github.io/french-website/ — assets need the
  // subpath in production builds; dev server stays at /
  base: command === 'build' ? '/french-website/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: ['mc3.leapmotorintl.com'],
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
        },
      },
    },
  },
}))
