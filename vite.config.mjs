import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import UnoCSS from 'unocss/vite'
import serveStatic from 'serve-static'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
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
