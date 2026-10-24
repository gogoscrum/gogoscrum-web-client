import { createApp } from 'vue'
import { createModule } from './modules'
import App from './App.vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/dark.less'

import 'virtual:uno.css'
import './styles/index.less'

const app = createApp(App)
createModule(app).install()

app.mount('#gogoscrum-app')

// Handle Vite preload errors (usually caused by network issues or after a new deployment) and reload the page if necessary
window.addEventListener('vite:preloadError', (event) => {
  console.error('Vite preload error detected:', event)
  event.preventDefault()

  const KEY = 'vite_preload_reloaded'
  if (!sessionStorage.getItem(KEY)) {
    sessionStorage.setItem(KEY, '1')
    window.location.reload()
  } else {
    sessionStorage.removeItem(KEY)
    console.error('Failed to preload resources, please check your network or contact the administrator.')
  }
})
