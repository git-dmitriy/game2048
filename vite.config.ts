import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            registerType: 'prompt',
            includeAssets: [
                'favicon.ico',
                'apple-touch-icon.png',
                'icon.svg',
                'icon-maskable.svg',
                'pwa-maskable-512x512.png',
                'screenshots/mobile.png',
                'screenshots/wide.png',
            ],
            manifest: {
                name: '2048',
                short_name: '2048',
                description: 'Classic 2048 puzzle game',
                theme_color: '#bbada0',
                background_color: '#faf8ef',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-maskable-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                screenshots: [
                    {
                        src: 'screenshots/mobile.png',
                        sizes: '764x1358',
                        type: 'image/png',
                        form_factor: 'narrow',
                    },
                    {
                        src: 'screenshots/wide.png',
                        sizes: '2560x1440',
                        type: 'image/png',
                        form_factor: 'wide',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
                navigateFallback: 'index.html',
                cleanupOutdatedCaches: true,
            },
            devOptions: {
                // SW в dev создаёт ложные «обновления» на каждый перезапуск Vite;
                // проверять prompt обновления — через `npm run preview`.
                enabled: false,
            },
        }),
    ],
})
