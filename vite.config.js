// vite.config.js
import fs from 'fs';
import { resolve } from 'node:path';
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

      const cleanUrl = req.url.replace(/^\/ask/, '').replace(/\/$/, '');

      // Registered valid routes in your MPA
      const validPaths = [
        '',
        '/about',
        '/products',
        '/products/flexi-style',
        '/products/flexistyle-bootstrap',
        '/products/flexistyle-bootstrap-scss',
        '/products/flexistyle-dxp',
        '/products/workpulse', // Added valid route
      ];

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
          products: resolve(import.meta.dirname, 'products/index.html'),
          productFlexiStyle: resolve(import.meta.dirname, 'products/flexi-style/index.html'),
          productBootstrap: resolve(import.meta.dirname, 'products/flexistyle-bootstrap/index.html'),
          productBootstrapScss: resolve(import.meta.dirname, 'products/flexistyle-bootstrap-scss/index.html'),
          productDxp: resolve(import.meta.dirname, 'products/flexistyle-dxp/index.html'),
          workpulse: resolve(import.meta.dirname, 'products/workpulse/index.html'),
        },
        output: {
          entryFileNames: 'assets/[name].min.js',
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