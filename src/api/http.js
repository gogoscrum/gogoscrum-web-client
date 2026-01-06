import axios from 'axios'
import store from '@/modules/store.js'
import { i18n } from '@/modules/i18n.js'

import { ElMessage } from 'element-plus'

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const user = store.get('user') || {}
    const rememberMe = store.get('loginPageRememberMeFlag') || false
    // if rememberMe is false, refresh the user session time on each request
    if (user.id && !rememberMe) {
      store.setx('user', store.get('user'), 60 * 30) // Session valid for 30 minutes, same as the backend
    }
    return config
  },
  (err) => {
    Promise.reject(err)
  }
)

// Response interceptor
let errorMsg = (response) => {
  let errorMsgKey = ''
  let msg = null

  if (response.data && response.data.code) {
    errorMsgKey = response.data.code
    msg = i18n.global.t(`errorMessages.${errorMsgKey}`)
  }

  if (!msg || msg.startsWith('errorMessages.')) {
    errorMsgKey = response.status || 'defaultErrorMessage'
    msg = i18n.global.t(`errorMessages.${errorMsgKey}`)
  }

  return msg
}

axios.interceptors.response.use(
  (res) => {
    return res
  },
  (err) => {
    console.error('HTTP request error:', err)
    let msgType = null

    if (err?.response?.data && err?.response?.data?.code == 'alreadyInProject') {
      msgType = 'warning'
    } else {
      msgType = 'error'
    }

    let msg = ''

    if (err.code === 'ERR_NETWORK') {
      msg = i18n.global.t('errorMessages.networkError')
    } else if (!err.response) {
      msg = i18n.global.t('errorMessages.defaultErrorMessage')
    } else {
      msg = errorMsg(err.response)
    }

    ElMessage({
      message: msg,
      type: msgType,
      grouping: true
    })

    if (err.response?.status === 401) {
      const lastUrl = window.location.pathname + window.location.search
      localStorage.setItem('lastUrl', lastUrl)
      console.warn('401 returned by request to ' + lastUrl)

      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)

      return Promise.reject(err.response)
    } else {
      return Promise.reject(err.response || err)
    }
  }
)

// Exporting axios methods
const del = axios.delete
const { get, post, put } = axios
export { get, post, put, del }
