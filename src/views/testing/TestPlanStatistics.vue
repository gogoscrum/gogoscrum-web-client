<template>
  <div class="test-plan-statistics" :class="{ tight: tight, vertical: vertical, showLabel: showLabel }">
    <div v-for="status in Object.keys(dict.testRunStatuses)" class="summary-item">
      <TestRunStatusIcon
        :status="status"
        :showLabel="showLabel"
        :dummy="testPlan[`${status.toLowerCase()}Count`] <= 0"
        size="small" />
      <span class="ml-4px min-w-26px">{{ testPlan[`${status.toLowerCase()}Count`] || 0 }}</span>
    </div>
  </div>
</template>
<script>
import TestRunStatusIcon from '@/components/testing/TestRunStatusIcon.vue'
import dict from '@/locales/zh-cn/dict.json'

export default {
  name: 'TestPlanStatistics',
  components: {
    TestRunStatusIcon
  },
  emits: [],
  props: {
    testPlan: {
      type: Object,
      default: () => ({})
    },
    tight: {
      type: Boolean,
      default: false
    },
    vertical: {
      type: Boolean,
      default: false
    },
    showLabel: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dict: dict
    }
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style lang="less" scoped>
.test-plan-statistics {
  display: flex;

  &.vertical {
    flex-direction: column;

    .summary-item {
      margin: 4px 0;
    }
  }

  .summary-item {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: var(--el-text-color-secondary);

    &:not(:last-child) {
      margin-right: 12px;
    }
  }

  &.tight {
    .summary-item {
      &:not(:last-child) {
        margin-right: 4px;
      }
    }
  }
}
</style>
