import { defineConfig } from 'vite';
import { resolve } from 'path';
import inject from '@rollup/plugin-inject';

export default defineConfig({
  plugins: [
    inject({
      process: 'process/browser'
    })
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        content: resolve(__dirname, 'src/content.js'),
        controller: resolve(__dirname, 'src/controller.js'),
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
