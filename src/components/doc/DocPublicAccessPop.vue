<template>
  <div class="doc-public-access-pop">
    <el-popover :width="doc.publicAccess ? '450px' : 'auto'" placement="bottom-end">
      <template #reference>
        <slot name="reference"></slot>
      </template>
      <div>{{ $t('docView.msg.publicAccessTip') }}</div>
      <div v-if="doc.publicAccess" class="mt-2">
        <el-input type="textarea" v-model="publicAccessUrl" :rows="2" readonly> </el-input>
        <div class="mt-2 text-right">
          <el-button type="primary" text bg size="small" @click="previewPublicAccessUrl()">
            {{ $t('common.preview') }}
          </el-button>
          <el-button type="primary" size="small" @click="copyPublicAccessUrl()">
            {{ $t('common.copy') }}
          </el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'DocPublicAccessPop',
  props: {
    doc: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    publicAccessUrl() {
      if (this.doc.publicAccess) {
        return `${location.origin}/docs/view/${this.doc.id}`
      } else {
        return ''
      }
    }
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {
    copyPublicAccessUrl() {
      navigator.clipboard.writeText(this.publicAccessUrl).then(() => {
        this.$message.success(this.$t('common.msg.copiedSuccess'))
      })
    },
    previewPublicAccessUrl() {
      window.open(this.publicAccessUrl, '_blank')
    }
  }
}
</script>

<style lang="less" scoped></style>
