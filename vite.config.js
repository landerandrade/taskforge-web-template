import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O front roda na porta 5173 (a mesma que a gente liberou no CORS do back-end).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,     // abre o navegador sozinho quando você roda "npm run dev"
  },
})
