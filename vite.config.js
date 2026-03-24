import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // מעדכן את האפליקציה אוטומטית כשיש גרסה חדשה
      manifest: {
        name: 'משפחה במשימה',
        short_name: 'משפחה במשימה',
        description: 'אפליקציית ניהול משימות למשפחה',
        theme_color: '#ffffff', // צבע הרקע העליון של האפליקציה
        background_color: '#ffffff',
        display: 'standalone', // גורם לזה להיראות כמו אפליקציה אמיתית בלי שורת הכתובת
        icons: [
          {
            src: 'pwa-192x192.png', // השם של הקובץ ששמת בתיקיית public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // השם של הקובץ ששמת בתיקיית public
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/mishpacha-supabase/' // חשוב להשאיר את זה בשביל GitHub Pages!
})