// vite.config.js
import { resolve } from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import injectHTML from 'vite-plugin-html-inject';

// Dev server middleware plugin to serve 404.html on broken paths
const dev404Plugin = () => ({
  name: 'dev-404-middleware',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Allow API or Vite internal requests
      if (req.url.startsWith('/@') || req.url.includes('.')) {
        return next();
      }

      // If URL does not match existing pages, serve 404.html
      const cleanUrl = req.url.replace(/^\/ask/, '').replace(/\/$/, '');
      const validPaths = ['', '/about'];

      if (!validPaths.includes(cleanUrl)) {
        const file404 = resolve(import.meta.dirname, '404.html');
        if (fs.existsSync(file404)) {
          let html = fs.readFileSync(file404, 'utf-8');
          server.transformIndexHtml(req.url, html).then(transformed => {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.end(transformed);
          });
          return;
        }
      }
      next();
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.BASE_PATH || './';

  return {
    base: basePath,
    plugins: [injectHTML(), dev404Plugin()],

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