<template>
  <div class="doc-view-page">
    <div class="header">
      <div class="title">{{ doc.name }}</div>
    </div>
    <div class="body" v-html="doc.content"></div>
    <div class="desc">{{ lastSavedTip }}</div>
  </div>
</template>

<script>
import { docApi } from '@/api/doc.js'
import utils from '@/utils/util'

export default {
  name: 'DocView',
  components: {},
  data() {
    return {
      doc: {
        name: '',
        content: ''
      }
    }
  },
  computed: {
    lastSavedTip() {
      if (!this.doc.createdBy) return ''

      return this.doc.createdTime === this.doc.updateTime
        ? this.$t('common.msg.createdTip', {
            nickname: this.doc.createdBy.nickname,
            time: this.doc.createdTimeFormatted
          })
        : this.$t('common.msg.updatedTip', {
            nickname: this.doc.updatedBy.nickname,
            time: this.doc.updatedTimeFormatted
          })
    }
  },
  created() {
    this.loadDoc(this.$route.params.docId)
  },
  mounted() {},
  methods: {
    loadDoc() {
      docApi.getByIdReadOnly(this.$route.params.docId).then((res) => {
        this.doc = this.formatDoc(res.data)
      })
    },
    formatDoc(doc) {
      return utils.formatCreateUpdateTime(doc)
    }
  }
}
</script>

<style lang="less" scoped>
.doc-view-page {
  width: 90%;
  max-width: 960px;
  margin: 0 auto 50px auto;

  .header {
    margin: 50px 0;

    .title {
      font-size: 22px;
      font-weight: bold;
      margin: 10px 0;
      text-align: center;
    }
  }

  .body {
    margin-bottom: 30px;
  }
}
</style>

<style lang="less">
.doc-view-page {
  .body {
    img {
      max-width: 100%;
      height: auto;
    }
  }
}
</style>
