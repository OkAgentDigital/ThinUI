import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  root: 'ui',  // Set the root directory to 'ui'
  build: {
    outDir: '../dist',  // Output to parent dist directory
    emptyOutDir: true,
  },
  server: {
    port: 4687,
    strictPort: true,
  },
})