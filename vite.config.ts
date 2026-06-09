import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'node:child_process'

// Latest annotated/lightweight git tag at build time, e.g. "v1.1.0".
// Falls back to commit short SHA, then "dev" if neither is available
// (e.g. building outside a git checkout).
function gitVersion(): string {
  try {
    return execSync('git describe --tags --always --dirty', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim() || 'dev'
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
    __APP_VERSION__: JSON.stringify(gitVersion()),
    __APP_COMMIT__:  JSON.stringify(gitCommit()),
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
