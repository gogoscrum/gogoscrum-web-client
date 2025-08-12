<template>
  <div class="page homepage">
    <div class="header">
      <router-link :to="{ name: 'Homepage' }" class="logo-container">
        <img src="@/assets/images/logo-black.png" class="logo" />
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
    </div>
    <el-main class="body">
      <div class="section-outter">
        <el-row class="section higher">
          <el-col :xs="24" :sm="13" class="left-part">
            <div class="title">
              {{ $t('opensource.title') }}
            </div>
            <div class="content">
              {{ $t('opensource.intro') }}
            </div>
            <div class="flex">
              <el-button type="primary" plain size="large" class="start-to-use-btn smaller !mr-30px" @click="goGithub">
                <img src="@/assets/images/github.png" class="w-24px mr-2" />
                GitHub
              </el-button>
              <el-button type="primary" size="large" class="start-to-use-btn smaller" @click="goGitee">
                <img src="@/assets/images/gitee.png" class="w-24px mr-2" />
                Gitee</el-button
              >
            </div>
          </el-col>
          <el-col :xs="0" :sm="11" class="flex-container">
            <img src="@/assets/images/teamwork.jpg" class="main-img" />
          </el-col>
        </el-row>
      </div>
      <div class="section-outter">
        <el-row type="flex" align="middle" class="section">
          <el-col :xs="24" :sm="8">
            <img src="@/assets/images/download.png" class="screenshot-img live" />
          </el-col>
          <el-col :xs="{ span: 24, offset: 0 }" :sm="{ span: 12, offset: 2 }" class="intro first-order">
            <div class="sub-title center">{{ $t('opensource.download.title') }}</div>
            <div class="content" v-html="$t('opensource.download.intro')" />
            <el-button type="primary" plain size="large" class="start-to-use-btn" @click="goDownload">
              <img src="@/assets/images/download-icon.png" class="w-20px mr-4" />
              {{ $t('common.download') }}
            </el-button>
          </el-col>
        </el-row>
      </div>
      <div class="section-outter">
        <el-row type="flex" align="middle" class="section">
          <el-col :xs="24" :sm="12" class="intro">
            <div class="sub-title center">
              {{ $t('opensource.demo.title') }}
            </div>
            <div class="content" v-html="$t('opensource.demo.intro')" />
            <div class="content smaller" v-html="$t('opensource.demo.desc')" />
            <el-button type="primary" plain size="large" class="start-to-use-btn" icon="Monitor" @click="goDemo">
              {{ $t('opensource.demo.btnLable') }}
            </el-button>
          </el-col>
          <el-col :xs="{ span: 24, offset: 0 }" :sm="{ span: 11, offset: 1 }">
            <img src="@/assets/images/demo-site.jpg" class="screenshot-img live" />
          </el-col>
        </el-row>
      </div>
    </el-main>
    <el-footer class="footer mt-8 mb-4" height="40px">
      <div class="copy-right-row">
        <span>{{ $t('homepage.footer.company') }}</span>
        <el-popover
          v-if="lang === 'cn'"
          placement="right-end"
          width="250"
          trigger="hover"
          popper-class="qr-popover-container">
          <template #reference>
            <img src="@/assets/images/qr-icon.png" class="qr-code-img" />
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
  </div>
</template>

<script>
import utils from '@/utils/util.js'
import LanguageSelector from '@/components/common/LanguageSelector.vue'

export default {
  name: 'OpenSource',
  components: {
    LanguageSelector
  },
  data() {
    return {
      lang: localStorage['locale'] || utils.getLang(),
      isInMobile: utils.isInMobile()
    }
  },
  created() {
    if (this.lang !== 'cn') {
      utils.changeMetaForI18n()
    }
  },
  mounted() {
    if (this.$store.get('user')) {
      const user = this.$store.get('user')
      let userRecord = this.$store.get('lastBoard-' + user.id)
      if (!userRecord) {
        this.$router.push({ name: 'MyProjects' })
        return
      }
      const { projectId, sprintId } = userRecord
      this.$router.push({
        name: 'Board',
        params: { projectId, sprintId }
      })
    }
  },
  methods: {
    goGithub() {
      window.open('https://github.com/gogoscrum', '_blank')
    },
    goGitee() {
      window.open('https://gitee.com/gogoscrum', '_blank')
    },
    goDownload() {
      window.open('https://www.gogoscrum.com/downloads/gogoscrum-docker.zip', '_blank')
    },
    goDemo() {
      window.open('https://demo.gogoscrum.com/login', '_blank')
    },
    languageChanged(lang) {
      this.lang = lang
      utils.changeMetaForI18n()
    }
  }
}
</script>

<style lang="less">
.shop-popover-container.el-popover {
  text-align: center;
  font-size: 12px;
  color: #999999;

  .wechat-qr-img {
    width: 180px;
    height: 180px;
  }
}

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

<style lang="less" scoped>
.homepage {
  .header {
    min-height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-flow: wrap;
    padding: 0 20px;

    .logo-container {
      // margin: 10px 0;
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
        font-weight: 500;
        padding: 3px 12px;
        border-radius: 5px;
        margin-left: 10px;

        &:hover {
          background-color: #e7f5f3;
        }
      }

      .github-badge {
        display: flex;
        align-items: center;
        margin-right: 20px;

        img {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  .body {
    // height: calc(100vh - 100px);
    padding: 0;
    align-items: center;
    display: flex;
    flex-direction: column;

    .section-outter {
      display: flex;
      justify-content: center;
      width: 100%;

      &.stripped {
        background-color: #f5f5f5;

        .screenshot-img {
          background-color: #ffffff;
        }
      }
    }

    .title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 20px;
    }

    .sub-title {
      font-size: 32px;
      font-weight: normal;
      margin-bottom: 15px;
    }

    .content {
      font-size: 20px;
      color: #383838;
      font-weight: 300;
      margin: 20px 0;
      line-height: 1.6;

      &.smaller {
        font-size: 16px;
        // color: #666666;
      }
    }

    .row {
      display: flex;
      width: 90%;
    }

    .flex-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .board-screenshot {
      width: 75%;
      margin: 5% 4% 7% 4%;
    }

    .section {
      text-align: center;
      width: 80%;
      padding: 50px 0;
      min-height: 520px;
      display: flex;
      flex-wrap: wrap;

      &.wide {
        width: 90%;
      }

      .screenshot-img {
        width: calc(100% - 40px);
        padding: 20px;
        margin: 40px 0;
        // border-radius: 5px;
        // box-shadow: 0px 1px 16px 0px rgba(0, 0, 0, 0.1);
        // transition: transform 0.5s;

        // &.live {
        //   &:hover {
        //     transform: scale(1.2);
        //   }
        // }
      }
    }

    @media only screen and (max-width: 768px) {
      .section {
        min-height: 460px;
        padding: 30px 0;

        &.higher {
          min-height: 540px;
        }

        .first-order {
          order: -1;
        }
      }
    }

    .start-to-use-btn {
      background: unset !important;
      // background-color: var(--el-color-primary-light-9) !important;
      border: 1px solid #999999 !important;
      color: #333333;
      width: 200px;
      margin: 20px 0;
      font-size: 16px;
      font-weight: 700;

      &.smaller {
        width: 160px;
      }

      &:hover {
        background-color: #f5f5f5 !important;
        color: #333333;
      }
    }

    .left-part {
      // padding-left: 50px;
      margin: auto 0;
      display: flex;
      flex-direction: column;
      text-align: left;

      @media only screen and (max-width: 768px) {
        text-align: center;
        align-items: center;
        // .start-to-use-btn {
        //   margin-left: 0;
        // }
      }
    }

    // .right-part {
    //   text-align: center;
    // }

    .main-img {
      width: 80%;
    }

    .container {
      display: flex;
    }
  }

  .footer {
    justify-content: center;
    text-align: center;
    font-size: 12px;
    color: #cccccc;
    font-weight: bold;

    .copy-right-row {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qr-code-img {
      margin-left: 20px;
      width: 12px;
      height: 12px;
      cursor: pointer;
      opacity: 60%;
    }

    .icp {
      font-weight: normal;
      margin: 5px 0;
      a {
        color: #cccccc;
      }
    }
  }
}
</style>
