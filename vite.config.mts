import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vitePluginsAutoI18n, { EmptyTranslator } from 'vite-auto-i18n-plugin'

const alias = {
  '@': path.resolve(__dirname, './src'),
  '@renderer': path.resolve(__dirname, './src/renderer'),
  '@ui': path.resolve(__dirname, './src/renderer/components/ui'),
}

const i18nPlugin = vitePluginsAutoI18n({
  deepScan: true,
  globalPath: './lang',
  namespace: 'lang',
  distPath: './dist/assets',
  distKey: 'index',
  targetLangList: ['ja', 'ko', 'ru', 'en', 'fr'],
  originLang: 'zh-cn',
  translator: new EmptyTranslator(),
})

export default defineConfig({
  plugins: [vue(), i18nPlugin],
  root: 'src/renderer',
  base: './',
  
  // Tauri 期望在开发时使用 localhost，在构建时使用相对路径
  server: {
    port: 5173,
    strictPort: true,
  },
  
  // 为 Tauri 配置环境变量
  envPrefix: ['VITE_', 'TAURI_'],
  
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'main': path.resolve(__dirname, 'src/renderer/index.html'),
        'theme-editor': path.resolve(__dirname, 'src/renderer/theme-editor.html'),
      },
    },
    // Tauri 使用 Chromium，可以使用现代特性
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  
  resolve: {
    alias,
  },
  
  // 清除控制台警告
  clearScreen: false,
})
