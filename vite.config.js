import { defineConfig } from 'vite';

// Plain static site (index.html + styles.css + main.js). No framework/build step
// beyond Vite's dev server and bundler. Root is the project directory.
export default defineConfig({
  root: '.',
  server: {
    // Dedicated port for this project so it won't collide with other local Vite apps.
    port: 5180,
    strictPort: false,
    open: true,
  },
});
