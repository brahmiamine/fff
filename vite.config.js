import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Base path matches the GitHub Pages project URL: https://<user>.github.io/fff/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Quiz Arbitrage — CDA District 75',
        short_name: 'Quiz Arbitrage',
        description:
          "Entraînement au test théorique de la CDA — District Parisien de Football, pour les arbitres.",
        start_url: '/fff/',
        scope: '/fff/',
        display: 'standalone',
        background_color: '#0b1e5b',
        theme_color: '#0b1e5b',
        lang: 'fr',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp,svg,ico}'],
      },
    }),
  ],
  base: '/fff/',
})
