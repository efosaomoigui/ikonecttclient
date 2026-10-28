import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [{name: 'local-shared-assets', configureServer(server) {
      const directory = path.resolve(__dirname, '../assets');
      server.middlewares.use('/assets/', (request, response, next) => {
        let file: string;
        try { file = path.resolve(directory, '.' + decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname)); }
        catch { next(); return; }
        if (!file.startsWith(directory + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { next(); return; }
        const types: Record<string,string> = {'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.json':'application/json'};
        response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
        fs.createReadStream(file).on('error', next).pipe(response);
      });
    }}, react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Shared modules reference the project's logos, fonts and photo library.
      fs: {allow: [path.resolve(__dirname, '..')]},
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
