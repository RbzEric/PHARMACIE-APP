import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// 🔥 detect raha Electron
const isElectron = process.env.ELECTRON === "true";

export default defineConfig({
  base: "./",

  plugins: [
    react(),

    // 🔥 PWA mandeha raha TSY Electron
    !isElectron &&
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
          start_url: './',
          icons: [
            {
              src: './icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: './icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        }
      })
  ].filter(Boolean), // 🔥 manala false

  build: {
    outDir: "dist"
  }
})