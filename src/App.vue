<template>
  <el-config-provider :locale="langs[locale]">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { nextTick, onMounted, provide, ref } from 'vue'
import { ElConfigProvider } from 'element-plus'
import cn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import emitter from 'tiny-emitter/instance'
import util from '@/utils/util.js'
import { userApi } from './api/user'

const isRouterAlive = ref(true)
const reload = () => {
  isRouterAlive.value = false
  nextTick(() => {
    isRouterAlive.value = true
  })
}
provide('reload', () => reload())

const langs = { cn, en }
const locale = ref(localStorage['locale'] || util.getLang())

onMounted(() => {
  emitter.on('languageChanged', () => {
    locale.value = localStorage['locale'] || util.getLang()
    setHtmlLang()
  })

  // Initialize the csrf token for login and registration
  userApi.csrf()
})

const setHtmlLang = (): void => {
  let html = document.documentElement

  if (locale.value == 'cn') {
    html.setAttribute('lang', 'zh-CN')
  } else {
    html.setAttribute('lang', 'en')
  }
}
</script>
