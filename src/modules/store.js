import store from 'store'
import expirePlugin from 'store/plugins/expire'
const plugin = () => {
  return {
    /**
     * expire in seconds
     */
    setx: (fn, key, val, expiration) => {
      store.set(key, val, new Date().getTime() + expiration * 1000)
      return fn()
    }
  }
}

export const install = (app) => {
  store.addPlugin(plugin)
  store.addPlugin(expirePlugin)
  app.config.globalProperties.$store = store
}

export default store
