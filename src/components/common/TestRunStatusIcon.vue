<template>
  <div :class="`test-run-status-icon-container ${size}`">
    <div v-if="status" class="flex items-center" :title="$t(`testRunStatuses.${status}`)">
      <el-tooltip :content="$t(`testRunStatuses.${status}`)" :disabled="showLabel" placement="top">
        <el-icon :class="`status-icon ${status}`">
          <SuccessFilled v-if="status === 'SUCCESS'" />
          <CircleCloseFilled v-else-if="status === 'FAILED'" />
          <RemoveFilled v-else-if="status === 'BLOCKED'" />
          <WarningFilled v-else-if="status === 'SKIPPED'" /> </el-icon
      ></el-tooltip>
      <div v-if="showLabel" class="status-label">{{ $t(`testRunStatuses.${status}`) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      default: null
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'default'
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

  &.small {
    .status-icon {
      font-size: 16px;
    }
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
