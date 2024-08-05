import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/React-Video-Call-App', // Ensure this is correctly set, adjust if necessary
  build: {
    outDir: 'dist',
  },
})
