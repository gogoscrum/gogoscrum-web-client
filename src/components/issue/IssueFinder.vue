<template>
  <div class="issue-finder-container">
    <el-select
      filterable
      remote
      size="small"
      class="w-40 mx-2"
      placeholder=" "
      value-key="id"
      ref="issueSelect"
      :teleported="false"
      :default-first-option="true"
      :remote-method="searchIssue"
      :loading="searching"
      :no-data-text="$t('issueFinder.noMatch')"
      @change="change"
      @blur="blur">
      <el-option v-if="totalElements > pageSize" value="0" class="too-many-match-warning">
        <el-icon class="mr-2"><WarningFilled /></el-icon>
        <span>{{ $t('issueFinder.tooManyMatches') }}</span>
      </el-option>
      <el-option v-for="issue in issues" :key="issue.id" :value="issue">
        <div class="issue-row">
          <issue-type-icon :type="issue.type" />
          <div class="code">{{ issue.code }}</div>
          <div class="name">{{ issue.name }}</div>
        </div></el-option
      >
    </el-select>
  </div>
</template>

<script>
import IssueTypeIcon from '@/components/common/IssueTypeIcon.vue'
import { issueApi } from '@/api/issue.js'

export default {
  components: {
    IssueTypeIcon
  },
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  emits: ['change', 'blur'],
  data() {
    return {
      pageSize: 50,
      searching: false,
      issues: [],
      totalElements: 0
    }
  },
  mounted() {
    this.$refs.issueSelect.focus()
  },
  methods: {
    searchIssue(query) {
      if (query && this.projectId) {
        this.searching = true
        issueApi
          .searchIssues({ projectId: this.projectId, keyword: query, pageSize: this.pageSize })
          .then((res) => {
            this.issues = res.data.results
            this.totalElements = res.data.totalElements
          })
          .finally(() => {
            this.searching = false
          })
      }
    },
    change(issue) {
      if (issue?.id) {
        this.$emit('change', issue)
      }
      this.reset()
    },
    blur() {
      // Defer the emit otherwise the click on an option will not trigger the change event of the select
      setTimeout(() => {
        this.$emit('blur')
        this.reset()
      }, 150)
    },
    reset() {
      this.searching = false
      this.issues = []
      this.totalElements = 0
    }
  }
}
</script>

<style lang="less" scoped>
.issue-finder-container {
  .too-many-match-warning {
    display: flex;
    align-items: center;
    color: orange;
  }
  .issue-row {
    display: flex;
    align-items: center;
    cursor: pointer;

    .issue-type-icon-container {
      margin-right: 10px;
    }

    .code {
      color: var(--el-color-primary);
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

  .el-select-dropdown__wrap {
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>
<style lang="less">
.el-select-dropdown__wrap {
  max-height: 70vh;
}
</style>
