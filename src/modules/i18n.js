import { createI18n } from 'vue-i18n'
import utils from '@/utils/util.js'

import cnPage from '@/locales/zh-cn/pages.json'
import cnMessage from '@/locales/zh-cn/messages.json'
import cnDict from '@/locales/zh-cn/dict.json'

import enPage from '@/locales/en/pages.json'
import enMessage from '@/locales/en/messages.json'
import enDict from '@/locales/en/dict.json'

const messages = {
  cn: Object.assign(cnDict, cnMessage, cnPage),
  en: Object.assign(enDict, enMessage, enPage)
}
export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || utils.getLang(),
  fallbackLocale: 'en',
  globalThis: true,
  messages
})

export const install = (app) => {
  app.use(i18n)
}
