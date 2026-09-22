import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://10.3.3.200:8080',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://10.3.3.200:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
