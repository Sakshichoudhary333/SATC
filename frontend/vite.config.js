import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'maps',
              test: /[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/,
              priority: 20,
            },
            {
              name: 'socket',
              test: /[\\/]node_modules[\\/]socket.io-client[\\/]/,
              priority: 20,
            },
            {
              name: 'icons',
              test: /[\\/]node_modules[\\/]react-icons[\\/]/,
              priority: 20,
            },
          ],
        },
      },
    },
  },
})
