import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.js.org/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNRESET' || err.code === 'ECONNABORTED') return;
            console.error('API proxy error:', err);
          });
        },
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNRESET' || err.code === 'ECONNABORTED') return;
            console.error('Uploads proxy error:', err);
          });
        },
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNRESET' || err.code === 'ECONNABORTED') return;
            console.error('Socket proxy error:', err);
          });
        },
      },
    },
  },
});
