import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Plain static multi-page site (index + subpages). No framework/build step
// beyond Vite's dev server and bundler. Root is the project directory.
export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        // index.html is the Plataforma page (site home).
        main: resolve(__dirname, 'index.html'),
        'front-plus': resolve(__dirname, 'front-plus.html'),
        asesoramiento: resolve(__dirname, 'asesoramiento.html'),
        'sobre-nosotros': resolve(__dirname, 'sobre-nosotros.html'),
      },
    },
  },
  server: {
    // Dedicated port for this project so it won't collide with other local Vite apps.
    port: 5180,
    strictPort: false,
    open: true,
  },
});
