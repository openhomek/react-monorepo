import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5175 },
  build: {
    rollupOptions: {
      input: {
        home: 'index.html',
        community: 'community/index.html',
        'hong-kong-entry-timeline': 'guides/hong-kong-entry-timeline/index.html',
        'hong-kong-rental-checklist': 'guides/hong-kong-rental-checklist/index.html',
        'octopus-mtr-bus-guide': 'guides/octopus-mtr-bus-guide/index.html',
      },
    },
  },
})
