import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Optional: Increase limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          three: ['three'],
          drei: ['@react-three/drei'],
          fiber: ['@react-three/fiber'],
          vendor: ['zustand', 'react-router-dom'], // Add more if needed
        },
      },
    },
  },
})
