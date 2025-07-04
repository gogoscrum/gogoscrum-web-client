<template>
  <div :class="`issue-fast-editor ${newIssue.type}`">
    <el-input
      ref="issueDescribe"
      type="textarea"
      v-model="newIssue.name"
      :placeholder="$t('issueFastEdit.namePlaceholder')"
      maxlength="500"
      :autosize="{ minRows: 2 }"
      resize="none"
      @keydown.ctrl.enter="createIssue"
      @keydown.esc="cancelEditing"></el-input>
    <div class="issue-type">
      <issue-type-selector v-model="newIssue.type"></issue-type-selector>
      <el-button
        class="create-issue-btn"
        type="primary"
        size="small"
        :loading="submitting"
        :disabled="!(newIssue.name && newIssue.type)"
        :title="$t('common.msg.shortcutKeys')"
        @click.stop="createIssue()"
        >{{ $t('common.create') }}</el-button
      >
    </div>
  </div>
</template>

<script>
import { issueApi } from '@/api/issue.js'
import IssueTypeIcon from '@/components/common/IssueTypeIcon.vue'
import IssueTypeSelector from '@/components/common/IssueTypeSelector.vue'
import dicts from '@/locales/zh-cn/dict.json'
import { ElMessage } from 'element-plus'
export default {
  components: {
    IssueTypeIcon,
    IssueTypeSelector
  },
  props: {
    issue: {
      type: Object,
      default: () => {
        return {}
      }
    },
    projectId: {
      type: String,
      default: () => {
        return ''
      }
    }
  },
  data() {
    return {
      dicts: dicts,
      newIssue: {},
      submitting: false
    }
  },
  mounted() {
    this.$bus.$on('baseLayoutClicked', (event) => {
      this.hideIssueEdit(event)
    })
    this.$refs.issueDescribe.focus()
    this.newIssue = JSON.parse(JSON.stringify(this.issue))
    this.newIssue.projectId = this.projectId
  },
  methods: {
    createIssue() {
      this.submitting = true
      issueApi
        .create(this.newIssue)
        .then((res) => {
          this.$emit('confirm', res.data)
          ElMessage.success({
            message: this.$t('issueFastEdit.msg.created')
          })
          this.submitting = false
        })
        .catch(() => {
          this.submitting = false
        })
    },
    cancelEditing(event) {
      this.newIssue = {}
      this.$emit('close')
    },
    hideIssueEdit(e) {
      let issueFastEdit = document.getElementsByClassName('issue-fast-editor')[0]
      if (issueFastEdit && !this.newIssue.name) {
        if (!issueFastEdit.contains(e.target)) {
          this.$emit('close')
        }
      }
    }
  }
}
</script>

<style lang="less">
.issue-fast-editor {
  .issue-type {
    .el-select {
      width: 125px;

      .el-select__wrapper {
        border: none;
        box-shadow: unset !important;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.issue-fast-editor {
  padding: 5px;
  border: solid 1px #f0f0f0;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 16px 10px -20px;
  background: #ffffff;
  border-radius: 4px;
  margin-bottom: 6px;
  font-size: 13px;
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.45) 0px 16px 16px -20px;
  }
  .issue-type {
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 10px;
    .create-issue-btn {
      margin-left: auto;
    }
  }
}
</style>
