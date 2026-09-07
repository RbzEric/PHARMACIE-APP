import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron'

  return {
    base: isElectron ? './' : '/PHARMACIE-APP/',

    plugins: [
      react(),

      VitePWA({
        registerType: 'autoUpdate',

        includeAssets: [
          'icon-192.png',
          'icon-512.png'
        ],

        manifest: {
          name: 'Pharmacie App',
          short_name: 'Pharma',
          description: 'Gestion pharmacie offline',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',

          start_url: isElectron ? './' : '/PHARMACIE-APP/',
          scope: isElectron ? './' : '/PHARMACIE-APP/',

          icons: [
            {
              src: isElectron
                ? './icon-192.png'
                : '/PHARMACIE-APP/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: isElectron
                ? './icon-512.png'
                : '/PHARMACIE-APP/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },

        workbox: {
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,wasm}'
          ]
        }
      })
    ],

    build: {
      outDir: 'dist'
    }
  }
})