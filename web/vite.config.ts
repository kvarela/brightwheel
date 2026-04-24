import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@brightwheel/shared': path.resolve(__dirname, '../packages/shared/src'),
    },
  },
  optimizeDeps: {
    include: ['@brightwheel/shared'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
