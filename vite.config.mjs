import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import UnoCSS from 'unocss/vite'
import serveStatic from 'serve-static'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

function formatVersion(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) + pad(date.getHours()) + pad(date.getMinutes())
  )
}

const APP_VERSION = process.env.APP_VERSION || formatVersion()

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    define: {
      __APP_VERSION__: JSON.stringify(APP_VERSION)
    },
    plugins: [
      vue(),
      UnoCSS(),
      {
        name: 'local-file-storage',
        configureServer(server) {
          server.middlewares.use(
            '/lfs', // Your target URL path
            serveStatic(env.VITE_FILE_PATH, {
              // Your local folder path
              index: false // Disable directory listing
            })
          )
        }
      },
      {
        name: 'generate-version-json',
        apply: 'build',
        closeBundle() {
          const content = JSON.stringify({
            version: APP_VERSION,
            buildTime: new Date().toISOString()
          })
          writeFileSync(resolve(__dirname, 'dist/version.json'), content, 'utf-8')
        }
      }
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      https: false,
      port: 8081,
      allowedHosts: ['3l24029h12.zicp.fun'],
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/ws': {
          target: 'ws://localhost:8080/websocket',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/ws/, '')
        }
      }
    },
    build: {
      target: 'es2015',
      cssTarget: 'chrome78'
    }
  }
})
