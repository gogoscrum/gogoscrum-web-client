<template>
  <div v-if="providers.length" class="oauth-logins-container">
    <el-divider content-position="center" class="title">{{ $t('signin.signinwith') }}</el-divider>
    <div class="provider-list">
      <div v-for="provider in providers" :key="provider.name" class="provider-item" @click="startOauth(provider.name)">
        <el-tooltip :content="provider.displayName" placement="bottom">
          <img :src="provider.iconUrl" :alt="provider.displayName" class="provider-icon" />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import { userApi } from '@/api/user'
import utils from '@/utils/util.js'

export default {
  name: 'OauthLogins',
  props: {},
  data() {
    return {
      lang: localStorage['locale'] || utils.getLang(),
      providers: []
    }
  },
  created() {
    this.loadProviders()

    this.$bus.$on('languageChanged', (lang) => {
      this.lang = lang
      this.filterProviders()
    })
  },
  mounted() {},
  methods: {
    loadProviders() {
      userApi.getOauthProviders().then((res) => {
        this.allProviders = res.data
        this.filterProviders()
      })
    },
    filterProviders() {
      if (this.allProviders?.length) {
        // filter out providers which do not support current language
        this.providers = this.allProviders.filter(
          (provider) => !provider.languages?.length || provider.languages.includes(this.lang)
        )
      }
    },
    startOauth(providerName) {
      userApi.getOauthLoginUrl(providerName).then((res) => {
        console.log('Redirecting to: ', res.data)
        window.location.href = res.data
      })
    }
  }
}
</script>

<style lang="less" scoped>
.oauth-logins-container {
  .provider-list {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 32px 0;

    .provider-item {
      cursor: pointer;
      margin: 0 16px;
      .provider-icon {
        width: 28px;
        height: 28px;
      }
    }
  }
}
</style>

<style lang="less">
.oauth-logins-container {
  .title {
    .el-divider__text {
      font-size: 13px;
      color: #999999;
    }
  }
}
</style>
