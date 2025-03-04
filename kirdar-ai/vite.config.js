import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    cors: true,
    hmr: {
      // Removing clientPort so it uses the same port as the server
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'ec2-52-1-240-73.compute-1.amazonaws.com',
      '52.1.240.73'
    ]
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  }
})
