import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // JS 진입점
        content: resolve(__dirname, 'src/content.js'),
        controller: resolve(__dirname, 'src/controller.js'),
        // HTML 진입점
        ui: resolve(__dirname, 'src/popup.html')
      },
      output: {
        entryFileNames: '[name].js'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public' // manifest.json, icons/ 등 복사됨
});
