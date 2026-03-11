import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables so we can read VITE_API_BASE_URL inside config
  const env = loadEnv(mode, process.cwd())
  // Use VITE_PROXY_TARGET for the proxy destination (server-side only).
  // VITE_API_BASE_URL should be left empty so the browser hits the Vite proxy.
  const apiTarget = env.VITE_PROXY_TARGET || env.VITE_API_BASE_URL || 'https://localhost:44377'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 4200,
      // Proxy all /api/* requests → .NET backend
      // This solves two problems in development:
      //   1. CORS — browser sees same origin (localhost:5173), not the .NET host
      //   2. Self-signed certificate — Node.js proxies it, browser never sees the cert
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,  // allow self-signed certs (https://localhost:*)
        },
      },
    },
  }
})
