<template>
  <el-container class="public-layout-container">
    <el-header class="header">
      <router-link :to="{ name: 'Homepage' }" class="logo-container">
        <img src="/src/assets/images/logo-black.png" class="logo" />
      </router-link>
      <div class="links-container">
        <a
          v-if="!isInMobile"
          href="https://github.com/gogoscrum/gogoscrum-rest-service"
          target="_blank"
          class="github-badge">
          <el-image
            src="https://img.shields.io/github/stars/gogoscrum/gogoscrum-rest-service?style=flat&logo=github&color=0d9c89">
            <template #error>
              <!-- If cannot access Github, just don't show the badge. -->
              <span></span>
            </template>
          </el-image>
        </a>
        <div class="link-item">
          <router-link :to="{ name: 'Login' }">{{ $t('homepage.header.signin') }}</router-link>
        </div>
        <div class="link-item">
          <router-link :to="{ name: 'Register' }">{{ $t('homepage.header.signup') }}</router-link>
        </div>
        <div class="link-item">
          <router-link :to="{ name: 'OpenSource' }">{{ $t('homepage.header.opensource') }}</router-link>
        </div>
        <LanguageSelector class="link-item" @languageChanged="languageChanged" />
      </div>
    </el-header>
    <el-main class="body">
      <router-view />
    </el-main>
    <el-footer class="footer">
      <div class="copy-right-row">
        <span>{{ $t('homepage.footer.company') }}</span>
        <el-popover
          v-if="lang === 'cn'"
          placement="right-end"
          width="220"
          trigger="hover"
          popper-class="qr-popover-container">
          <template #reference>
            <img src="@/assets/images/qr-icon.png" class="qr-code-icon" />
          </template>
          <template #default>
            <div>
              <img
                src="https://gogoscrum.oss-cn-hangzhou.aliyuncs.com/materials/wechat-qr-user-group.png"
                class="wechat-qr-img" />
            </div>
            <span>微信扫描二维码，<br />加入gogoscrum用户交流群</span>
          </template>
        </el-popover>
      </div>
    </el-footer>
  </el-container>
</template>

<script>
import utils from '@/utils/util'
import LanguageSelector from '@/components/common/LanguageSelector.vue'

export default {
  name: 'PublicLayout',
  components: {
    LanguageSelector
  },
  data() {
    return {}
  },
  computed: {
    isInMobile() {
      return utils.isInMobile()
    },
    lang() {
      return localStorage['locale'] || utils.getLang()
    }
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    languageChanged(lang) {
      this.lang = lang
      utils.changeMetaForI18n()
    }
  }
}
</script>

<style lang="less" scoped>
.public-layout-container {
  .header {
    min-height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-flow: wrap;
    padding: 0 20px;

    .logo-container {
      display: flex;

      @media only screen and (max-width: 520px) {
        margin: 20px auto;
      }
    }

    .logo {
      height: 36px;
    }

    .links-container {
      display: flex;
      align-items: center;
      align-content: center;

      @media only screen and (max-width: 520px) {
        margin: 0 auto;
      }

      .link-item {
        font-size: 16px;
        font-weight: bold;
        padding: 3px 12px;
        border-radius: 5px;
        margin-left: 10px;

        &:hover {
          background-color: var(--el-color-primary-light-9);
        }
      }

      .github-badge {
        display: flex;
        align-items: center;
        margin-right: 30px;

        img {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  .body {
    min-height: calc(100vh - 100px);
  }

  .footer {
    justify-content: center;
    text-align: center;
    font-size: 12px;
    color: #cccccc;
    font-weight: bold;
    margin: 10px 0;
    height: unset;

    .copy-right-row {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qr-code-icon {
      margin-left: 20px;
      width: 12px;
      height: 12px;
      cursor: pointer;
      opacity: 60%;
    }
  }
}
</style>

<style lang="less">
.qr-popover-container.el-popover {
  text-align: center;
  font-size: 12px;
  color: #999999;

  .wechat-qr-img {
    width: 180px;
    height: 180px;
  }
}
</style>
