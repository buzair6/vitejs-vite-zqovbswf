// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ... keep any other configurations you might have
  base: "/vitejs-vite-zqovbswf/", // <--- Ensure the trailing slash is here
});