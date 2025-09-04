<template>
  <div class="opensource-page">
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
          <img src="@/assets/images/teamwork.jpg" class="w-80%" />
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
  </div>
</template>

<script>
export default {
  name: 'OpenSource',
  components: {},
  data() {
    return {}
  },
  created() {},
  mounted() {},
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
    }
  }
}
</script>

<style lang="less" scoped>
.opensource-page {
  padding: 0;
  align-items: center;
  display: flex;
  flex-direction: column;

  .section-outter {
    display: flex;
    justify-content: center;
    width: 100%;
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
    margin: auto 0;
    display: flex;
    flex-direction: column;
    text-align: left;

    @media only screen and (max-width: 768px) {
      text-align: center;
      align-items: center;
    }
  }
}
</style>
