import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow connections from external hosts
    port: 5173, // Ensure the port matches the WebSocket connection
    strictPort: true, // Fail if the port is already in use
  },
});
