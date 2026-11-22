import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// SSR bundle used only by `scripts/prerender.mjs` to produce static HTML.
// The public base must match the client build so asset URLs are identical
// in the prerendered markup and after hydration.
export default defineConfig(() => {
  const publicBase = process.env.FIGMA_PUBLIC_URL ? `${process.env.FIGMA_PUBLIC_URL}/` : '/'

  return {
    base: publicBase,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: 'dist-ssr',
      emptyOutDir: true,
      minify: false,
      target: 'node20',
    },
    plugins: [react()],
  }
})
