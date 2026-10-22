// Vite settings
import { defineConfig } from 'vite'

export default defineConfig({
    base: '/weather-pwa/',

    server: {
        port: 5191,
        strictPort: true,
    },

    preview: {
        port: 4191,
        strictPort: true,
    },
})