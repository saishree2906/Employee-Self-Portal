import { defineConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const viteConfig = defineConfig({

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          jspdf:    ['jspdf'],
          vendor:   ['react', 'react-dom', 'react-router-dom'],
          tanstack: ['@tanstack/react-query'],
        },
      },
    },
  },

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tendworks HRMS Portal',
        short_name: 'HRMS Portal',
        description: 'Tendworks Employee Self-Service Portal',
        theme_color: '#2563eb',
        background_color: '#f9fafb',
        display: 'standalone',
        start_url: '/portal/shifts',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/shifts\/my-schedule/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'shift-schedule-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/api\/v1\/notifications/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'notifications-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false, type: 'module' },
    }),
  ],
});

const vitestConfig = defineVitestConfig({
  test: {
    globals:     true,
    environment: 'jsdom',
    setupFiles:  './src/test/setup.ts',
  },
});

export default mergeConfig(viteConfig, vitestConfig);