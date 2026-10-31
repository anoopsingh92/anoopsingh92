// vite.config.js
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import injectHTML from 'vite-plugin-html-inject';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.BASE_PATH || './';

  return {
    base: basePath,
    plugins: [injectHTML()],

    // --- Add server configuration here ---
    server: {
      host: 'localhost',
      port: 5173,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
      },
    },

    build: {
      outDir: 'dist',
      target: 'es2020',
      assetsDir: 'assets',
      cssCodeSplit: false,
      sourcemap: false,
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname, 'index.html'),
          about: resolve(import.meta.dirname, 'about/index.html'),
          notfound: resolve(import.meta.dirname, '404.html'),
        },
        output: {
          entryFileNames: 'assets/bundle.min.js',
          chunkFileNames: 'assets/[name].min.js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'assets/bundle.min.css';
            }
            return 'assets/[name].[ext]';
          },
        },
      },
    },
  };
});