<template>
  <div class="test-run-status-icon-container">
    <div v-if="status" class="flex items-center" :title="$t(`testRunStatuses.${status}`)">
      <el-icon :class="`status-icon ${status}`">
        <SuccessFilled v-if="status === 'SUCCESS'" />
        <CircleCloseFilled v-else-if="status === 'FAILED'" />
        <RemoveFilled v-else-if="status === 'BLOCKED'" />
        <WarningFilled v-else-if="status === 'SKIPPED'" />
      </el-icon>
      <div class="status-label">{{ $t(`testRunStatuses.${status}`) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      default: null
    }
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="less" scoped>
.test-run-status-icon-container {
  .status-icon {
    font-size: 18px;
  }

  .FAILED {
    color: red;
  }

  .BLOCKED {
    color: rgb(255, 153, 0);
  }

  .SUCCESS {
    color: rgb(9, 170, 4);
  }

  .SKIPPED {
    color: rgb(161, 165, 161);
  }

  .status-label {
    margin-left: 8px;
  }
}
</style>
