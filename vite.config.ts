import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Betöltjük a környezeti változókat (pl. .env fájlból vagy Vercel-ről)
  // A harmadik paraméter '' (üres string), hogy a nem VITE_ prefixű változókat is elérjük (pl. API_KEY)
  // Fix: Cast process to any to avoid TypeScript error: Property 'cwd' does not exist on type 'Process'.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Így a kódodban a process.env.API_KEY a Vercel-en beállított érték lesz,
      // vagy ha nincs beállítva, akkor üres marad (vagy ideiglenesen beírhatod fejlesztéshez, de ne commitold!)
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ""),
    },
  }
})