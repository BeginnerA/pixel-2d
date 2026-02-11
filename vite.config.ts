import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';

const TimeStamp = new Date().getTime();

export default defineConfig({
    base: './',
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        // minify: 'esbuild',
        // target: 'es2015',
        // cssTarget: 'chrome80',
        // outDir: 'docs',
        reportCompressedSize: false,
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
            output: {
                // 入口文件名
                entryFileNames: `assets/[name]-${TimeStamp}.js`,
                // 块文件名
                chunkFileNames: `assets/[name]-[hash]-${TimeStamp}.js`,
                // 资源文件名 css 图片等等
                assetFileNames: `assets/[name]-[hash]-assets-${TimeStamp}.[ext]`,
            },
        },
    },
    esbuild: {
        pure:["alert", "console.log", "console.warn", "debugger"],
    },
})
