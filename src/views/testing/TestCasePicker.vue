<template>
  <el-drawer
    title="选取测试用例"
    v-model="drawerVisible"
    class="test-case-picker-drawer"
    @closed="$emit('casePickerClosed')"
    size="960">
    <test-case-list :picker-mode="true" :selectedCaseIds="selectedCaseIds" @caseSelected="handleCaseSelected" />
  </el-drawer>
</template>
<script>
import TestCaseList from './TestCaseList.vue'

export default {
  name: 'TestPlanEdit',
  components: {
    TestCaseList
  },
  emits: ['casePickerClosed', 'caseSelected'],
  props: {
    selectedCaseIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      drawerVisible: true
    }
  },
  created() {},
  mounted() {},
  methods: {
    handleCaseSelected(cases) {
      this.$emit('caseSelected', cases)
      this.drawerVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.test-case-picker-drawer {
  .test-case-list-page {
    padding: 0 10px;
  }
}
</style>

<style lang="less">
.test-case-picker-drawer {
  .el-drawer__header {
    margin-bottom: 10px;
  }
}
</style>
