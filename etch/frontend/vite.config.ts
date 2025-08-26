import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  define: {
    global: "globalThis",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리들을 별도 청크로 분리
          'react-vendor': ['react', 'react-dom'],
          
          // 라우팅 관련
          'router-vendor': ['react-router'],
          
          // 상태관리 관련
          'state-vendor': ['@reduxjs/toolkit', 'react-redux', 'zustand'],
          
          // FullCalendar 관련 (큰 라이브러리)
          'calendar-vendor': [
            '@fullcalendar/react',
            '@fullcalendar/core',
            '@fullcalendar/daygrid',
            '@fullcalendar/interaction'
          ],
          
          // HTTP 통신 관련
          'http-vendor': ['axios'],
          
          // WebSocket 관련
          'websocket-vendor': ['@stomp/stompjs', 'sockjs-client'],
          
          // 유틸리티 라이브러리들
          'utils-vendor': ['jwt-decode'],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    },
  },
});
