<template>
  <div class="language-selector cursor-pointer">
    <el-dropdown size="default" trigger="click" @command="languageChanged">
      <div class="flex items-center">
        <span class="iconfont icon-earth global-icon hidden-xs-only"></span>
        <span class="el-dropdown-link">
          {{ lang === 'en' ? `${isInMobile ? 'EN' : 'English'}` : `${isInMobile ? '中' : '中文'}` }}
        </span>
        <el-icon class="text-xs"><CaretBottom /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="cn">中文</el-dropdown-item>
          <el-dropdown-item command="en">English</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import utils from '@/utils/util.js'

export default {
  props: {},
  data() {
    return {
      lang: null,
      isInMobile: utils.isInMobile()
    }
  },
  created() {
    this.lang = localStorage['locale'] || utils.getLang()
    document.body.className = this.lang
  },
  methods: {
    languageChanged(langSelected) {
      if (langSelected != this.lang) {
        this.lang = langSelected
        this.$i18n.locale = langSelected
        localStorage['locale'] = langSelected
        document.body.className = langSelected
        this.$emit('languageChanged', langSelected)
        this.$bus.$emit('languageChanged', langSelected)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.language-selector {
  font-size: 12px !important;
  font-weight: normal !important;
  text-align: right;
  display: flex;

  .global-icon {
    margin-right: 6px;
    line-height: 20px;
    opacity: 0.9;
  }
}
</style>
