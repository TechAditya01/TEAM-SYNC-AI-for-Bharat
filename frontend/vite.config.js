import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'firebase/app': path.resolve(__dirname, 'src/mocks/firebase/app.js'),
      'firebase/database': path.resolve(__dirname, 'src/mocks/firebase/database.js'),
      'framer-motion': path.resolve(__dirname, 'src/mocks/framer-motion.js'),
      '@react-google-maps/api': path.resolve(__dirname, 'src/mocks/react-google-maps-api.js'),
      recharts: path.resolve(__dirname, 'src/mocks/recharts.js'),
    },
  },
  plugins: [react(),
  tailwindcss()

  ],
})
