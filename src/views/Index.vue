<template>
  <div class="page homepage">
    <div class="section-outter">
      <el-row class="section higher">
        <el-col :xs="24" :sm="13" class="left-part">
          <div class="title">
            {{ $t('common.slogan') }}
          </div>
          <div class="content">
            {{ $t('homepage.intro') }}
          </div>
          <el-button type="primary" size="large" class="start-to-use-btn" @click="login">{{
            $t('homepage.start')
          }}</el-button>
        </el-col>
        <el-col :xs="0" :sm="11" class="flex-container">
          <img src="/power-of-teamwork.png" class="main-img" />
        </el-col>
      </el-row>
    </div>
    <div class="section-outter">
      <el-row class="section wide">
        <el-col :span="24">
          <div class="sub-title">{{ $t('homepage.board.title') }}</div>
          <div class="content">
            {{ $t('homepage.board.intro') }}
          </div>
          <div class="laptop-frame">
            <img :src="`/${lang}/board-sticky-notes.png`" class="board-screenshot" />
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="section-outter stripped">
      <el-row type="flex" align="middle" class="section">
        <el-col :xs="24" :sm="12">
          <img :src="`/${lang}/issue.png`" class="screenshot-img live" />
        </el-col>
        <el-col :xs="{ span: 24, offset: 0 }" :sm="{ span: 10, offset: 2 }" class="intro first-order">
          <div class="sub-title center">{{ $t('homepage.issue.title') }}</div>
          <div class="content">
            {{ $t('homepage.issue.intro') }}
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="section-outter">
      <el-row type="flex" align="middle" class="section">
        <el-col :xs="24" :sm="6" class="intro">
          <div class="sub-title center">
            {{ $t('homepage.backlog.title') }}
          </div>
          <div class="content">
            {{ $t('homepage.backlog.intro') }}
          </div>
        </el-col>
        <el-col :xs="{ span: 24, offset: 0 }" :sm="{ span: 17, offset: 1 }">
          <img :src="`/${lang}/backlog.png`" class="screenshot-img live" />
        </el-col>
      </el-row>
    </div>
    <div class="section-outter stripped">
      <el-row type="flex" align="middle" class="section">
        <el-col :xs="24" :sm="17">
          <img :src="`/${lang}/files.png`" class="screenshot-img live" />
        </el-col>
        <el-col :xs="{ span: 24, offset: 0 }" :sm="{ span: 6, offset: 1 }" class="intro first-order">
          <div class="sub-title center">{{ $t('homepage.file.title') }}</div>
          <div class="content">
            {{ $t('homepage.file.intro') }}
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="section-outter">
      <el-row type="flex" align="middle" class="section">
        <el-col :xs="24" :sm="6" class="intro">
          <div class="sub-title center">
            {{ $t('homepage.doc.title') }}
          </div>
          <div class="content">
            {{ $t('homepage.doc.intro') }}
          </div>
        </el-col>
        <el-col :xs="{ span: 24, offset: 0 }" :sm="{ span: 17, offset: 1 }">
          <img :src="`/${lang}/documents.png`" class="screenshot-img live" />
        </el-col>
      </el-row>
    </div>
    <div class="section-outter stripped">
      <el-row type="flex" align="middle" class="section">
        <el-col :xs="24" :sm="17">
          <img :src="`/${lang}/burndown.png`" class="screenshot-img live" />
        </el-col>
        <el-col :xs="{ span: 24, offset: 0 }" :sm="{ span: 6, offset: 1 }" class="intro first-order">
          <div class="sub-title center">{{ $t('homepage.chart.title') }}</div>
          <div class="content">
            {{ $t('homepage.chart.intro') }}
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="section-outter">
      <el-row type="flex" justify="center" align="middle" class="section higher">
        <div :span="24" class="intro">
          <div class="title">{{ $t('homepage.startnow.title') }}</div>
          <div class="content">{{ $t('homepage.startnow.intro') }}</div>
          <div class="button-container margin-top center">
            <el-button type="primary" size="large" class="start-to-use-btn" @click="login">{{
              $t('homepage.start')
            }}</el-button>
          </div>
        </div>
      </el-row>
    </div>
  </div>
</template>

<script>
import utils from '@/utils/util.js'
// import LanguageSelector from '@/components/common/LanguageSelector.vue'
export default {
  name: 'Homepage',
  components: {
    // LanguageSelector
  },
  data() {
    return {
      lang: localStorage['locale'] || utils.getLang()
      // isInMobile: utils.isInMobile()
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
      let lastBoard = this.$store.get('lastBoard-' + user.id)
      if (!lastBoard) {
        this.$router.push({ name: 'MyProjects' })
      } else {
        const { projectId, sprintId } = lastBoard
        this.$router.push({
          name: 'Board',
          params: { projectId, sprintId }
        })
      }
    }
  },
  methods: {
    login() {
      this.$router.push({ name: 'Login' })
    }
  }
}
</script>

<!-- <style lang="less">
.qr-popover-container.el-popover {
  text-align: center;
  font-size: 12px;
  color: #999999;

  .wechat-qr-img {
    width: 180px;
    height: 180px;
  }
}
</style> -->

<style lang="less" scoped>
.homepage {
  // .header {
  //   min-height: 60px;
  //   display: flex;
  //   justify-content: space-between;
  //   align-items: center;
  //   flex-flow: wrap;
  //   padding: 0 20px;

  //   .logo-container {
  //     display: flex;

  //     @media only screen and (max-width: 520px) {
  //       margin: 20px auto;
  //     }
  //   }

  //   .logo {
  //     height: 36px;
  //   }

  //   .links-container {
  //     display: flex;
  //     align-items: center;
  //     align-content: center;

  //     @media only screen and (max-width: 520px) {
  //       margin: 0 auto;
  //     }

  //     .link-item {
  //       font-size: 16px;
  //       font-weight: 500;
  //       padding: 3px 12px;
  //       border-radius: 5px;
  //       margin-left: 10px;

  //       &:hover {
  //         background-color: #e7f5f3;
  //       }
  //     }

  //     .github-badge {
  //       display: flex;
  //       align-items: center;
  //       margin-right: 20px;

  //       img {
  //         width: 20px;
  //         height: 20px;
  //       }
  //     }
  //   }
  // }

  // .body {
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
    margin-bottom: 15px;
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
    margin: 10px 0;
    line-height: 1.6;
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

  .laptop-frame {
    width: 100%;
    margin-top: 50px;
    background: no-repeat url('/laptop-frame.png');
    background-size: 100% 100%;
    background-position: center;
  }

  .board-screenshot {
    width: 75%;
    margin: 5% 4% 7% 4%;
  }

  .section {
    text-align: center;
    width: 80%;
    padding: 50px 0;
    min-height: 600px;
    display: flex;
    flex-wrap: wrap;

    &.wide {
      width: 90%;
    }

    .screenshot-img {
      width: calc(100% - 40px);
      padding: 20px;
      margin: 40px 0;
      border-radius: 5px;
      box-shadow: 0px 1px 16px 0px rgba(0, 0, 0, 0.1);
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
    width: 200px;
    margin: 20px 0;
    font-size: 16px;
    font-weight: 700;
  }

  .left-part {
    margin: auto 0;
    display: flex;
    flex-direction: column;
    text-align: left;

    @media only screen and (max-width: 768px) {
      text-align: center;
      align-items: center;
    }
  }

  .main-img {
    width: 80%;
  }

  .container {
    display: flex;
  }
  // }

  // .footer {
  //   justify-content: center;
  //   text-align: center;
  //   font-size: 12px;
  //   color: #cccccc;
  //   font-weight: bold;

  //   .copy-right-row {
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //   }

  //   .qr-code-img {
  //     margin-left: 20px;
  //     width: 12px;
  //     height: 12px;
  //     cursor: pointer;
  //     opacity: 60%;
  //   }
  // }
}
</style>
