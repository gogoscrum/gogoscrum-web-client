import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

export const install = (app) => {
  app.use(ElementPlus)
  Object.entries(ElementPlusIconsVue).forEach(([key, component]) => {
    app.component(key, component)
  })
}
