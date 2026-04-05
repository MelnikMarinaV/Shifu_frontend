import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // конфигурация сервера разработки:
  server: {
    port: 5174, // Порт для фронтенда
    proxy: {
      '/api/': {  // Прокси для запросов к бэкенду
        target: 'http://localhost:8001', // Адрес бэкенда
        changeOrigin: true, 
      }
    }
  } 
})

