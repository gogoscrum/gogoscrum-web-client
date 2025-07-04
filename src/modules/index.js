import { install as emitter } from '/src/modules/emitter.js'
import { install as elementPlus } from '/src/modules/element-plus.js'
import { install as i18n } from '/src/modules/i18n.js'
import { install as router } from '/src/modules/router.js'
import { install as store } from '/src/modules/store.js'

const modules = [emitter, elementPlus, i18n, router, store]

export const createModule = (app) => {
  const install = () => {
    modules.forEach((install) => install?.(app))
  }
  return {
    install
  }
}
