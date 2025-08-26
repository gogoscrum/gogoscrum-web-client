<template>
  <div class="test-plan-selector">
    <el-select
      v-model="value"
      clearable
      filterable
      remote
      remote-show-suffix
      :placeholder="placeholder || $t('test.plan.selector.placeholder')"
      value-key="id"
      :teleported="false"
      :disabled="disabled"
      :remote-method="searchTestPlan"
      :loading="searching"
      :no-data-text="$t('common.filter.noMatch')">
      <el-option v-if="totalElements > filter.pageSize" value="" class="too-many-match-warning">
        <el-icon class="mr-2"><WarningFilled /></el-icon>
        <span>{{ $t('common.filter.tooManyMatches') }}</span>
      </el-option>
      <el-option v-for="testPlan in testPlans" :key="testPlan.id" :value="testPlan" :label="testPlan.name">
        <div class="test-plan-row">
          <div class="name" :title="testPlan.name">{{ testPlan.name }}</div>
        </div>
      </el-option>
      <template #label="{ label, value }">
        <div class="test-plan-row">
          <div class="name">{{ value.name }}</div>
        </div>
      </template>
    </el-select>
  </div>
</template>

<script>
import { testPlanApi } from '@/api/testing.js'

export default {
  components: {},
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    projectId: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
        this.$emit('change', value)
      }
    }
  },
  data() {
    return {
      filter: {
        projectId: null,
        pageSize: 50,
        keyword: ''
      },
      searching: false,
      testPlans: [],
      totalElements: 0
    }
  },
  mounted() {},
  methods: {
    searchTestPlan(query) {
      this.filter.keyword = query
      this.filter.projectId = this.projectId

      this.searching = true
      testPlanApi
        .search(this.filter)
        .then((res) => {
          this.testPlans = res.data.results
          this.totalElements = res.data.totalElements
        })
        .finally(() => {
          this.searching = false
        })
    }
  }
}
</script>

<style lang="less" scoped>
.test-plan-selector {
  width: 100%;

  .test-plan-row {
    display: flex;
    align-items: center;
    cursor: pointer;

    .name {
      max-width: 400px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}
</style>
<style lang="less">
.test-plan-selector {
  .el-select-dropdown__wrap {
    max-height: 70vh;
    overflow-y: auto;
  }
}
</style>
