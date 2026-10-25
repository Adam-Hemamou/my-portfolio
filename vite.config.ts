/// <reference types="vitest" />

import { defineConfig, type Plugin } from 'vite';
import analog from '@analogjs/platform';

// Page 404 servie par l'hébergeur avec le vrai code HTTP 404 : copie de
// l'index.html final (mêmes scripts et styles). Angular y démarre et le
// routeur affiche la page « introuvable » pour l'URL demandée.
function notFoundPage(): Plugin {
  return {
    name: 'portfolio:404-page',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const index = bundle['index.html'];
      if (index?.type !== 'asset') return;
      this.emitFile({
        type: 'asset',
        fileName: '404.html',
        source: index.source,
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    analog({
      vite: {
        inlineStylesExtension: 'scss',
      },
      static: true,
      ssr: false,
      prerender: {
        routes: async () => [
          '/',
          '/about',
          '/contact',
          '/project',
          '/project/ondeo',
          '/project/ecoscan',
          '/project/wow-game',
          '/project/babyplace',
          '/project/elegance',
          '/project/green-point',
        ],
        sitemap: {
          host: 'https://www.adamh-dev.com',
        },
      },
    }),
    notFoundPage(),
  ],
}));
