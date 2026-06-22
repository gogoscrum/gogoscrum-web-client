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
      <template #header v-if="totalElements > filter.pageSize">
        <div class="too-many-match-warning">
          <el-icon class="mr-2"><WarningFilled /></el-icon>
          <span>{{ $t('common.filter.tooManyMatches') }}</span>
        </div>
      </template>
      <el-option
        v-for="testCase in testCases"
        :key="testCase.id"
        :value="testCase"
        :label="`TC-${testCase.code} ${testCase.details.name}`">
        <div class="test-case-row">
          <span class="code">TC-{{ testCase.code }}</span>
          <div class="name" :title="testCase.details.name">{{ testCase.details.name }}</div>
          <el-icon class="link-icon" :title="$t('common.details')" @click.stop="showCaseDetails(testCase.id)"
            ><Link
          /></el-icon>
        </div>
      </el-option>
      <template v-if="value?.code" #label="{ label, value }">
        <div class="test-case-row">
          <span class="code">TC-{{ value.code }}</span>
          <div class="name">{{ value.details?.name }}</div>
          <el-icon class="link-icon" :title="$t('common.details')" @click.stop="showCaseDetails(value.id)"
            ><Link
          /></el-icon>
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
    },
    showCaseDetails(testCaseId) {
      console.log('Show details for test case ID:', testCaseId)

      // Open the test case details in a new tab
      const url = this.$router.resolve({
        name: 'TestCaseDetails',
        params: { projectId: this.projectId, testCaseId }
      }).href
      window.open(url, '_blank')
    }
  }
}
</script>

<style lang="less" scoped>
.test-case-selector {
  width: 100%;
  display: flex;

  .test-case-row {
    display: flex;
    align-items: center;
    cursor: pointer;

    .code {
      color: #666666;
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

    .link-icon {
      visibility: hidden;
      margin-left: 10px;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    &:hover {
      .link-icon {
        visibility: visible;
      }
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

  .el-select__placeholder {
    z-index: 0;
  }
}
</style>
