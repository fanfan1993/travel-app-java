import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 前端 5174，/api 代理到 8080（Mock 或 Java 后端，二选一）
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
