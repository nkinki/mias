import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Betöltjük a környezeti változókat (pl. .env fájlból vagy Vercel-ről)
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Biztosítjuk, hogy a `process` objektum létezzen, hogy ne dobjon hibát, ha valami hivatkozik rá.
      'process.env': {},
      // Specifikus változók injektálása
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ""),
      'process.env.APP_PASSWORD': JSON.stringify(env.APP_PASSWORD || "admin"),
    },
  }
})