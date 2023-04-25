import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://host.docker.internal:3001'
      },
      '/static': {
        target: 'http://host.docker.internal:3001'
      },
      '/socket.io': {
        target: 'http://host.docker.internal:3001',
        ws: true,
      },
    }
  },
})
