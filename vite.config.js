import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// base: './' uses relative asset paths — works for both:
//   • GitHub Pages: https://murilotecoteco.github.io/nasa-cme/
//   • Vercel:       https://your-project.vercel.app/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',
})
