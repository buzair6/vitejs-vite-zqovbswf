// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ... other config
  // Change base to the root:
  base: "/", // <--- Make sure this is set to "/"
});