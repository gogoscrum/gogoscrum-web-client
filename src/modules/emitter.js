import emitter from 'tiny-emitter/instance'

const eventBus = {
  $on: (...args) => emitter.on(...args),
  $once: (...args) => emitter.once(...args),
  $off: (...args) => emitter.off(...args),
  $emit: (...args) => emitter.emit(...args)
}

export const install = (app) => {
  app.config.globalProperties.$bus = eventBus
}
