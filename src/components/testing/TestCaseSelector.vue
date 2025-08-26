<template>
  <div class="test-case-selector">
    <el-select
      v-model="value"
      clearable
      filterable
      remote
      remote-show-suffix
      :placeholder="placeholder"
      value-key="id"
      :teleported="false"
      :remote-method="searchTestCase"
      :loading="searching"
      :no-data-text="$t('common.filter.noMatch')">
      <el-option v-if="totalElements > filter.pageSize" value="" class="too-many-match-warning">
        <el-icon class="mr-2"><WarningFilled /></el-icon>
        <span>{{ $t('common.filter.tooManyMatches') }}</span>
      </el-option>
      <el-option
        v-for="testCase in testCases"
        :key="testCase.id"
        :value="testCase"
        :label="`TC-${testCase.code} ${testCase.details.name}`">
        <div class="test-case-row">
          <el-tag type="info" class="code">TC-{{ testCase.code }}</el-tag>
          <div class="name" :title="testCase.details.name">{{ testCase.details.name }}</div>
        </div>
      </el-option>
      <template v-if="value?.code" #label="{ label, value }">
        <div class="test-case-row">
          <el-tag type="info" class="code">TC-{{ value.code }}</el-tag>
          <div class="name">{{ value.details?.name }}</div>
        </div>
      </template>
    </el-select>
  </div>
</template>

<script>
import { testCaseApi } from '@/api/testing.js'

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
      testCases: [],
      totalElements: 0
    }
  },
  mounted() {},
  methods: {
    searchTestCase(query) {
      this.filter.keyword = query
      this.filter.projectId = this.projectId

      this.searching = true
      testCaseApi
        .search(this.filter)
        .then((res) => {
          this.testCases = res.data.results
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
.test-case-selector {
  width: 100%;

  .test-case-row {
    display: flex;
    align-items: center;
    cursor: pointer;

    .code {
      font-weight: bold;
      white-space: nowrap;
    }

    .name {
      margin-left: 10px;
      max-width: 400px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}
</style>
<style lang="less">
.test-case-selector {
  .el-select-dropdown__wrap {
    max-height: 70vh;
    overflow-y: auto;
  }
}
</style>
