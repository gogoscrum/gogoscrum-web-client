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
