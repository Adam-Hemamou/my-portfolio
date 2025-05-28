/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';

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
      ssr: false,
      static: true,
      prerender: {
        routes: [
          '/',
          '/about',
          '/contact',
          '/project',
          '/project/id',
          '/not-found',
        ],
      },
    }),
  ],
}));
