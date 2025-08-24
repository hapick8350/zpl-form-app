import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    // SEO 최적화를 위한 빌드 설정
    rollupOptions: {
      output: {
        // 청크 파일명 최적화
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 소스맵 생성 (개발용)
    sourcemap: false,
    // 청크 크기 경고 임계값
    chunkSizeWarningLimit: 1000
  },
  // 개발 서버 설정
  server: {
    // SEO를 위한 헤더 설정
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  }
})
