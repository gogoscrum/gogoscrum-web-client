<template>
  <div class="test-plan-statistics">
    <div v-for="status in Object.keys(dict.testRunStatuses)" class="summary-item">
      <TestRunStatusIcon :status="status" :showLabel="false" size="small" />
      <span class="ml-8px">{{ testPlan[`${status.toLowerCase()}Count`] || 0 }}</span>
    </div>
  </div>
</template>
<script>
import TestRunStatusIcon from '@/components/common/TestRunStatusIcon.vue'
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

  .summary-item {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: var(--el-text-color-secondary);

    &:not(:last-child) {
      margin-right: 32px;
    }
  }
}
</style>
