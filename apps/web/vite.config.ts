import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        '@solana-program/system',
        '@solana/kit',
        '@solana/web3.js',
        '@solana/spl-token',
      ],
    },
  },
  optimizeDeps: {
    exclude: [
      '@solana-program/system',
      '@solana/kit',
    ],
  },
})