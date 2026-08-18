import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/PHARMACIE-APP/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],

      manifest: {
        name: 'Pharmacie App',
        short_name: 'Pharma',
        description: 'Gestion pharmacie offline',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/PHARMACIE-APP/',

        icons: [
          {
            src: '/PHARMACIE-APP/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/PHARMACIE-APP/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}']
      }
    })
  ],

  build: {
    outDir: 'dist'
  }
})