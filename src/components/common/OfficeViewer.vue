<template>
  <div class="office-viewer">
    <el-dialog
      :title="file.name"
      v-model="dialogVisible"
      top="5vh"
      :fullscreen="isInMobile"
      :draggable="true"
      @close="$emit('close')"
      width="960px">
      <iframe :src="`${srcPrefix}${file.url}`"></iframe>
    </el-dialog>
  </div>
</template>
<script>
import utils from '@/utils/util.js'

export default {
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
      dialogVisible: true,
      srcPrefix: 'https://view.officeapps.live.com/op/view.aspx?src='
    }
  },
  created() {},
  mounted() {
    console.log('Trying to view Office file:', this.file.url)
  },
  methods: {}
}
</script>

<style lang="less">
.office-viewer {
  .el-dialog__body {
    height: 78vh;
    overflow: scroll;
    padding-top: 0;
    padding-bottom: 10px;
  }

  iframe {
    width: 100%;
    height: calc(78vh - 10px);
    border: none;
  }
}
</style>
