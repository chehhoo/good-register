import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

function pkgVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
    return pkg.version ?? 'dev'
  } catch {
    return 'dev'
  }
}

function gitCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim() || ''
  } catch {
    return ''
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__:  JSON.stringify(pkgVersion()),
    __APP_COMMIT__:   JSON.stringify(gitCommit()),
    __APP_BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      }
    }
  }
})
