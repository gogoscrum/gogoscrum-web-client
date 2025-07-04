<template>
  <el-dialog
    :title="file.name"
    v-model="dialogVisible"
    top="5vh"
    :fullscreen="isInMobile"
    :draggable="true"
    @close="$emit('close')"
    class="pdf-viewer-dialog"
    width="960px">
    <VuePdfEmbed :source="file.url"></VuePdfEmbed>
  </el-dialog>
</template>
<script>
import utils from '@/utils/util.js'
import VuePdfEmbed from 'vue-pdf-embed'

export default {
  components: {
    VuePdfEmbed
  },
  props: {
    file: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  emits: ['closed'],
  data() {
    return {
      isInMobile: utils.isInMobile(),
      dialogVisible: true
    }
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style lang="less">
.pdf-viewer-dialog {
  .el-dialog__body {
    height: 78vh;
    overflow: scroll;
    padding-top: 0;
    padding-bottom: 5px;
  }

  .vue-pdf-embed > div {
    margin: 20px 0;
    box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  }
}
</style>
