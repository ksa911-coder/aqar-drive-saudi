import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    tsconfigPaths(),
  ],
})