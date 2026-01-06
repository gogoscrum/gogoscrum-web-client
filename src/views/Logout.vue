<template>
  <div></div>
</template>

<script setup>
import { userApi } from '@/api/user'
import { useRouter } from 'vue-router'
import store from '@/modules/store'
import { onMounted } from 'vue'

const router = useRouter()
onMounted(() => {
  userApi.logout().then(() => {
    store.remove('user')
    store.remove('loginPageRememberMeFlag')
    router.push({ name: 'Homepage' })
    document.querySelector('html').classList.remove('dark')

    // Refresh the csrf token for next login or registration
    userApi.csrf()
  })
})
</script>
